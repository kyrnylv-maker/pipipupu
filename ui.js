/* ═══════════════════════════════════════════
   ui.js — DOM helpers & shared UI logic
════════════════════════════════════════════ */

const UI = (() => {
  /* ── Avatar colors ── */
  const COLORS = ['#e17076','#7bc862','#65aadd','#a695e7','#ee7aae','#faa774','#6ec9cb','#2AABEE'];

  function getAvatarColor(str) {
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash) % COLORS.length;
  }

  function getInitials(user) {
    if (!user) return '?';
    const name = user.first_name || user.name || user.title || user.username || '?';
    return name.slice(0, 2).toUpperCase();
  }

  function setAvatarEl(el, entity) {
    if (!el || !entity) return;
    const avatarUrl = entity.avatar_url || entity.photo_url || entity.avatar || entity.photo;
    const colorIdx = getAvatarColor(entity.id?.toString() || entity.username || entity.name || '');
    el.setAttribute('data-color', colorIdx);
    el.innerHTML = '';
    if (avatarUrl) {
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = 'avatar';
      img.onerror = () => { img.remove(); el.textContent = getInitials(entity); };
      el.appendChild(img);
    } else {
      el.textContent = getInitials(entity);
    }
  }

  function createAvatar(entity, sizeClass = 'avatar-md') {
    const div = document.createElement('div');
    div.className = `avatar ${sizeClass}`;
    setAvatarEl(div, entity);
    return div;
  }

  /* ── Online status ── */
  function formatLastSeen(ts) {
    if (!ts) return 'не в сети';
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff/60)} мин назад`;
    if (diff < 86400) return `сегодня в ${d.toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'})}`;
    return `${d.toLocaleDateString('ru', {day:'numeric',month:'short'})}`;
  }

  function formatMessageTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
    if (d.toDateString() === yesterday.toDateString()) return 'вчера';
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
  }

  function formatFullTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDateSeparator(ts) {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Сегодня';
    const yesterday = new Date(now); yesterday.setDate(now.getDate()-1);
    if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
    return d.toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ── Modals ── */
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function bindModalClosers() {
    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      });
    });
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.dataset.modal;
        if (modal) closeModal(modal);
      });
    });
    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
        hideContextMenu();
        hideReactionPicker();
        hideEmojiPicker();
      }
    });
  }

  /* ── Toast ── */
  function showToast(msg, type = '', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast${type ? ' ' + type : ''}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /* ── Context menu ── */
  let _ctxTarget = null;

  function showContextMenu(x, y, actions) {
    const menu = document.getElementById('context-menu');
    menu.innerHTML = '';
    actions.forEach(({ icon, label, action, danger }) => {
      const btn = document.createElement('button');
      btn.className = 'context-item';
      btn.dataset.action = action;
      if (danger) btn.style.color = '#ef4444';
      btn.innerHTML = `${icon}<span>${label}</span>`;
      btn.addEventListener('click', () => {
        menu.classList.add('hidden');
      });
      menu.appendChild(btn);
    });

    menu.classList.remove('hidden');
    const vw = window.innerWidth, vh = window.innerHeight;
    const mw = 180, mh = actions.length * 40;
    menu.style.left = Math.min(x, vw - mw - 8) + 'px';
    menu.style.top = Math.min(y, vh - mh - 8) + 'px';
  }

  function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
  }

  /* ── Reaction picker ── */
  function showReactionPicker(x, y, onPick) {
    const picker = document.getElementById('reaction-picker');
    picker.classList.remove('hidden');
    const vw = window.innerWidth, vh = window.innerHeight;
    picker.style.left = Math.min(x, vw - 320 - 8) + 'px';
    picker.style.top = Math.min(y - 50, vh - 56) + 'px';

    const handler = (e) => {
      const btn = e.target.closest('.reaction-opt');
      if (btn) {
        onPick(btn.dataset.emoji);
        picker.classList.add('hidden');
        picker.removeEventListener('click', handler);
      }
    };
    picker.addEventListener('click', handler);
  }

  function hideReactionPicker() {
    document.getElementById('reaction-picker').classList.add('hidden');
  }

  /* ── Emoji picker toggle ── */
  function hideEmojiPicker() {
    document.getElementById('emoji-picker-wrap').classList.add('hidden');
  }

  /* ── Sidebar: update user info ── */
  function updateSidebarUser(user) {
    if (!user) return;
    const nameEl = document.getElementById('sidebar-username');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : `@${user.username}`;
    if (avatarEl) setAvatarEl(avatarEl, user);
  }

  /* ── Theme toggle ── */
  function bindThemeToggle() {
    const btn = document.getElementById('btn-theme');
    const moon = btn.querySelector('.icon-moon');
    const sun = btn.querySelector('.icon-sun');

    const saved = localStorage.getItem('tg_theme') || 'dark';
    applyTheme(saved);

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('tg_theme', next);
    });

    function applyTheme(t) {
      document.documentElement.setAttribute('data-theme', t);
      if (t === 'dark') { moon.classList.remove('hidden'); sun.classList.add('hidden'); }
      else { moon.classList.add('hidden'); sun.classList.remove('hidden'); }
    }
  }

  /* ── Render chat list item ── */
  function renderChatItem(chat, currentUserId) {
    const div = document.createElement('div');
    div.className = 'chat-item';
    div.dataset.chatId = chat.id;
    div.dataset.chatType = chat.type || 'private';

    const lastMsg = chat.last_message;
    const time = lastMsg ? formatMessageTime(lastMsg.created_at || lastMsg.timestamp) : '';
    const preview = lastMsg ? getPreviewText(lastMsg, currentUserId) : '';
    const unread = chat.unread_count || 0;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'chat-item-avatar';
    const av = createAvatar(chat, 'avatar-md');
    avatarDiv.appendChild(av);

    // Online dot for private chats
    if (chat.type === 'private' && chat.peer?.online) {
      const dot = document.createElement('div');
      dot.className = 'online-dot';
      avatarDiv.appendChild(dot);
    }

    const name = chat.title || chat.name ||
      (chat.peer ? `${chat.peer.first_name || ''} ${chat.peer.last_name || ''}`.trim() : 'Чат');

    div.innerHTML = `
      <div class="chat-item-body">
        <div class="chat-item-top">
          <span class="chat-item-name">${escHtml(name)}${chat.type === 'channel' ? ' <span class="channel-badge">Канал</span>' : ''}</span>
          <span class="chat-item-time">${time}</span>
        </div>
        <div class="chat-item-bottom">
          <span class="chat-item-preview">${escHtml(preview)}</span>
          ${unread > 0 ? `<span class="chat-item-badge">${unread > 99 ? '99+' : unread}</span>` : ''}
        </div>
      </div>
    `;
    div.prepend(avatarDiv);
    return div;
  }

  function getPreviewText(msg, myId) {
    if (!msg) return '';
    if (msg.media_type === 'photo') return '📷 Фото';
    if (msg.media_type === 'video') return '🎥 Видео';
    if (msg.media_type === 'document') return '📄 Документ';
    const text = msg.text || msg.content || '';
    return text.length > 50 ? text.slice(0, 50) + '…' : text;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Loading state for chat list ── */
  function setChatListLoading(loading) {
    const listEl = document.getElementById('chat-list');
    if (loading) {
      listEl.innerHTML = `
        <div class="chat-list-loading">
          ${[0,1,2,3,4].map(i => `<div class="skeleton-item" style="--d:${i}"></div>`).join('')}
        </div>`;
    }
  }

  /* ── File size ── */
  function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }

  return {
    setAvatarEl, createAvatar, getInitials, getAvatarColor,
    formatMessageTime, formatFullTime, formatDateSeparator, formatLastSeen, formatFileSize,
    openModal, closeModal, bindModalClosers,
    showToast,
    showContextMenu, hideContextMenu,
    showReactionPicker, hideReactionPicker, hideEmojiPicker,
    updateSidebarUser,
    bindThemeToggle,
    renderChatItem, escHtml,
    setChatListLoading,
  };
})();
