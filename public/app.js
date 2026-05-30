// API Configuration
const API_URL = 'https://pipipupu-production.up.railway.app';
const WS_URL = 'wss://pipipupu-production.up.railway.app';

// Global State
const state = {
    user: null,
    token: null,
    currentChat: null,
    chats: [],
    messages: {},
    ws: null,
    theme: localStorage.getItem('theme') || 'light',
    currentView: 'auth',
    folders: ['Все', 'Чаты', 'Каналы'],
    activeFolder: 'Все',
    contacts: [],
    channels: [],
    onlineUsers: new Set(),
    typingUsers: new Map()
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    render();
});

// Theme Management
function initTheme() {
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', state.theme);
    initTheme();
}

// Authentication Check
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.currentView = 'messenger';
        connectWebSocket();
        loadChats();
    } else {
        state.currentView = 'auth';
    }
}

// WebSocket Connection
function connectWebSocket() {
    if (!state.token) return;
    
    state.ws = new WebSocket(`${WS_URL}?token=${state.token}`);
    
    state.ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    state.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    state.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    state.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Reconnect after 3 seconds
        setTimeout(() => {
            if (state.token) connectWebSocket();
        }, 3000);
    };
}

function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'message':
            handleNewMessage(data.payload);
            break;
        case 'user_online':
            state.onlineUsers.add(data.userId);
            render();
            break;
        case 'user_offline':
            state.onlineUsers.delete(data.userId);
            render();
            break;
        case 'typing':
            handleTyping(data);
            break;
        case 'reaction':
            handleReaction(data);
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function handleNewMessage(message) {
    const chatId = message.chatId || message.channelId;
    if (!state.messages[chatId]) {
        state.messages[chatId] = [];
    }
    state.messages[chatId].push(message);
    
    // Update chat list
    const chatIndex = state.chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = message;
        state.chats[chatIndex].timestamp = message.timestamp;
        // Move to top
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
    }
    
    render();
    scrollToBottom();
}

function handleTyping(data) {
    const { chatId, userId, isTyping } = data;
    if (isTyping) {
        state.typingUsers.set(chatId, userId);
    } else {
        state.typingUsers.delete(chatId);
    }
    render();
}

function handleReaction(data) {
    const { messageId, chatId, emoji, userId } = data;
    const messages = state.messages[chatId];
    if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
            if (!message.reactions) message.reactions = {};
            if (!message.reactions[emoji]) message.reactions[emoji] = [];
            if (!message.reactions[emoji].includes(userId)) {
                message.reactions[emoji].push(userId);
            }
            render();
        }
    }
}

// API Calls
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API Error');
    }
    
    return response.json();
}

