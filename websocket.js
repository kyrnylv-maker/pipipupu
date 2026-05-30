/* ═══════════════════════════════════════════
   websocket.js — Real-time WS client
   WSS: wss://pipipupu-production.up.railway.app
════════════════════════════════════════════ */

const WS = (() => {
  const WS_URL = 'wss://pipipupu-production.up.railway.app';

  let socket = null;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let maxDelay = 30000;
  let isConnecting = false;
  let _handlers = {};
  let _pingInterval = null;
  let _authenticated = false;

  function on(event, fn) {
    if (!_handlers[event]) _handlers[event] = [];
    _handlers[event].push(fn);
    return () => off(event, fn);
  }

  function off(event, fn) {
    if (_handlers[event]) _handlers[event] = _handlers[event].filter(h => h !== fn);
  }

  function emit(event, data) {
    (_handlers[event] || []).forEach(fn => { try { fn(data); } catch(e) { console.error(e); } });
  }

  function send(payload) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  function connect(token) {
    if (isConnecting || (socket && socket.readyState === WebSocket.OPEN)) return;
    isConnecting = true;

    const url = token ? `${WS_URL}/ws?token=${encodeURIComponent(token)}` : `${WS_URL}/ws`;
    console.log('[WS] Connecting…');

    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      console.log('[WS] Connected');
      isConnecting = false;
      reconnectDelay = 1000;
      _authenticated = false;

      // Authenticate after connection
      if (token) {
        send({ type: 'auth', token });
      }

      // Ping keepalive every 25s
      _pingInterval = setInterval(() => {
        send({ type: 'ping' });
      }, 25000);

      emit('connect');
    });

    socket.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }

      switch (msg.type) {
        case 'auth_ok':
          _authenticated = true;
          emit('authenticated', msg);
          break;
        case 'pong':
          break;
        case 'new_message':
          emit('new_message', msg.data || msg);
          break;
        case 'message_deleted':
          emit('message_deleted', msg.data || msg);
          break;
        case 'message_updated':
          emit('message_updated', msg.data || msg);
          break;
        case 'reaction_added':
        case 'reaction':
          emit('reaction', msg.data || msg);
          break;
        case 'user_online':
          emit('user_online', msg.data || msg);
          break;
        case 'user_offline':
          emit('user_offline', msg.data || msg);
          break;
        case 'typing':
          emit('typing', msg.data || msg);
          break;
        case 'typing_stop':
          emit('typing_stop', msg.data || msg);
          break;
        case 'call_incoming':
          emit('call_incoming', msg.data || msg);
          break;
        case 'call_answer':
          emit('call_answer', msg.data || msg);
          break;
        case 'call_end':
          emit('call_end', msg.data || msg);
          break;
        case 'call_ice':
          emit('call_ice', msg.data || msg);
          break;
        case 'call_sdp':
          emit('call_sdp', msg.data || msg);
          break;
        case 'chat_created':
          emit('chat_created', msg.data || msg);
          break;
        case 'chat_updated':
          emit('chat_updated', msg.data || msg);
          break;
        case 'channel_post':
          emit('new_message', msg.data || msg);
          break;
        default:
          emit('raw', msg);
      }
    });

    socket.addEventListener('close', (ev) => {
      console.log('[WS] Closed', ev.code);
      isConnecting = false;
      _authenticated = false;
      clearInterval(_pingInterval);
      emit('disconnect', ev);
      scheduleReconnect(token);
    });

    socket.addEventListener('error', (err) => {
      console.warn('[WS] Error', err);
      emit('error', err);
    });
  }

  function scheduleReconnect(token) {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      if (API.getToken()) connect(token || API.getToken());
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.5, maxDelay);
  }

  function disconnect() {
    clearTimeout(reconnectTimer);
    clearInterval(_pingInterval);
    reconnectTimer = null;
    if (socket) {
      socket.onclose = null; // prevent auto-reconnect
      socket.close();
      socket = null;
    }
    _authenticated = false;
  }

  /* ── Helpers for common sends ── */
  function sendTyping(chatId) {
    send({ type: 'typing', chat_id: chatId });
  }
  function sendTypingStop(chatId) {
    send({ type: 'typing_stop', chat_id: chatId });
  }
  function markRead(chatId, messageId) {
    send({ type: 'mark_read', chat_id: chatId, message_id: messageId });
  }

  function isOpen() {
    return socket && socket.readyState === WebSocket.OPEN;
  }

  return { connect, disconnect, send, on, off, sendTyping, sendTypingStop, markRead, isOpen };
})();
