/* ═══════════════════════════════════════════
   api.js — HTTP REST client
   Base URL: https://pipipupu-production.up.railway.app
════════════════════════════════════════════ */

const API = (() => {
  const BASE = 'https://pipipupu-production.up.railway.app';

  let _token = localStorage.getItem('tg_token') || null;

  function setToken(t) {
    _token = t;
    if (t) localStorage.setItem('tg_token', t);
    else localStorage.removeItem('tg_token');
  }

  function getToken() { return _token; }

  async function request(method, path, body, isFormData = false) {
    const headers = {};
    if (_token) headers['Authorization'] = `Bearer ${_token}`;
    if (body && !isFormData) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isFormData ? body : JSON.stringify(body);

    try {
      const res = await fetch(BASE + path, opts);
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) throw { status: res.status, data };
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw { status: 0, data: 'Network error' };
    }
  }

  const get  = (path) => request('GET', path);
  const post = (path, body) => request('POST', path, body);
  const put  = (path, body) => request('PUT', path, body);
  const patch = (path, body) => request('PATCH', path, body);
  const del  = (path) => request('DELETE', path);

  async function uploadFile(path, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', BASE + path);
      if (_token) xhr.setRequestHeader('Authorization', `Bearer ${_token}`);

      if (onProgress) {
        xhr.upload.addEventListener('progress', e => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        });
      }
      xhr.addEventListener('load', () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(data);
          else reject({ status: xhr.status, data });
        } catch { reject({ status: xhr.status, data: xhr.responseText }); }
      });
      xhr.addEventListener('error', () => reject({ status: 0, data: 'Upload failed' }));
      xhr.send(formData);
    });
  }

  /* ── Auth ── */
  const auth = {
    login: (username, password) => post('/api/auth/login', { username, password }),
    register: (data) => post('/api/auth/register', data),
    logout: () => post('/api/auth/logout'),
    me: () => get('/api/users/me'),
  };

  /* ── Users ── */
  const users = {
    get: (id) => get(`/api/users/${id}`),
    search: (q) => get(`/api/users/search?q=${encodeURIComponent(q)}`),
    update: (data) => patch('/api/users/me', data),
    uploadAvatar: (file, onProgress) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return uploadFile('/api/users/me/avatar', fd, onProgress);
    },
  };

  /* ── Chats ── */
  const chats = {
    list: () => get('/api/chats'),
    get: (id) => get(`/api/chats/${id}`),
    create: (data) => post('/api/chats', data),
    delete: (id) => del(`/api/chats/${id}`),
  };

  /* ── Messages ── */
  const messages = {
    list: (chatId, before) => get(`/api/chats/${chatId}/messages${before ? `?before=${before}` : ''}`),
    send: (chatId, data) => post(`/api/chats/${chatId}/messages`, data),
    delete: (chatId, msgId) => del(`/api/chats/${chatId}/messages/${msgId}`),
    react: (chatId, msgId, emoji) => post(`/api/chats/${chatId}/messages/${msgId}/reactions`, { emoji }),
    removeReaction: (chatId, msgId) => del(`/api/chats/${chatId}/messages/${msgId}/reactions`),
  };

  /* ── Media ── */
  const media = {
    upload: (chatId, files, onProgress) => {
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      return uploadFile(`/api/chats/${chatId}/media`, fd, onProgress);
    },
  };

  /* ── Channels ── */
  const channels = {
    create: (data) => post('/api/channels', data),
    get: (id) => get(`/api/channels/${id}`),
    join: (id) => post(`/api/channels/${id}/join`),
    leave: (id) => post(`/api/channels/${id}/leave`),
    members: (id) => get(`/api/channels/${id}/members`),
    post: (id, data) => post(`/api/channels/${id}/messages`, data),
  };

  /* ── Calls ── */
  const calls = {
    initiate: (chatId, type) => post('/api/calls', { chat_id: chatId, type }),
    answer: (callId) => post(`/api/calls/${callId}/answer`),
    end: (callId) => post(`/api/calls/${callId}/end`),
    ice: (callId, candidate) => post(`/api/calls/${callId}/ice`, { candidate }),
    sdp: (callId, sdp) => post(`/api/calls/${callId}/sdp`, { sdp }),
  };

  return { setToken, getToken, auth, users, chats, messages, media, channels, calls, BASE };
})();