async function login(username, password) {
    try {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        state.currentView = 'messenger';
        connectWebSocket();
        loadChats();
        render();
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
}

async function register(username, password, displayName) {
    try {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, displayName })
        });
        
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        state.currentView = 'messenger';
        connectWebSocket();
        loadChats();
        render();
    } catch (error) {
        alert('Ошибка регистрации: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (state.ws) state.ws.close();
    state.token = null;
    state.user = null;
    state.currentView = 'auth';
    state.chats = [];
    state.messages = {};
    render();
}

async function loadChats() {
    try {
        const data = await apiCall('/api/chats');
        state.chats = data.chats || [];
        render();
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

async function loadMessages(chatId) {
    try {
        const data = await apiCall(`/api/chats/${chatId}/messages`);
        state.messages[chatId] = data.messages || [];
        render();
        scrollToBottom();
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

async function sendMessage(text, attachments = []) {
    if (!state.currentChat || !text.trim()) return;
    
    try {
        const message = await apiCall(`/api/chats/${state.currentChat.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text, attachments })
        });
        
        // Message will be received via WebSocket
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Ошибка отправки сообщения');
    }
}

async function updateProfile(profileData) {
    try {
        const data = await apiCall('/api/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        
        state.user = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        render();
        alert('Профиль обновлен');
    } catch (error) {
        alert('Ошибка обновления профиля: ' + error.message);
    }
}

async function createChannel(name, description, isPrivate = false) {
    try {
        const channel = await apiCall('/api/channels', {
            method: 'POST',
            body: JSON.stringify({ name, description, isPrivate })
        });
        
        state.chats.unshift(channel);
        render();
        return channel;
    } catch (error) {
        alert('Ошибка создания канала: ' + error.message);
    }
}

async function searchUsers(query) {
    try {
        const data = await apiCall(`/api/users/search?q=${encodeURIComponent(query)}`);
        return data.users || [];
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

// UI Rendering
function render() {
    const app = document.getElementById('app');
    
    if (state.currentView === 'auth') {
        app.innerHTML = renderAuthView();
        attachAuthListeners();
    } else if (state.currentView === 'messenger') {
        app.innerHTML = renderMessengerView();
        attachMessengerListeners();
    } else if (state.currentView === 'profile') {
        app.innerHTML = renderProfileView();
        attachProfileListeners();
    }
}

function renderAuthView() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div class="bg-white dark:bg-tg-dark-secondary rounded-2xl shadow-2xl p-8 w-full max-w-md fade-in">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-tg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span class="material-icons text-white text-4xl">telegram</span>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">Telegram Web</h1>
                    <p class="text-gray-600 dark:text-gray-400">Войдите или зарегистрируйтесь</p>
                </div>
                
                <div id="auth-tabs" class="flex mb-6 bg-gray-100 dark:bg-tg-dark-bg rounded-lg p-1">
                    <button class="auth-tab flex-1 py-2 rounded-md transition-all font-medium active" data-tab="login">
                        Вход
                    </button>
                    <button class="auth-tab flex-1 py-2 rounded-md transition-all font-medium" data-tab="register">
                        Регистрация
                    </button>
                </div>
                
                <div id="login-form" class="auth-form">
                    <div class="space-y-4">
                        <input type="text" id="login-username" placeholder="Логин" 
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white focus:border-tg-primary transition-colors">
                        <input type="password" id="login-password" placeholder="Пароль" 
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white focus:border-tg-primary transition-colors">
                        <button id="login-btn" class="w-full bg-tg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
                            Войти
                        </button>
                    </div>
                </div>
                
                <div id="register-form" class="auth-form hidden">
                    <div class="space-y-4">
                        <input type="text" id="register-name" placeholder="Имя" 
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white focus:border-tg-primary transition-colors">
                        <input type="text" id="register-username" placeholder="Логин (@username)" 
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white focus:border-tg-primary transition-colors">
                        <input type="password" id="register-password" placeholder="Пароль" 
                            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white focus:border-tg-primary transition-colors">
                        <button id="register-btn" class="w-full bg-tg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
                            Зарегистрироваться
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderMessengerView() {
    return `
        <div class="h-screen flex overflow-hidden">
            <!-- Left Sidebar -->
            <div class="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-tg-dark-secondary ${state.currentChat ? 'hidden md:flex' : 'flex'}">
                <!-- Header -->
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <button id="menu-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <span class="material-icons text-gray-600 dark:text-gray-300">menu</span>
                        </button>
                        <div class="flex items-center gap-2">
                            <button id="theme-toggle" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <span class="material-icons text-gray-600 dark:text-gray-300">
                                    ${state.theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                            <button id="profile-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <span class="material-icons text-gray-600 dark:text-gray-300">account_circle</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Search -->
                    <div class="relative">
                        <span class="material-icons absolute left-3 top-3 text-gray-400">search</span>
                        <input type="text" id="search-input" placeholder="Поиск" 
                            class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-tg-dark-bg rounded-lg border-none focus:ring-2 focus:ring-tg-primary dark:text-white">
                    </div>
                </div>
                
                <!-- Folders -->
                <div class="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    ${state.folders.map(folder => `
                        <button class="folder-tab px-4 py-3 whitespace-nowrap ${state.activeFolder === folder ? 'text-tg-primary border-b-2 border-tg-primary font-medium' : 'text-gray-600 dark:text-gray-400'}" data-folder="${folder}">
                            ${folder}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Chat List -->
                <div class="flex-1 overflow-y-auto">
                    ${renderChatList()}
                </div>
                
                <!-- New Chat Button -->
                <button id="new-chat-btn" class="m-4 bg-tg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <span class="material-icons">add_circle</span>
                    Новый чат
                </button>
            </div>
            
            <!-- Chat Area -->
            <div class="flex-1 flex flex-col ${state.currentChat ? 'flex' : 'hidden md:flex'}">
                ${state.currentChat ? renderChatView() : renderEmptyChat()}
            </div>
        </div>
    `;
}

function renderChatList() {
    const filteredChats = filterChats();
    
    if (filteredChats.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8 text-center">
                <span class="material-icons text-6xl mb-4 opacity-50">chat_bubble_outline</span>
                <p>Нет чатов</p>
            </div>
        `;
    }
    
    return filteredChats.map(chat => `
        <div class="chat-item p-4 flex items-center gap-3 ${state.currentChat?.id === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
            <div class="relative flex-shrink-0">
                <div class="avatar w-12 h-12">
                    ${chat.avatar ? `<img src="${chat.avatar}" alt="${chat.name}" class="w-full h-full rounded-full">` : `<span>${getInitials(chat.name)}</span>`}
                </div>
                ${chat.isChannel ? '' : `<div class="status-indicator ${state.onlineUsers.has(chat.userId) ? 'online' : 'offline'}"></div>`}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <h3 class="font-medium truncate ${state.currentChat?.id === chat.id ? 'text-white' : 'dark:text-white'}">${chat.name}</h3>
                    <span class="text-xs text-gray-500 ${state.currentChat?.id === chat.id ? 'text-white text-opacity-70' : 'dark:text-gray-400'}">${formatTime(chat.timestamp)}</span>
                </div>
                <p class="text-sm truncate ${state.currentChat?.id === chat.id ? 'text-white text-opacity-80' : 'text-gray-600 dark:text-gray-400'}">
                    ${chat.lastMessage?.text || 'Нет сообщений'}
                </p>
            </div>
            ${chat.unreadCount ? `<div class="bg-tg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">${chat.unreadCount}</div>` : ''}
        </div>
    `).join('');
}

function renderChatView() {
    const chat = state.currentChat;
    const messages = state.messages[chat.id] || [];
    const isTyping = state.typingUsers.has(chat.id);
    
    return `
        <!-- Chat Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-tg-dark-secondary flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button id="back-btn" class="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">arrow_back</span>
                </button>
                <div class="relative">
                    <div class="avatar w-10 h-10">
                        ${chat.avatar ? `<img src="${chat.avatar}" alt="${chat.name}" class="w-full h-full rounded-full">` : `<span class="text-sm">${getInitials(chat.name)}</span>`}
                    </div>
                    ${chat.isChannel ? '' : `<div class="status-indicator ${state.onlineUsers.has(chat.userId) ? 'online' : 'offline'}"></div>`}
                </div>
                <div>
                    <h2 class="font-medium dark:text-white">${chat.name}</h2>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        ${chat.isChannel ? `${chat.subscribersCount || 0} подписчиков` : (state.onlineUsers.has(chat.userId) ? 'онлайн' : 'офлайн')}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button id="call-audio-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">call</span>
                </button>
                <button id="call-video-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">videocam</span>
                </button>
                <button id="chat-menu-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">more_vert</span>
                </button>
            </div>
        </div>
        
        <!-- Messages -->
        <div id="messages-container" class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-tg-dark-chat">
            ${messages.length === 0 ? `
                <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <span class="material-icons text-6xl mb-4 opacity-50">chat</span>
                    <p>Начните переписку</p>
                </div>
            ` : messages.map(msg => renderMessage(msg)).join('')}
            
            ${isTyping ? `
                <div class="flex items-start gap-2 mb-4">
                    <div class="avatar w-8 h-8 flex-shrink-0">
                        <span class="text-xs">${getInitials(chat.name)}</span>
                    </div>
                    <div class="message-bubble received">
                        <div class="typing-indicator">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- Input Area -->
        <div class="p-4 bg-white dark:bg-tg-dark-secondary border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-end gap-2">
                <button id="attach-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">attach_file</span>
                </button>
                <div class="flex-1 relative">
                    <textarea id="message-input" placeholder="Написать сообщение..." 
                        class="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-tg-dark-bg dark:text-white border-none resize-none focus:ring-2 focus:ring-tg-primary max-h-32"
                        rows="1"></textarea>
                </div>
                <button id="emoji-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <span class="material-icons text-gray-600 dark:text-gray-300">sentiment_satisfied_alt</span>
                </button>
                <button id="send-btn" class="p-2 bg-tg-primary hover:bg-blue-600 text-white rounded-lg">
                    <span class="material-icons">send</span>
                </button>
            </div>
            
            <!-- Emoji Picker (Hidden by default) -->
            <div id="emoji-picker" class="emoji-picker hidden">
                ${renderEmojiPicker()}
            </div>
        </div>
    `;
}

function renderMessage(msg) {
    const isSent = msg.senderId === state.user?.id;
    const time = formatTime(msg.timestamp);
    
    return `
        <div class="flex ${isSent ? 'justify-end' : 'justify-start'} mb-4 message-item slide-up" data-message-id="${msg.id}">
            ${!isSent ? `
                <div class="avatar w-8 h-8 mr-2 flex-shrink-0">
                    <span class="text-xs">${getInitials(msg.senderName || 'U')}</span>
                </div>
            ` : ''}
            <div class="max-w-[65%]">
                <div class="message-bubble ${isSent ? 'sent' : 'received'} relative group">
                    ${msg.attachments && msg.attachments.length > 0 ? renderAttachments(msg.attachments) : ''}
                    <p class="text-sm whitespace-pre-wrap">${escapeHtml(msg.text)}</p>
                    <div class="flex items-center justify-end gap-1 mt-1">
                        <span class="text-xs opacity-70">${time}</span>
                        ${isSent ? `<span class="material-icons text-xs opacity-70">${msg.read ? 'done_all' : 'done'}</span>` : ''}
                    </div>
                    
                    <!-- Reaction Button -->
                    <button class="reaction-add-btn absolute -top-2 ${isSent ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-700 rounded-full p-1" data-message-id="${msg.id}">
                        <span class="material-icons text-sm">add_reaction</span>
                    </button>
                </div>
                
                <!-- Reactions -->
                ${msg.reactions && Object.keys(msg.reactions).length > 0 ? `
                    <div class="flex gap-1 mt-1">
                        ${Object.entries(msg.reactions).map(([emoji, users]) => `
                            <div class="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                                <span>${emoji}</span>
                                <span>${users.length}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderAttachments(attachments) {
    return attachments.map(att => {
        if (att.type === 'image') {
            return `<img src="${att.url}" alt="${att.name}" class="rounded-lg mb-2 max-w-full">`;
        } else if (att.type === 'video') {
            return `<video src="${att.url}" controls class="rounded-lg mb-2 max-w-full"></video>`;
        } else {
            return `
                <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-2">
                    <span class="material-icons text-gray-600 dark:text-gray-300">insert_drive_file</span>
                    <div class="flex-1">
                        <p class="text-sm font-medium">${att.name}</p>
                        <p class="text-xs text-gray-500">${formatFileSize(att.size)}</p>
                    </div>
                    <a href="${att.url}" download class="p-1">
                        <span class="material-icons text-tg-primary">download</span>
                    </a>
                </div>
            `;
        }
    }).join('');
}

function renderEmojiPicker() {
    const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '💫', '⭐', '🌟', '💯', '🎉', '🎊', '🎈'];
    
    return emojis.map(emoji => `<span class="emoji-item">${emoji}</span>`).join('');
}

function renderEmptyChat() {
    return `
        <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-tg-dark-chat">
            <span class="material-icons text-8xl mb-4 opacity-30">chat_bubble_outline</span>
            <h2 class="text-2xl font-medium mb-2">Выберите чат</h2>
            <p class="text-center">Выберите чат из списка или создайте новый</p>
        </div>
    `;
}

function renderProfileView() {
    const user = state.user;
    
    return `
        <div class="min-h-screen bg-gray-50 dark:bg-tg-dark-bg p-4">
            <div class="max-w-2xl mx-auto">
                <div class="bg-white dark:bg-tg-dark-secondary rounded-2xl shadow-lg p-6 mb-4">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold dark:text-white">Профиль</h2>
                        <button id="close-profile-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <span class="material-icons text-gray-600 dark:text-gray-300">close</span>
                        </button>
                    </div>
                    
                    <div class="flex flex-col items-center mb-6">
                        <div class="relative mb-4">
                            <div class="avatar w-32 h-32">
                                ${user.avatar ? `<img src="${user.avatar}" alt="${user.displayName}" class="w-full h-full rounded-full">` : `<span class="text-4xl">${getInitials(user.displayName)}</span>`}
                            </div>
                            <button id="upload-avatar-btn" class="absolute bottom-0 right-0 bg-tg-primary text-white rounded-full p-2 shadow-lg">
                                <span class="material-icons">camera_alt</span>
                            </button>
                        </div>
                        <input type="file" id="avatar-input" accept="image/*" class="hidden">
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Имя</label>
                            <input type="text" id="profile-name" value="${user.displayName || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                            <input type="text" id="profile-username" value="${user.username || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">О себе</label>
                            <textarea id="profile-bio" rows="3" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white resize-none">${user.bio || ''}</textarea>
                        </div>
                        
                        <button id="save-profile-btn" class="w-full bg-tg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-medium">
                            Сохранить
                        </button>
                        
                        <button id="logout-btn" class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium">
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Event Listeners
function attachAuthListeners() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active', 'bg-white', 'dark:bg-tg-dark-secondary', 'text-tg-primary'));
            tab.classList.add('active', 'bg-white', 'dark:bg-tg-dark-secondary', 'text-tg-primary');
            
            document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
            document.getElementById(`${targetTab}-form`).classList.remove('hidden');
        });
    });
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            if (username && password) {
                login(username, password);
            }
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            if (name && username && password) {
                register(username, password, name);
            }
        });
    }
    
    // Enter key support
    document.querySelectorAll('#login-form input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loginBtn?.click();
        });
    });
    
    document.querySelectorAll('#register-form input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') registerBtn?.click();
        });
    });
}

function attachMessengerListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Profile button
    const profileBtn = document.getElementById('profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            state.currentView = 'profile';
            render();
        });
    }
    
    // Chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                state.currentChat = chat;
                loadMessages(chatId);
                render();
            }
        });
    });
    
    // Folder tabs
    document.querySelectorAll('.folder-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            state.activeFolder = tab.dataset.folder;
            render();
        });
    });
    
    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Implement search
            render();
        });
    }
    
    // New chat button
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', showNewChatModal);
    }
    
    // Back button (mobile)
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            state.currentChat = null;
            render();
        });
    }
    
    // Message input
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (messageInput) {
        // Auto-resize textarea
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 128) + 'px';
            
            // Send typing indicator
            if (state.ws && state.ws.readyState === WebSocket.OPEN && state.currentChat) {
                state.ws.send(JSON.stringify({
                    type: 'typing',
                    chatId: state.currentChat.id,
                    isTyping: this.value.length > 0
                }));
            }
        });
        
        // Enter to send (Shift+Enter for new line)
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendBtn?.click();
            }
        });
    }
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const text = messageInput?.value.trim();
            if (text) {
                sendMessage(text);
                messageInput.value = '';
                messageInput.style.height = 'auto';
            }
        });
    }
    
    // Emoji button
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    
    if (emojiBtn && emojiPicker) {
        emojiBtn.addEventListener('click', () => {
            emojiPicker.classList.toggle('hidden');
        });
        
        // Emoji selection
        emojiPicker.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                if (messageInput) {
                    messageInput.value += item.textContent;
                    messageInput.focus();
                }
            });
        });
        
        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                emojiPicker.classList.add('hidden');
            }
        });
    }
    
    // Attach button
    const attachBtn = document.getElementById('attach-btn');
    if (attachBtn) {
        attachBtn.addEventListener('click', showAttachmentModal);
    }
    
    // Call buttons
    const callAudioBtn = document.getElementById('call-audio-btn');
    const callVideoBtn = document.getElementById('call-video-btn');
    
    if (callAudioBtn) {
        callAudioBtn.addEventListener('click', () => startCall('audio'));
    }
    
    if (callVideoBtn) {
        callVideoBtn.addEventListener('click', () => startCall('video'));
    }
    
    // Reaction buttons
    document.querySelectorAll('.reaction-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showReactionPicker(btn.dataset.messageId, btn);
        });
    });
}

function attachProfileListeners() {
    const closeBtn = document.getElementById('close-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
    const avatarInput = document.getElementById('avatar-input');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            state.currentView = 'messenger';
            render();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = document.getElementById('profile-name').value;
            const username = document.getElementById('profile-username').value;
            const bio = document.getElementById('profile-bio').value;
            
            updateProfile({ displayName: name, username, bio });
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (uploadAvatarBtn && avatarInput) {
        uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
        
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Handle avatar upload
                const formData = new FormData();
                formData.append('avatar', file);
                
                try {
                    const response = await fetch(`${API_URL}/api/users/avatar`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${state.token}`
                        },
                        body: formData
                    });
                    
                    const data = await response.json();
                    state.user.avatar = data.avatarUrl;
                    localStorage.setItem('user', JSON.stringify(state.user));
                    render();
                } catch (error) {
                    alert('Ошибка загрузки аватара');
                }
            }
        });
    }
}

