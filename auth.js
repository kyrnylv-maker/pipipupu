/* ═══════════════════════════════════════════
   auth.js — Authentication & Profile
════════════════════════════════════════════ */

const Auth = (() => {
  let _currentUser = null;

  function getCurrentUser() { return _currentUser; }
  function setCurrentUser(u) { _currentUser = u; }

  /* ── Init: restore session ── */
  async function init() {
    const token = API.getToken();
    if (!token) return false;
    try {
      const user = await API.auth.me();
      _currentUser = user;
      return true;
    } catch (err) {
      if (err.status === 401) API.setToken(null);
      return false;
    }
  }

  /* ── Login ── */
  async function login(username, password) {
    const res = await API.auth.login(username, password);
    const token = res.token || res.access_token || res.data?.token;
    if (!token) throw new Error('No token in response');
    API.setToken(token);
    // Fetch user profile
    _currentUser = await API.auth.me();
    return _currentUser;
  }

  /* ── Register ── */
  async function register({ first_name, last_name, username, password }) {
    const res = await API.auth.register({ first_name, last_name, username, password });
    const token = res.token || res.access_token || res.data?.token;
    if (!token) throw new Error('No token in response');
    API.setToken(token);
    _currentUser = await API.auth.me();
    return _currentUser;
  }

  /* ── Logout ── */
  async function logout() {
    try { await API.auth.logout(); } catch {}
    API.setToken(null);
    _currentUser = null;
    WS.disconnect();
  }

  /* ── Update profile ── */
  async function updateProfile(data) {
    const res = await API.users.update(data);
    _currentUser = { ..._currentUser, ...res };
    return _currentUser;
  }

  /* ── Upload avatar ── */
  async function uploadAvatar(file, onProgress) {
    const res = await API.users.uploadAvatar(file, onProgress);
    _currentUser = { ..._currentUser, ...res };
    return _currentUser;
  }

  /* ─────────────────────────────────────────
     UI Bindings
  ───────────────────────────────────────── */
  function bindAuthUI() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      });
    });

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          btn.querySelector('svg').style.opacity = '0.5';
        } else {
          input.type = 'password';
          btn.querySelector('svg').style.opacity = '1';
        }
      });
    });

    // Username check on register
    let usernameCheckTimer;
    document.getElementById('reg-username').addEventListener('input', (e) => {
      clearTimeout(usernameCheckTimer);
      const val = e.target.value.trim();
      const check = document.getElementById('username-check');
      const ok = check.querySelector('.check-ok');
      const fail = check.querySelector('.check-fail');
      ok.classList.add('hidden');
      fail.classList.add('hidden');
      if (!val) { check.classList.add('hidden'); return; }
      check.classList.remove('hidden');
      usernameCheckTimer = setTimeout(async () => {
        try {
          await API.users.search(val);
          ok.classList.remove('hidden');
        } catch {
          fail.classList.remove('hidden');
        }
      }, 500);
    });

    // Login button
    document.getElementById('btn-login').addEventListener('click', async () => {
      const btn = document.getElementById('btn-login');
      const err = document.getElementById('login-error');
      const username = document.getElementById('login-username').value.trim().replace('@', '');
      const password = document.getElementById('login-password').value;
      if (!username || !password) { showFormError(err, 'Заполните все поля'); return; }
      setButtonLoading(btn, true);
      err.classList.add('hidden');
      try {
        await login(username, password);
        App.navigateTo('app');
      } catch (e) {
        const msg = e.data?.message || e.data?.error || 'Неверный логин или пароль';
        showFormError(err, msg);
      } finally {
        setButtonLoading(btn, false);
      }
    });

    // Enter key login
    ['login-username', 'login-password'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('btn-login').click();
      });
    });

    // Register button
    document.getElementById('btn-register').addEventListener('click', async () => {
      const btn = document.getElementById('btn-register');
      const err = document.getElementById('register-error');
      const first_name = document.getElementById('reg-firstname').value.trim();
      const last_name = document.getElementById('reg-lastname').value.trim();
      const username = document.getElementById('reg-username').value.trim();
      const password = document.getElementById('reg-password').value;
      if (!first_name || !username || !password) { showFormError(err, 'Заполните обязательные поля'); return; }
      if (password.length < 6) { showFormError(err, 'Пароль минимум 6 символов'); return; }
      setButtonLoading(btn, true);
      err.classList.add('hidden');
      try {
        await register({ first_name, last_name, username, password });
        App.navigateTo('app');
      } catch (e) {
        const msg = e.data?.message || e.data?.error || 'Ошибка регистрации';
        showFormError(err, msg);
      } finally {
        setButtonLoading(btn, false);
      }
    });

    // Settings modal bindings
    document.getElementById('btn-settings').addEventListener('click', () => {
      openSettings();
    });
    document.getElementById('btn-save-settings').addEventListener('click', saveSettings);
    document.getElementById('btn-logout').addEventListener('click', async () => {
      await logout();
      App.navigateTo('auth');
    });

    // Avatar upload
    document.getElementById('avatar-upload-trigger').addEventListener('click', () => {
      document.getElementById('avatar-file').click();
    });
    document.getElementById('avatar-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        UI.showToast('Загружаем фото…');
        const user = await uploadAvatar(file, (pct) => console.log('Upload:', pct + '%'));
        UI.updateSidebarUser(user);
        UI.setAvatarEl(document.getElementById('settings-avatar'), user);
        UI.showToast('Фото обновлено!', 'success');
      } catch {
        UI.showToast('Ошибка загрузки', 'error');
      }
    });
  }

  function openSettings() {
    const user = _currentUser;
    if (!user) return;
    document.getElementById('settings-firstname').value = user.first_name || '';
    document.getElementById('settings-lastname').value = user.last_name || '';
    document.getElementById('settings-username').value = user.username || '';
    document.getElementById('settings-bio').value = user.bio || user.about || '';
    UI.setAvatarEl(document.getElementById('settings-avatar'), user);
    UI.openModal('modal-settings');
  }

  async function saveSettings() {
    const btn = document.getElementById('btn-save-settings');
    const msg = document.getElementById('settings-msg');
    const data = {
      first_name: document.getElementById('settings-firstname').value.trim(),
      last_name: document.getElementById('settings-lastname').value.trim(),
      username: document.getElementById('settings-username').value.trim(),
      bio: document.getElementById('settings-bio').value.trim(),
    };
    setButtonLoading(btn, true);
    msg.classList.add('hidden');
    try {
      const user = await updateProfile(data);
      UI.updateSidebarUser(user);
      msg.textContent = 'Сохранено!';
      msg.classList.remove('hidden');
      setTimeout(() => msg.classList.add('hidden'), 2000);
    } catch (e) {
      UI.showToast(e.data?.message || 'Ошибка сохранения', 'error');
    } finally {
      setButtonLoading(btn, false);
    }
  }

  /* ── Helpers ── */
  function showFormError(el, msg) {
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function setButtonLoading(btn, loading) {
    const span = btn.querySelector('span');
    const spinner = btn.querySelector('.btn-spinner');
    if (loading) {
      span?.classList.add('hidden');
      spinner?.classList.remove('hidden');
      btn.disabled = true;
    } else {
      span?.classList.remove('hidden');
      spinner?.classList.add('hidden');
      btn.disabled = false;
    }
  }

  return { init, login, register, logout, getCurrentUser, setCurrentUser, updateProfile, uploadAvatar, bindAuthUI, openSettings };
})();
