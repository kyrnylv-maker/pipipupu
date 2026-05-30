# 🏗️ Архитектура приложения

## Обзор

Telegram Web Clone построен с использованием модульной архитектуры на чистом JavaScript без использования фреймворков.

```
┌─────────────────────────────────────────────────┐
│              Browser (Client)                    │
├─────────────────────────────────────────────────┤
│  UI Layer                                        │
│  ├── index.html (DOM Structure)                 │
│  ├── styles.css (Styling)                       │
│  └── app.js (Main Application Logic)            │
├─────────────────────────────────────────────────┤
│  Service Layer                                   │
│  ├── api.js (HTTP API Client)                   │
│  ├── websocket.js (WebSocket Client)            │
│  ├── notifications.js (Push Notifications)      │
│  └── media.js (Media Processing)                │
├─────────────────────────────────────────────────┤
│  Utilities                                       │
│  ├── utils.js (Helper Functions)                │
│  ├── config.js (Configuration)                  │
│  └── mock-data.js (Test Data)                   │
├─────────────────────────────────────────────────┤
│  PWA Layer                                       │
│  ├── sw.js (Service Worker)                     │
│  └── manifest.json (PWA Manifest)               │
└─────────────────────────────────────────────────┘
                      ↓↑
┌─────────────────────────────────────────────────┐
│         Backend (Railway)                        │
├─────────────────────────────────────────────────┤
│  ├── REST API (HTTP)                            │
│  └── WebSocket Server (WSS)                     │
└─────────────────────────────────────────────────┘
```

## Структура файлов

```
telegram-web-clone/
│
├── index.html                  # Главная страница
│
├── public/                     # Публичные ресурсы
│   ├── app.js                  # Основное приложение
│   ├── api.js                  # API клиент
│   ├── websocket.js            # WebSocket клиент
│   ├── utils.js                # Утилиты
│   ├── config.js               # Конфигурация
│   ├── notifications.js        # Уведомления
│   ├── media.js                # Медиа обработка
│   ├── mock-data.js            # Тестовые данные
│   ├── styles.css              # Стили
│   ├── sw.js                   # Service Worker
│   ├── manifest.json           # PWA манифест
│   └── favicon.svg             # Иконка
│
├── dist/                       # Сборка (генерируется)
│
└── docs/                       # Документация
    ├── README.md
    ├── ARCHITECTURE.md
    ├── BACKEND_INTEGRATION.md
    ├── DEPLOYMENT.md
    └── QUICKSTART.md
```

## Компоненты

### 1. UI Layer (Слой интерфейса)

#### app.js
Главный файл приложения, содержащий:
- **State Management**: Глобальное состояние приложения
- **Routing**: Переключение между экранами (auth, messenger, profile)
- **Rendering**: Динамическая генерация HTML
- **Event Handling**: Обработка пользовательских действий

**Основные функции:**
```javascript
// Управление состоянием
const state = {
    user: null,
    token: null,
    currentChat: null,
    chats: [],
    messages: {},
    ws: null
};

// Рендеринг
function render() { ... }
function renderAuthView() { ... }
function renderMessengerView() { ... }
function renderChatView() { ... }

// Обработка событий
function attachAuthListeners() { ... }
function attachMessengerListeners() { ... }
```

#### styles.css
Кастомные стили, дополняющие Tailwind:
- Анимации (fadeIn, slideIn, slideUp)
- Кастомные компоненты (message bubbles, avatars)
- Темы (светлая/темная)
- Scrollbar стилизация
- Responsive утилиты

### 2. Service Layer (Слой сервисов)

#### api.js
HTTP API клиент для взаимодействия с бэкендом.

**Класс API:**
```javascript
class API {
    constructor(baseURL, token)
    
    // Методы
    async login(username, password)
    async register(username, password, displayName)
    async getChats()
    async sendMessage(chatId, text, attachments)
    async createChannel(name, description, isPrivate)
    async uploadFile(file, onProgress)
}
```

**Особенности:**
- Автоматическое добавление токена
- Обработка ошибок
- Поддержка прогресса загрузки
- Typed responses

#### websocket.js
WebSocket клиент для real-time коммуникации.

**Класс WebSocketClient:**
```javascript
class WebSocketClient {
    constructor(url, token)
    
    // Методы
    connect()
    disconnect()
    send(type, payload)
    on(event, callback)
    off(event, callback)
    
    // Автоматическое переподключение
    attemptReconnect()
}
```

**События:**
- `message` - Новое сообщение
- `typing` - Набор текста
- `reaction` - Реакция
- `user_online/offline` - Статус пользователя
- `call_*` - Звонки

#### notifications.js
Управление уведомлениями.

**Класс NotificationManager:**
```javascript
class NotificationManager {
    async init()
    show(title, options)
    showMessageNotification(message, chat)
    showCallNotification(caller, callType)
    playSound(type)
    vibrate(pattern)
    setBadge(count)
}
```

**Возможности:**
- Browser notifications
- Desktop notifications (custom UI)
- Sound effects
- Vibration (mobile)
- Badge API (PWA)

#### media.js
Обработка медиафайлов.

**Класс MediaHandler:**
```javascript
class MediaHandler {
    isImage(file)
    isVideo(file)
    validate(file)
    compressImage(file, maxWidth, maxHeight, quality)
    createThumbnail(file, size)
    getVideoThumbnail(file, seekTo)
    uploadFile(file, url, token, onProgress)
}
```

**Класс VoiceRecorder:**
```javascript
class VoiceRecorder {
    async start()
    async stop()
    cancel()
}
```

### 3. Utilities (Утилиты)

#### utils.js
Вспомогательные функции:

