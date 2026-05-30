/* ═══════════════════════════════════════════
   chat.js — Chat list, messages, reactions
════════════════════════════════════════════ */

const Chat = (() => {
  let _chats = [];
  let _activeChat = null;
  let _messages = [];
  let _typingTimers = {};
  let _replyTo = null;
  let _pendingFiles = [];
  let _isMobile = window.innerWidth <= 768;
  let _folder = 'all';

  /* ═══════════════
     Chat List
  ════════════════ */
  async function loadChats() {
    UI.setChatListLoading(true);
    try {
      const res = await API.chats.list();
      _chats = Array.isArray(res) ? res : res.chats || res.data || [];
      renderChatList();
    } catch (e) {
      console.error('loadChats', e);
      UI.showToast('Не удалось загрузить чаты', 'error');
    }
  }

  function renderChatList(chatOverride) {
    const listEl = document.getElementById('chat-list');
    const chats = chatOverride || _chats;
    const me = Auth.getCurrentUser();

    // Filter by folder
    const filtered = chats.filter(c => {
      if (_folder === 'chats') return c.type !== 'channel';
      if (_folder === 'channels') return c.type === 'channel';
      return true;
    });

    listEl.innerHTML = '';
    if (!filtered.length) {
      listEl.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-tertiary);font-size:13px;">Нет чатов</div>`;
      return;
    }

    filtered.forEach(chat => {
      const item = UI.renderChatItem(chat, me?.id);
      if (_activeChat?.id === chat.id) item.classList.add('active');
      item.addEventListener('click', () => openChat(chat));
      listEl.appendChild(item);
    });
  }

  /* ═══════════════
     Open Chat
  ════════════════ */
  async function openChat(chat) {
    _activeChat = chat;
    _messages = [];
    _replyTo = null;

    // Mark active in list
    document.querySelectorAll('.chat-item').forEach(el => {
      el.classList.toggle('active', el.dataset.chatId == chat.id);
    });

    // Show chat panel (mobile)
    if (_isMobile) {
      document.getElementById('sidebar').classList.add('mobile-hidden');
      document.getElementById('chat-area').classList.remove('mobile-hidden');
    }

    // Show header
    const header = document.getElementById('chat-header');
    const empty = document.getElementById('chat-empty');
    const msgArea = document.getElementById('messages-area');
    const inputWrap = document.getElementById('message-input-wrap');
    const channelNotice = document.getElementById('channel-notice');

    empty.classList.add('hidden');
    header.classList.remove('hidden');
    msgArea.classList.remove('hidden');

    // Render header
    const name = chat.title || chat.name ||
      (chat.peer ? `${chat.peer.first_name || ''} ${chat.peer.last_name || ''}`.trim() : 'Чат');

    document.getElementById('chat-header-name').textContent = name;
    const statusEl = document.getElementById('chat-header-status');
    if (chat.type === 'channel') {
      statusEl.textContent = `${chat.members_count || 0} подписчиков`;
      statusEl.classList.remove('online');
    } else if (chat.peer?.online) {
      statusEl.textContent = 'онлайн';
      statusEl.classList.add('online');
    } else {
      statusEl.textContent = UI.formatLastSeen(chat.peer?.last_seen);
      statusEl.classList.remove('online');
    }

    const chatAv = document.getElementById('chat-avatar');
    UI.setAvatarEl(chatAv, chat);

    // Channel: only admin can write
    const me = Auth.getCurrentUser();
    const isAdmin = chat.admin_ids?.includes(me?.id) || chat.owner_id === me?.id || chat.is_admin;
    if (chat.type === 'channel' && !isAdmin) {
      inputWrap.classList.add('hidden');
      channelNotice.classList.remove('hidden');
    } else {
      inputWrap.classList.remove('hidden');
      channelNotice.classList.add('hidden');
    }

    // Load messages
    const msgList = document.getElementById('messages-list');
    msgList.innerHTML = '<div class="date-separator"><span>Загрузка…</span></div>';

    try {
      const res = await API.messages.list(chat.id);
      _messages = Array.isArray(res) ? res : res.messages || res.data || [];
      renderMessages(_messages);
      scrollToBottom(false);
    } catch (e) {
      msgList.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-secondary)">Не удалось загрузить сообщения</div>`;
    }

    // Reset unread badge
    updateChatBadge(chat.id, 0);

    // Mark last msg read
    if (_messages.length > 0) {
      const last = _messages[_messages.length - 1];
      WS.markRead(chat.id, last.id);
    }
  }

  /* ═══════════════
     Render Messages
  ════════════════ */
  function renderMessages(msgs) {
    const listEl = document.getElementById('messages-list');
    listEl.innerHTML = '';
    const me = Auth.getCurrentUser();
    let lastDate = null;
    let lastSenderId = null;

    msgs.forEach((msg, idx) => {
      const ts = msg.created_at || msg.timestamp;
      const dateStr = ts ? UI.formatDateSeparator(ts) : null;

      if (dateStr && dateStr !== lastDate) {
        lastDate = dateStr;
        const sep = document.createElement('div');
        sep.className = 'date-separator';
        sep.innerHTML = `<span>${dateStr}</span>`;
        listEl.appendChild(sep);
        lastSenderId = null;
      }

      const el = buildMessageEl(msg, me, lastSenderId);
      listEl.appendChild(el);
      lastSenderId = msg.sender_id || msg.user_id || msg.from?.id;
    });
  }

  function buildMessageEl(msg, me, prevSenderId) {
    const meId = me?.id;
    const senderId = msg.sender_id || msg.user_id || msg.from?.id;
    const isOut = senderId === meId || msg.is_outgoing;
    const isSameSender = senderId && senderId === prevSenderId;

    const wrap = document.createElement('div');
    wrap.className = `message ${isOut ? 'outgoing' : 'incoming'}${isSameSender ? ' same-sender' : ''}`;
    wrap.dataset.msgId = msg.id;

    // Sender name (incoming group/channel)
    if (!isOut && !isSameSender && _activeChat?.type !== 'private') {
      const senderName = msg.sender?.first_name || msg.sender?.username || msg.from?.first_name || '';
      if (senderName) {
        const sn = document.createElement('div');
        sn.className = 'message-sender-name';
        sn.textContent = senderName;
        wrap.appendChild(sn);
      }
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Reply
    if (msg.reply_to || msg.reply_to_message) {
      const orig = msg.reply_to_message || msg.reply_to;
      const replyEl = document.createElement('div');
      replyEl.className = 'message-reply';
      replyEl.innerHTML = `
        <span class="reply-sender">${UI.escHtml(orig?.sender?.first_name || orig?.from?.first_name || 'Ответ')}</span>
        <span class="reply-msg">${UI.escHtml(orig?.text || orig?.content || '…')}</span>
      `;
      replyEl.addEventListener('click', () => scrollToMessage(orig?.id || msg.reply_to_id));
      bubble.appendChild(replyEl);
    }

    // Media
    const mediaUrl = msg.media_url || msg.file_url;
    if (mediaUrl) {
      const mediaType = msg.media_type || msg.type;
      if (mediaType === 'photo' || mediaType === 'image') {
        const mediaEl = document.createElement('div');
        mediaEl.className = 'message-media';
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = 'photo';
        img.loading = 'lazy';
        img.addEventListener('click', () => openMediaViewer(mediaUrl));
        mediaEl.appendChild(img);
        bubble.appendChild(mediaEl);
      } else if (mediaType === 'video') {
        const mediaEl = document.createElement('div');
        mediaEl.className = 'message-media';
        const vid = document.createElement('video');
        vid.src = mediaUrl;
        vid.controls = true;
        vid.preload = 'metadata';
        mediaEl.appendChild(vid);
        bubble.appendChild(mediaEl);
      } else {
        const docEl = document.createElement('div');
        docEl.className = 'message-doc';
        docEl.innerHTML = `
          <div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <div class="doc-info">
            <div class="doc-name">${UI.escHtml(msg.file_name || 'Файл')}</div>
            <div class="doc-size">${UI.formatFileSize(msg.file_size)}</div>
          </div>
        `;
        docEl.style.cursor = 'pointer';
        docEl.addEventListener('click', () => window.open(mediaUrl, '_blank'));
        bubble.appendChild(docEl);
      }
    }

    // Text
    const text = msg.text || msg.content || '';
    if (text) {
      const textEl = document.createElement('div');
      textEl.className = 'message-text';
      textEl.innerHTML = linkifyText(UI.escHtml(text));
      bubble.appendChild(textEl);
    }

    // Meta (time + status)
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const ts = msg.created_at || msg.timestamp;
    meta.innerHTML = `<span class="message-time">${UI.formatFullTime(ts)}</span>`;
    if (isOut) {
      const statusClass = msg.read ? 'read' : '';
      meta.innerHTML += `
        <span class="message-status ${statusClass}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${msg.read
              ? '<path d="M18 7l-1.5-1.5L10 12l-3-3-1.5 1.5L10 15z"/><path d="M22 7l-1.5-1.5-6.5 6.5"/>'
              : '<path d="M20 6L9 17l-5-5"/>'}
          </svg>
        </span>`;
    }
    bubble.appendChild(meta);
    wrap.appendChild(bubble);

    // Reactions
    if (msg.reactions && Object.keys(msg.reactions).length > 0) {
      wrap.appendChild(buildReactionsEl(msg.reactions, msg.id, meId));
    }

    // Long-press / right-click for context
    bubble.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showMessageContext(e.clientX, e.clientY, msg, isOut);
    });

    // Double-tap reaction (mobile)
    let tapTimer;
    bubble.addEventListener('touchstart', () => { tapTimer = setTimeout(() => showReactionPickerForMsg(msg), 500); }, { passive: true });
    bubble.addEventListener('touchend', () => clearTimeout(tapTimer), { passive: true });

    return wrap;
  }

  function buildReactionsEl(reactions, msgId, myId) {
    const el = document.createElement('div');
    el.className = 'message-reactions';
    Object.entries(reactions).forEach(([emoji, data]) => {
      const count = typeof data === 'number' ? data : data.count || 1;
      const mine = data.users?.includes(myId) || data.mine;
      const badge = document.createElement('button');
      badge.className = `reaction-badge${mine ? ' mine' : ''}`;
      badge.innerHTML = `${emoji}<span class="reaction-count">${count}</span>`;
      badge.addEventListener('click', () => toggleReaction(msgId, emoji, mine));
      el.appendChild(badge);
    });
    return el;
  }

  function linkifyText(html) {
    return html.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  /* ═══════════════
     Send Message
  ════════════════ */
  async function sendMessage() {
    if (!_activeChat) return;

    const inputEl = document.getElementById('message-input');
    const text = inputEl.innerText.trim();

    // If files queued, upload them first
    if (_pendingFiles.length > 0) {
      await uploadPendingFiles(text);
      return;
    }

    if (!text) return;

    const payload = { text };
    if (_replyTo) payload.reply_to_id = _replyTo.id;

    // Optimistic UI
    const me = Auth.getCurrentUser();
    const optimistic = {
      id: 'tmp_' + Date.now(),
      text,
      sender_id: me?.id,
      is_outgoing: true,
      created_at: new Date().toISOString(),
      pending: true,
    };
    if (_replyTo) {
      optimistic.reply_to_id = _replyTo.id;
      optimistic.reply_to_message = _replyTo;
    }
    appendMessage(optimistic);
    scrollToBottom();

    // Clear input
    inputEl.innerHTML = '';
    clearReply();

    try {
      const sent = await API.messages.send(_activeChat.id, payload);
      // Replace optimistic
      replaceOptimistic(optimistic.id, sent);
      updateChatPreview(_activeChat.id, sent);
    } catch {
      UI.showToast('Ошибка отправки', 'error');
      removeMessage(optimistic.id);
    }
  }

  async function uploadPendingFiles(caption) {
    if (!_activeChat) return;
    UI.showToast('Загружаем файлы…');
    const files = [..._pendingFiles];
    clearPendingFiles();

    try {
      const res = await API.media.upload(_activeChat.id, files, (pct) => {
        console.log('Upload:', pct + '%');
      });
      const msgs = Array.isArray(res) ? res : [res];
      msgs.forEach(m => { appendMessage(m); scrollToBottom(); });
      updateChatPreview(_activeChat.id, msgs[msgs.length-1]);
    } catch {
      UI.showToast('Ошибка загрузки файла', 'error');
    }
  }

  /* ═══════════════
     Reactions
  ════════════════ */
  async function toggleReaction(msgId, emoji, alreadyMine) {
    if (!_activeChat) return;
    try {
      if (alreadyMine) {
        await API.messages.removeReaction(_activeChat.id, msgId);
      } else {
        await API.messages.react(_activeChat.id, msgId, emoji);
      }
    } catch (e) {
      UI.showToast('Не удалось отреагировать', 'error');
    }
  }

  function showReactionPickerForMsg(msg) {
    const el = document.querySelector(`[data-msg-id="${msg.id}"] .message-bubble`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    UI.showReactionPicker(rect.left, rect.top, (emoji) => {
      toggleReaction(msg.id, emoji, false);
    });
  }

  function showMessageContext(x, y, msg, isOut) {
    const actions = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>', label: 'Ответить', action: 'reply' },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>', label: 'Копировать', action: 'copy' },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>', label: 'Реакция', action: 'react' },
    ];
    if (isOut) {
      actions.push({ icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>', label: 'Удалить', action: 'delete', danger: true });
    }

    UI.showContextMenu(x, y, actions);

    // Handle actions
    const handler = (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      document.getElementById('context-menu').removeEventListener('click', handler);
      if (!action) return;
      switch (action) {
        case 'reply': setReply(msg); break;
        case 'copy': navigator.clipboard?.writeText(msg.text || msg.content || ''); UI.showToast('Скопировано'); break;
        case 'react':
          UI.hideContextMenu();
          setTimeout(() => showReactionPickerForMsg(msg), 50);
          break;
        case 'delete': deleteMessage(msg.id); break;
      }
    };
    document.getElementById('context-menu').addEventListener('click', handler);
  }

  async function deleteMessage(msgId) {
    if (!_activeChat) return;
    try {
      await API.messages.delete(_activeChat.id, msgId);
      removeMessage(msgId);
    } catch {
      UI.showToast('Ошибка удаления', 'error');
    }
  }

  /* ═══════════════
     Reply
  ════════════════ */
  function setReply(msg) {
    _replyTo = msg;
    document.getElementById('reply-author').textContent = msg.sender?.first_name || 'Ответ';
    document.getElementById('reply-text').textContent = msg.text || msg.content || '…';
    document.getElementById('reply-preview').classList.remove('hidden');
    document.getElementById('message-input').focus();
  }

  function clearReply() {
    _replyTo = null;
    document.getElementById('reply-preview').classList.add('hidden');
  }

  /* ═══════════════
     DOM helpers
  ════════════════ */
  function appendMessage(msg) {
    const me = Auth.getCurrentUser();
    const listEl = document.getElementById('messages-list');
    const prevSenderId = listEl.lastElementChild?.dataset?.senderId;
    const el = buildMessageEl(msg, me, prevSenderId);
    listEl.appendChild(el);
    _messages.push(msg);
  }

  function replaceOptimistic(tmpId, realMsg) {
    const el = document.querySelector(`[data-msg-id="${tmpId}"]`);
    if (el) {
      const me = Auth.getCurrentUser();
      const newEl = buildMessageEl(realMsg, me, null);
      el.replaceWith(newEl);
    }
    const idx = _messages.findIndex(m => m.id === tmpId);
    if (idx !== -1) _messages[idx] = realMsg;
  }

  function removeMessage(msgId) {
    const el = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (el) el.remove();
    _messages = _messages.filter(m => m.id !== msgId);
  }

  function scrollToBottom(smooth = true) {
    const area = document.getElementById('messages-area');
    area.scrollTo({ top: area.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  }

  function scrollToMessage(msgId) {
    const el = document.querySelector(`[data-msg-id="${msgId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function updateChatPreview(chatId, msg) {
    const chat = _chats.find(c => c.id === chatId);
    if (chat) { chat.last_message = msg; renderChatList(); }
  }

  function updateChatBadge(chatId, count) {
    const chat = _chats.find(c => c.id === chatId);
    if (chat) { chat.unread_count = count; }
    const item = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (!item) return;
    const badge = item.querySelector('.chat-item-badge');
    if (count > 0) {
      if (badge) badge.textContent = count > 99 ? '99+' : count;
      else {
        const b = document.createElement('span');
        b.className = 'chat-item-badge';
        b.textContent = count > 99 ? '99+' : count;
        item.querySelector('.chat-item-bottom').appendChild(b);
      }
    } else {
      badge?.remove();
    }
  }

  function openMediaViewer(url) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:500;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain';
    overlay.appendChild(img);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  }

  /* ═══════════════
     Pending Files
  ════════════════ */
  function addPendingFiles(files) {
    _pendingFiles.push(...files);
    renderPendingFilesPreview();
  }

  function clearPendingFiles() {
    _pendingFiles = [];
    document.getElementById('media-preview').classList.add('hidden');
    document.getElementById('media-preview-list').innerHTML = '';
  }

  function renderPendingFilesPreview() {
    if (!_pendingFiles.length) { clearPendingFiles(); return; }
    const list = document.getElementById('media-preview-list');
    list.innerHTML = '';
    _pendingFiles.forEach((file, idx) => {
      const item = document.createElement('div');
      item.className = 'media-preview-item';
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        item.appendChild(img);
      } else {
        item.innerHTML = `<div style="width:72px;height:72px;background:var(--bg-tertiary);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-secondary);text-align:center;padding:4px">${UI.escHtml(file.name.slice(-12))}</div>`;
      }
      const rm = document.createElement('button');
      rm.className = 'media-preview-remove';
      rm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      rm.addEventListener('click', () => {
        _pendingFiles.splice(idx, 1);
        renderPendingFilesPreview();
      });
      item.appendChild(rm);
      list.appendChild(item);
    });
    document.getElementById('media-preview').classList.remove('hidden');
  }

  /* ═══════════════
     WebSocket Events
  ════════════════ */
  function bindWsEvents() {
    WS.on('new_message', (msg) => {
      const chatId = msg.chat_id;

      // Update chat list
      const chat = _chats.find(c => c.id === chatId);
      if (chat) { chat.last_message = msg; renderChatList(); }
      else { loadChats(); }

      // Append to active chat
      if (_activeChat?.id === chatId) {
        appendMessage(msg);
        scrollToBottom();
        WS.markRead(chatId, msg.id);
      } else {
        // Increment badge
        if (chat) updateChatBadge(chatId, (chat.unread_count || 0) + 1);
      }
    });

    WS.on('message_deleted', ({ message_id, chat_id }) => {
      if (_activeChat?.id === chat_id) removeMessage(message_id);
    });

    WS.on('message_updated', (msg) => {
      if (_activeChat?.id === msg.chat_id) {
        const el = document.querySelector(`[data-msg-id="${msg.id}"]`);
        if (el) {
          const me = Auth.getCurrentUser();
          el.replaceWith(buildMessageEl(msg, me, null));
        }
      }
    });

    WS.on('reaction', (data) => {
      if (_activeChat?.id === data.chat_id) {
        const msgIdx = _messages.findIndex(m => m.id === data.message_id);
        if (msgIdx !== -1) {
          if (!_messages[msgIdx].reactions) _messages[msgIdx].reactions = {};
          if (!_messages[msgIdx].reactions[data.emoji]) _messages[msgIdx].reactions[data.emoji] = { count: 0, users: [] };
          _messages[msgIdx].reactions[data.emoji].count += 1;
          if (data.user_id) _messages[msgIdx].reactions[data.emoji].users.push(data.user_id);
          // Re-render
          const el = document.querySelector(`[data-msg-id="${data.message_id}"]`);
          if (el) {
            const me = Auth.getCurrentUser();
            el.replaceWith(buildMessageEl(_messages[msgIdx], me, null));
          }
        }
      }
    });

    WS.on('typing', ({ chat_id, user }) => {
      if (_activeChat?.id === chat_id) {
        const statusEl = document.getElementById('chat-header-status');
        const origText = statusEl.getAttribute('data-orig') || statusEl.textContent;
        statusEl.setAttribute('data-orig', origText);
        statusEl.textContent = `${user?.first_name || 'Пользователь'} печатает…`;
        statusEl.classList.add('online');
        clearTimeout(_typingTimers[chat_id]);
        _typingTimers[chat_id] = setTimeout(() => {
          statusEl.textContent = statusEl.getAttribute('data-orig') || '';
          statusEl.removeAttribute('data-orig');
        }, 3000);
      }
    });

    WS.on('user_online', ({ user_id }) => {
      if (_activeChat?.peer?.id === user_id) {
        document.getElementById('chat-header-status').textContent = 'онлайн';
        document.getElementById('chat-header-status').classList.add('online');
      }
    });

    WS.on('user_offline', ({ user_id, last_seen }) => {
      if (_activeChat?.peer?.id === user_id) {
        const el = document.getElementById('chat-header-status');
        el.textContent = UI.formatLastSeen(last_seen);
        el.classList.remove('online');
      }
    });

    WS.on('chat_created', (chat) => {
      _chats.unshift(chat);
      renderChatList();
    });
  }

  /* ═══════════════
     Typing detection
  ════════════════ */
  let _typingDebounce;
  function handleInputTyping() {
    if (!_activeChat) return;
    WS.sendTyping(_activeChat.id);
    clearTimeout(_typingDebounce);
    _typingDebounce = setTimeout(() => WS.sendTypingStop(_activeChat.id), 2000);
  }

  /* ═══════════════
     Search
  ════════════════ */
  async function searchChats(query) {
    if (!query.trim()) {
      document.getElementById('search-results').classList.add('hidden');
      renderChatList();
      return;
    }

    try {
      const [users, chats] = await Promise.allSettled([
        API.users.search(query),
        API.chats.list().then(r => (Array.isArray(r) ? r : r.chats || []).filter(c =>
          (c.title || c.name || '').toLowerCase().includes(query.toLowerCase())
        )),
      ]);

      const userList = users.value || [];
      const chatList = chats.value || [];
      const me = Auth.getCurrentUser();

      const resultsEl = document.getElementById('search-results');
      resultsEl.innerHTML = '';

      if (userList.length || chatList.length) {
        if (userList.length) {
          const title = document.createElement('div');
          title.className = 'search-section-title';
          title.textContent = 'Пользователи';
          resultsEl.appendChild(title);
          userList.slice(0, 5).forEach(u => {
            if (u.id === me?.id) return;
            const item = document.createElement('div');
            item.className = 'chat-item';
            const av = UI.createAvatar(u, 'avatar-md');
            item.innerHTML = `
              <div class="chat-item-body">
                <div class="chat-item-top">
                  <span class="chat-item-name">${UI.escHtml(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username)}</span>
                </div>
                <div class="chat-item-preview">@${UI.escHtml(u.username)}</div>
              </div>
            `;
            item.prepend(av);
            item.addEventListener('click', () => startChatWithUser(u));
            resultsEl.appendChild(item);
          });
        }

        if (chatList.length) {
          const title = document.createElement('div');
          title.className = 'search-section-title';
          title.textContent = 'Чаты';
          resultsEl.appendChild(title);
          chatList.slice(0, 5).forEach(c => {
            const item = UI.renderChatItem(c, me?.id);
            item.addEventListener('click', () => {
              clearSearch();
              openChat(c);
            });
            resultsEl.appendChild(item);
          });
        }
      } else {
        resultsEl.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-tertiary);font-size:13px">Ничего не найдено</div>`;
      }

      resultsEl.classList.remove('hidden');
      document.getElementById('chat-list').style.display = 'none';
    } catch (e) {
      console.error('search', e);
    }
  }

  function clearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('chat-list').style.display = '';
    document.getElementById('search-clear').classList.add('hidden');
  }

  async function startChatWithUser(user) {
    clearSearch();
    try {
      const chat = await API.chats.create({ peer_id: user.id, type: 'private' });
      if (!_chats.find(c => c.id === chat.id)) {
        _chats.unshift(chat);
        renderChatList();
      }
      openChat(chat);
      UI.closeModal('modal-new-chat');
    } catch (e) {
      UI.showToast(e.data?.message || 'Ошибка создания чата', 'error');
    }
  }

  /* ═══════════════
     New Chat modal
  ════════════════ */
  function bindNewChatModal() {
    let searchTimer;
    document.getElementById('find-user-input').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const q = e.target.value.trim();
      const results = document.getElementById('find-user-results');
      if (!q) { results.innerHTML = ''; return; }
      searchTimer = setTimeout(async () => {
        try {
          const users = await API.users.search(q);
          const me = Auth.getCurrentUser();
          results.innerHTML = '';
          (Array.isArray(users) ? users : users.users || []).slice(0, 10).forEach(u => {
            if (u.id === me?.id) return;
            const item = document.createElement('div');
            item.className = 'user-result-item';
            const av = UI.createAvatar(u, 'avatar-sm');
            item.appendChild(av);
            item.innerHTML += `
              <div class="user-result-info">
                <div class="user-result-name">${UI.escHtml(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username)}</div>
                <div class="user-result-username">@${UI.escHtml(u.username)}</div>
              </div>
            `;
            item.prepend(av);
            item.addEventListener('click', () => startChatWithUser(u));
            results.appendChild(item);
          });
          if (!results.children.length) results.innerHTML = `<div style="padding:12px;color:var(--text-tertiary);font-size:13px;text-align:center">Не найдено</div>`;
        } catch {}
      }, 400);
    });

    document.getElementById('btn-open-create-channel').addEventListener('click', () => {
      UI.closeModal('modal-new-chat');
      UI.openModal('modal-create-channel');
    });
  }

  /* ═══════════════
     Create Channel
  ════════════════ */
  async function createChannel() {
    const name = document.getElementById('channel-name').value.trim();
    const desc = document.getElementById('channel-desc').value.trim();
    const type = document.querySelector('input[name="channel-type"]:checked')?.value || 'public';
    const errEl = document.getElementById('channel-error');
    if (!name) { errEl.textContent = 'Введите название'; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    try {
      const channel = await API.channels.create({ title: name, description: desc, type });
      _chats.unshift(channel);
      renderChatList();
      UI.closeModal('modal-create-channel');
      openChat(channel);
      UI.showToast('Канал создан!', 'success');
    } catch (e) {
      errEl.textContent = e.data?.message || 'Ошибка создания';
      errEl.classList.remove('hidden');
    }
  }

  /* ═══════════════
     Bind Input Events
  ════════════════ */
  function bindInputEvents() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('btn-send');
    const emojiBtn = document.getElementById('btn-emoji');
    const emojiWrap = document.getElementById('emoji-picker-wrap');
    const attachBtn = document.getElementById('btn-attach');
    const attachMenu = document.getElementById('attach-menu');

    // Send on Enter (Shift+Enter = newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    input.addEventListener('input', handleInputTyping);

    sendBtn.addEventListener('click', sendMessage);

    // Emoji picker
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiWrap.classList.toggle('hidden');
    });

    emojiWrap.querySelector('emoji-picker').addEventListener('emoji-click', (e) => {
      const emoji = e.detail.unicode;
      insertAtCursor(input, emoji);
      emojiWrap.classList.add('hidden');
    });

    // Attach menu
    attachBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      attachMenu.classList.toggle('hidden');
    });

    document.getElementById('attach-photo').addEventListener('click', () => {
      document.getElementById('file-image').click();
      attachMenu.classList.add('hidden');
    });
    document.getElementById('attach-doc').addEventListener('click', () => {
      document.getElementById('file-doc').click();
      attachMenu.classList.add('hidden');
    });

    document.getElementById('file-image').addEventListener('change', (e) => {
      if (e.target.files.length) { addPendingFiles([...e.target.files]); e.target.value = ''; }
    });
    document.getElementById('file-doc').addEventListener('change', (e) => {
      if (e.target.files.length) { addPendingFiles([...e.target.files]); e.target.value = ''; }
    });

    // Reply close
    document.getElementById('reply-close').addEventListener('click', clearReply);

    // Close menus on outside click
    document.addEventListener('click', (e) => {
      if (!emojiBtn.contains(e.target) && !emojiWrap.contains(e.target)) emojiWrap.classList.add('hidden');
      if (!attachBtn.contains(e.target) && !attachMenu.contains(e.target)) attachMenu.classList.add('hidden');
      UI.hideContextMenu();
      UI.hideReactionPicker();
    });

    // Search
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      searchClear.classList.toggle('hidden', !q);
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => searchChats(q), 350);
    });
    searchClear.addEventListener('click', clearSearch);

    // Folder tabs
    document.querySelectorAll('.folder-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.folder-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        _folder = tab.dataset.folder;
        renderChatList();
      });
    });

    // Back button (mobile)
    document.getElementById('btn-back').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-hidden');
      document.getElementById('chat-area').classList.add('mobile-hidden');
      _activeChat = null;
    });

    // Compose button
    document.getElementById('btn-compose').addEventListener('click', () => UI.openModal('modal-new-chat'));

    // Create channel button
    document.getElementById('btn-create-channel').addEventListener('click', createChannel);

    // Chat header click (show info)
    document.getElementById('chat-header-info').addEventListener('click', showChatInfo);

    // Chat menu
    document.getElementById('btn-chat-menu').addEventListener('click', (e) => {
      e.stopPropagation();
      showChatHeaderMenu(e.clientX, e.clientY);
    });

    // Mobile resize handler
    window.addEventListener('resize', () => { _isMobile = window.innerWidth <= 768; });

    bindNewChatModal();
  }

  function showChatHeaderMenu(x, y) {
    if (!_activeChat) return;
    const actions = [
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>', label: 'Поиск в чате', action: 'search' },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>', label: 'Участники', action: 'members' },
      { icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>', label: 'Покинуть', action: 'leave', danger: true },
    ];
    UI.showContextMenu(x, y, actions);
    document.getElementById('context-menu').addEventListener('click', (e) => {
      const a = e.target.closest('[data-action]')?.dataset.action;
      if (!a) return;
      UI.hideContextMenu();
      if (a === 'leave') leaveChat();
    }, { once: true });
  }

  async function leaveChat() {
    if (!_activeChat) return;
    try {
      await API.chats.delete(_activeChat.id);
      _chats = _chats.filter(c => c.id !== _activeChat.id);
      renderChatList();
      _activeChat = null;
      document.getElementById('chat-header').classList.add('hidden');
      document.getElementById('messages-area').classList.add('hidden');
      document.getElementById('message-input-wrap').classList.add('hidden');
      document.getElementById('chat-empty').classList.remove('hidden');
    } catch (e) {
      UI.showToast('Ошибка', 'error');
    }
  }

  async function showChatInfo() {
    if (!_activeChat) return;
    const panel = document.getElementById('right-panel');
    const body = document.getElementById('right-panel-body');
    const title = document.getElementById('right-panel-title');

    if (!panel.classList.contains('hidden')) { panel.classList.add('hidden'); return; }

    title.textContent = _activeChat.type === 'channel' ? 'О канале' : 'Информация';
    body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-tertiary)">Загрузка…</div>';
    panel.classList.remove('hidden');

    try {
      if (_activeChat.type === 'channel') {
        const [info, members] = await Promise.all([
          API.channels.get(_activeChat.id),
          API.channels.members(_activeChat.id),
        ]);
        renderChannelInfo(info, members);
      } else {
        renderPrivateChatInfo(_activeChat);
      }
    } catch {
      body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-tertiary)">Не удалось загрузить</div>';
    }
  }

  function renderChannelInfo(channel, members) {
    const body = document.getElementById('right-panel-body');
    const av = UI.createAvatar(channel, 'avatar-lg');
    const memberList = (Array.isArray(members) ? members : members.members || []).slice(0, 20);
    body.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'channel-info-header';
    header.appendChild(av);
    header.innerHTML += `
      <div class="channel-meta">
        <h4>${UI.escHtml(channel.title || channel.name || '')}</h4>
        <p>${UI.escHtml(channel.description || '')}</p>
        <div class="channel-stats">
          <div class="stat"><div class="stat-value">${channel.members_count || memberList.length || 0}</div><div class="stat-label">подписчиков</div></div>
          <div class="stat"><div class="stat-value">${channel.posts_count || 0}</div><div class="stat-label">публикаций</div></div>
        </div>
      </div>
    `;
    body.appendChild(header);

    if (memberList.length) {
      const sec = document.createElement('div');
      sec.className = 'members-section';
      sec.innerHTML = '<h5>Участники</h5>';
      memberList.forEach(m => {
        const item = document.createElement('div');
        item.className = 'member-item';
        item.appendChild(UI.createAvatar(m, 'avatar-sm'));
        const isAdmin = m.role === 'admin' || m.is_admin;
        item.innerHTML += `
          <span>${UI.escHtml(`${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username)}</span>
          ${isAdmin ? '<span class="member-role">Админ</span>' : ''}
        `;
        sec.appendChild(item);
      });
      body.appendChild(sec);
    }
  }

  function renderPrivateChatInfo(chat) {
    const peer = chat.peer || {};
    const body = document.getElementById('right-panel-body');
    body.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'channel-info-header';
    header.appendChild(UI.createAvatar(peer, 'avatar-lg'));
    header.innerHTML += `
      <div class="channel-meta">
        <h4>${UI.escHtml(`${peer.first_name || ''} ${peer.last_name || ''}`.trim() || peer.username || 'Пользователь')}</h4>
        <p>@${UI.escHtml(peer.username || '')}</p>
        ${peer.bio ? `<p style="margin-top:8px;font-size:13px;color:var(--text-secondary)">${UI.escHtml(peer.bio)}</p>` : ''}
      </div>
    `;
    body.appendChild(header);
  }

  /* ── Cursor helper ── */
  function insertAtCursor(el, text) {
    el.focus();
    const sel = window.getSelection();
    const range = sel?.getRangeAt(0) || document.createRange();
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ── Right panel close ── */
  document.getElementById('btn-close-panel').addEventListener('click', () => {
    document.getElementById('right-panel').classList.add('hidden');
  });

  return { loadChats, openChat, bindInputEvents, bindWsEvents, _chats, getCurrentChat: () => _activeChat };
})();