// Helper Functions
function filterChats() {
    let filtered = state.chats;
    
    if (state.activeFolder === 'Чаты') {
        filtered = filtered.filter(c => !c.isChannel);
    } else if (state.activeFolder === 'Каналы') {
        filtered = filtered.filter(c => c.isChannel);
    }
    
    const searchQuery = document.getElementById('search-input')?.value.toLowerCase();
    if (searchQuery) {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(searchQuery));
    }
    
    return filtered;
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин';
    if (diff < 86400000) return date.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('ru', { weekday: 'short' });
    return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    setTimeout(() => {
        const container = document.getElementById('messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 100);
}

function showNewChatModal() {
    // Create modal for new chat/channel
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4 dark:text-white">Создать</h3>
            <div class="space-y-3">
                <button class="w-full p-4 bg-gray-100 dark:bg-tg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-3" onclick="createNewChat()">
                    <span class="material-icons text-tg-primary">chat</span>
                    <span class="dark:text-white">Новый чат</span>
                </button>
                <button class="w-full p-4 bg-gray-100 dark:bg-tg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-3" onclick="showCreateChannelModal()">
                    <span class="material-icons text-tg-primary">campaign</span>
                    <span class="dark:text-white">Новый канал</span>
                </button>
                <button class="w-full p-4 bg-gray-100 dark:bg-tg-dark-bg rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-3" onclick="closeModal()">
                    <span class="material-icons text-gray-500">close</span>
                    <span class="dark:text-white">Отмена</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showCreateChannelModal() {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 class="text-xl font-bold mb-4 dark:text-white">Создать канал</h3>
            <div class="space-y-4">
                <input type="text" id="channel-name" placeholder="Название канала" 
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white">
                <textarea id="channel-description" placeholder="Описание канала" rows="3"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-tg-dark-bg dark:text-white resize-none"></textarea>
                <label class="flex items-center gap-2">
                    <input type="checkbox" id="channel-private" class="rounded">
                    <span class="dark:text-white">Приватный канал</span>
                </label>
                <div class="flex gap-2">
                    <button class="flex-1 bg-tg-primary text-white py-2 rounded-lg" onclick="handleCreateChannel()">Создать</button>
                    <button class="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg" onclick="closeModal()">Отмена</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showAttachmentModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,application/*';
    input.onchange = (e) => {
        const files = Array.from(e.target.files);
        // Handle file upload
        console.log('Files selected:', files);
    };
    input.click();
}

function showReactionPicker(messageId, button) {
    const existingPicker = document.querySelector('.reaction-picker');
    if (existingPicker) existingPicker.remove();
    
    const picker = document.createElement('div');
    picker.className = 'reaction-picker';
    const reactions = ['❤️', '👍', '😂', '😮', '😢', '🙏'];
    picker.innerHTML = reactions.map(emoji => 
        `<span class="reaction-item" onclick="addReaction('${messageId}', '${emoji}')">${emoji}</span>`
    ).join('');
    
    button.parentElement.appendChild(picker);
    
    // Close on click outside
    setTimeout(() => {
        document.addEventListener('click', function closePicker(e) {
            if (!picker.contains(e.target) && !button.contains(e.target)) {
                picker.remove();
                document.removeEventListener('click', closePicker);
            }
        });
    }, 100);
}

function addReaction(messageId, emoji) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN && state.currentChat) {
        state.ws.send(JSON.stringify({
            type: 'reaction',
            messageId,
            chatId: state.currentChat.id,
            emoji
        }));
    }
}

function startCall(type) {
    if (!state.currentChat) return;
    
    const modal = document.createElement('div');
    modal.className = 'call-overlay fade-in';
    modal.innerHTML = `
        <div class="text-center text-white">
            <div class="avatar w-32 h-32 mx-auto mb-4">
                ${state.currentChat.avatar ? `<img src="${state.currentChat.avatar}" alt="${state.currentChat.name}" class="w-full h-full rounded-full">` : `<span class="text-5xl">${getInitials(state.currentChat.name)}</span>`}
            </div>
            <h2 class="text-2xl font-bold mb-2">${state.currentChat.name}</h2>
            <p class="text-lg mb-8">${type === 'video' ? 'Видеозвонок' : 'Голосовой звонок'}...</p>
            
            ${type === 'video' ? `
                <div class="mb-8">
                    <video id="local-video" class="w-64 h-48 bg-black rounded-lg mx-auto" autoplay muted></video>
                    <video id="remote-video" class="hidden w-full h-full" autoplay></video>
                </div>
            ` : ''}
            
            <div class="call-controls">
                <button class="call-button mute">
                    <span class="material-icons text-white">mic_off</span>
                </button>
                ${type === 'video' ? `
                    <button class="call-button mute">
                        <span class="material-icons text-white">videocam_off</span>
                    </button>
                ` : ''}
                <button class="call-button end" onclick="endCall()">
                    <span class="material-icons text-white">call_end</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Initialize WebRTC (placeholder)
    if (type === 'video') {
        initializeVideoCall();
    }
}

function endCall() {
    const callOverlay = document.querySelector('.call-overlay');
    if (callOverlay) callOverlay.remove();
    
    // Stop all media tracks
    if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
    }
}

async function initializeVideoCall() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const localVideo = document.getElementById('local-video');
        if (localVideo) {
            localVideo.srcObject = stream;
            window.localStream = stream;
        }
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Не удалось получить доступ к камере/микрофону');
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

function createNewChat() {
    closeModal();
    // Implement new chat creation
    alert('Функция в разработке');
}

async function handleCreateChannel() {
    const name = document.getElementById('channel-name').value;
    const description = document.getElementById('channel-description').value;
    const isPrivate = document.getElementById('channel-private').checked;
    
    if (name) {
        await createChannel(name, description, isPrivate);
        closeModal();
    }
}

// Make functions globally available
window.toggleTheme = toggleTheme;
window.createNewChat = createNewChat;
window.showCreateChannelModal = showCreateChannelModal;
window.handleCreateChannel = handleCreateChannel;
window.closeModal = closeModal;
window.addReaction = addReaction;
window.startCall = startCall;
window.endCall = endCall;