**Форматирование:**
- `formatTime(timestamp)` - Форматирование времени
- `formatFileSize(bytes)` - Размер файла
- `getInitials(name)` - Инициалы
- `pluralize(count, one, few, many)` - Множественное число

**Валидация:**
- `isValidEmail(email)`
- `isValidUsername(username)`
- `isImageFile(file)`

**Работа с данными:**
- `escapeHtml(text)`
- `linkify(text)`
- `mentionify(text)`
- `copyToClipboard(text)`

**Storage:**
- `storage.get(key, defaultValue)`
- `storage.set(key, value)`
- `storage.remove(key)`

#### config.js
Централизованная конфигурация:
```javascript
export const CONFIG = {
    API_URL: 'https://...',
    WS_URL: 'wss://...',
    MAX_MESSAGE_LENGTH: 4096,
    THEMES: ['light', 'dark'],
    COLORS: { ... },
    FEATURES: { ... }
};
```

### 4. PWA Layer

#### sw.js (Service Worker)
- Кэширование ресурсов
- Offline support
- Background sync
- Push notifications
- Auto-update

#### manifest.json
- PWA метаданные
- Иконки
- Shortcuts
- Share target

## Паттерны проектирования

### 1. Module Pattern
Каждый файл экспортирует класс или набор функций:
```javascript
// api.js
class API { ... }
export default API;

// utils.js
export function formatTime() { ... }
export function escapeHtml() { ... }
```

### 2. Singleton Pattern
Единственный экземпляр для сервисов:
```javascript
const notificationManager = new NotificationManager();
export default notificationManager;
```

### 3. Observer Pattern
WebSocket события:
```javascript
ws.on('message', handleMessage);
ws.on('typing', handleTyping);
```

### 4. State Management
Централизованное состояние:
```javascript
const state = {
    user: null,
    chats: [],
    messages: {}
};

function updateState(updates) {
    Object.assign(state, updates);
    render();
}
```

## Поток данных

### Загрузка приложения
```
1. index.html загружается
2. app.js инициализируется
3. checkAuth() проверяет токен
4. Если токен есть:
   - connectWebSocket()
   - loadChats()
   - render() → messenger view
5. Иначе:
   - render() → auth view
```

### Отправка сообщения
```
1. Пользователь вводит текст
2. Нажимает Enter / Send
3. sendMessage(text) вызывается
4. POST /api/chats/{id}/messages
5. Сервер обрабатывает
6. WebSocket отправляет всем участникам
7. handleNewMessage() обновляет UI
8. render() перерисовывает
```

### Real-time обновления
```
1. WebSocket получает событие
2. handleWebSocketMessage(data)
3. switch(data.type):
   - message → handleNewMessage()
   - typing → handleTyping()
   - reaction → handleReaction()
4. Обновление state
5. render() обновляет UI
```

## State Management

### Структура состояния
```javascript
state = {
    // Auth
    user: {
        id, username, displayName,
        avatar, bio, online, lastSeen
    },
    token: "jwt-token",
    
    // Navigation
    currentView: "auth|messenger|profile",
    currentChat: { ... },
    activeFolder: "Все|Чаты|Каналы",
    
    // Data
    chats: [ ... ],
    messages: {
        "chat-id": [ ... ]
    },
    contacts: [ ... ],
    channels: [ ... ],
    
    // Real-time
    ws: WebSocket,
    onlineUsers: Set<userId>,
    typingUsers: Map<chatId, userId>,
    
    // UI
    theme: "light|dark",
    folders: ["Все", "Чаты", "Каналы"]
}
```

### Обновление состояния
```javascript
// Локальное обновление
state.currentChat = chat;
render();

// API обновление
const chats = await api.getChats();
state.chats = chats;
render();

// WebSocket обновление
ws.on('message', (message) => {
    state.messages[chatId].push(message);
    render();
});
```

## Rendering

### Виртуальный DOM отсутствует
Используется прямая манипуляция DOM:
```javascript
function render() {
    const app = document.getElementById('app');
    app.innerHTML = generateHTML();
    attachEventListeners();
}
```

### Оптимизация
- Рендеринг только измененных частей
- Debounce для частых обновлений
- requestAnimationFrame для анимаций

## Error Handling

### HTTP ошибки
```javascript
try {
    const data = await api.getChats();
} catch (error) {
    console.error('API Error:', error);
    showError(error.message);
}
```

### WebSocket ошибки
```javascript
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    showNotification('Ошибка подключения');
};

ws.onclose = () => {
    attemptReconnect();
};
```

## Безопасность

### XSS Prevention
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### Token Management
```javascript
// Хранение токена
localStorage.setItem('token', token);

// Использование
headers: {
    'Authorization': `Bearer ${token}`
}

// Проверка истечения
if (response.status === 401) {
    logout();
}
```

## Performance

### Оптимизации
1. **Lazy Loading**: Сообщения подгружаются по требованию
2. **Debounce**: Набор текста, поиск
3. **Throttle**: Scroll events
4. **Image Compression**: Перед загрузкой
5. **Caching**: localStorage, Service Worker

### Метрики
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse Score: > 90

## Testing

### Мануальное тестирование
```javascript
// Включить mock режим
localStorage.setItem('mockMode', 'true');

// Включить debug
localStorage.setItem('debug', 'true');
```

### Browser DevTools
- Network tab: API запросы
- Console: Логи, ошибки
- Application: localStorage, Service Worker
- Performance: Профилирование

## Будущие улучшения

1. **TypeScript** - Типизация
2. **Build Tool** - Webpack/Vite оптимизация
3. **State Library** - Redux/Zustand
4. **Testing** - Jest, Playwright
5. **Code Splitting** - Динамические импорты
6. **Virtual Scrolling** - Для больших списков
7. **IndexedDB** - Для offline storage

---

**Архитектура проста, но масштабируема!** 🚀
