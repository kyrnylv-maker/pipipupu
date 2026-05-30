# 🔌 Интеграция с бэкендом

## Обзор

Приложение работает с REST API и WebSocket сервером, развернутым на Railway.

**Backend URL**: `https://pipipupu-production.up.railway.app`

## Архитектура

```
Frontend (Browser)
    ↓
    ├── HTTP Requests → REST API (Railway)
    └── WebSocket → WebSocket Server (Railway)
```

## HTTP API

### Структура запросов

Все запросы к API должны включать:
- `Content-Type: application/json` (для POST/PUT)
- `Authorization: Bearer {token}` (для защищенных эндпоинтов)

### Авторизация

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123",
  "displayName": "John Doe"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "username": "john_doe",
    "displayName": "John Doe",
    "avatar": null,
    "bio": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

#### Выход
```http
POST /api/auth/logout
Authorization: Bearer {token}

Response:
{
  "message": "Logged out successfully"
}
```

### Профиль пользователя

#### Получить профиль
```http
GET /api/users/profile
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "user-123",
    "username": "john_doe",
    "displayName": "John Doe",
    "bio": "Software Developer",
    "avatar": "https://cdn.example.com/avatars/user-123.jpg",
    "online": true,
    "lastSeen": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Обновить профиль
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "displayName": "John M. Doe",
  "bio": "Full-stack Developer",
  "username": "john_m_doe"
}

Response:
{
  "user": { ... }
}
```

#### Загрузить аватар
```http
POST /api/users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  avatar: <file>

Response:
{
  "avatarUrl": "https://cdn.example.com/avatars/user-123.jpg"
}
```

#### Поиск пользователей
```http
GET /api/users/search?q=john
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": "user-123",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatar": "...",
      "online": true
    }
  ]
}
```

### Чаты

#### Список чатов
```http
GET /api/chats
Authorization: Bearer {token}

Response:
{
  "chats": [
    {
      "id": "chat-123",
      "name": "Alice Johnson",
      "avatar": "...",
      "isChannel": false,
      "userId": "user-456",
      "lastMessage": {
        "id": "msg-789",
        "text": "Hello!",
        "timestamp": "2024-01-01T12:00:00.000Z",
        "senderId": "user-456"
      },
      "unreadCount": 3,
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### Создать чат
```http
POST /api/chats
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user-456"
}

Response:
{
  "chat": { ... }
}
```

#### Получить чат
```http
GET /api/chats/{chatId}
Authorization: Bearer {token}

Response:
{
  "chat": { ... }
}
```

#### Удалить чат
```http
DELETE /api/chats/{chatId}
Authorization: Bearer {token}

Response:
{
  "message": "Chat deleted"
}
```

### Сообщения

#### Получить сообщения
```http
GET /api/chats/{chatId}/messages?limit=50&offset=0
Authorization: Bearer {token}

Response:
{
  "messages": [
    {
      "id": "msg-123",
      "chatId": "chat-123",
      "senderId": "user-456",
      "senderName": "Alice Johnson",
      "text": "Hello!",
      "attachments": [],
      "timestamp": "2024-01-01T12:00:00.000Z",
      "read": true,
      "reactions": {
        "👍": ["user-123", "user-789"]
      }
    }
  ],
  "total": 150,
  "hasMore": true
}
```

#### Отправить сообщение
```http
POST /api/chats/{chatId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Hello, Alice!",
  "attachments": [
    {
      "type": "image",
      "url": "https://cdn.example.com/images/photo.jpg",
      "name": "photo.jpg",
      "size": 123456
    }
  ]
}

Response:
{
  "message": { ... }
}
```

#### Редактировать сообщение
```http
PUT /api/chats/{chatId}/messages/{messageId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "Updated message text"
}

Response:
{
  "message": { ... }
}
```

#### Удалить сообщение
```http
DELETE /api/chats/{chatId}/messages/{messageId}
Authorization: Bearer {token}

Response:
{
  "message": "Message deleted"
}
```

#### Отметить прочитанным
```http
POST /api/chats/{chatId}/messages/{messageId}/read
Authorization: Bearer {token}

Response:
{
  "message": "Marked as read"
}
```

#### Добавить реакцию
```http
POST /api/chats/{chatId}/messages/{messageId}/reactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "emoji": "👍"
}

Response:
{
  "reactions": {
    "👍": ["user-123", "user-456"]
  }
}
```

#### Удалить реакцию
```http
DELETE /api/chats/{chatId}/messages/{messageId}/reactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "emoji": "👍"
}

Response:
{
  "reactions": {
    "👍": ["user-456"]
  }
}
```

### Каналы

#### Список каналов
```http
GET /api/channels
Authorization: Bearer {token}

Response:
{
  "channels": [
    {
      "id": "channel-123",
      "name": "Tech News",
      "username": "tech_news",
      "description": "Latest tech news",
      "avatar": "...",
      "subscribersCount": 1250,
      "isPrivate": false,
      "isAdmin": false,
      "subscribed": true
    }
  ]
}
```

#### Создать канал
```http
POST /api/channels
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Channel",
  "description": "Channel description",
  "isPrivate": false
}

Response:
{
  "channel": { ... }
}
```

#### Обновить канал
```http
PUT /api/channels/{channelId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Channel Name",
  "description": "Updated description"
}

Response:
{
  "channel": { ... }
}
```

#### Подписаться на канал
```http
POST /api/channels/{channelId}/subscribe
Authorization: Bearer {token}

Response:
{
  "message": "Subscribed successfully"
}
```

#### Отписаться от канала
```http
POST /api/channels/{channelId}/unsubscribe
Authorization: Bearer {token}

Response:
{
  "message": "Unsubscribed successfully"
}
```

#### Сообщения канала
```http
GET /api/channels/{channelId}/messages?limit=50&offset=0
Authorization: Bearer {token}

Response:
{
  "messages": [ ... ]
}
```

#### Отправить в канал (только админ)
```http
POST /api/channels/{channelId}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "text": "New post in channel",
  "attachments": []
}

Response:
{
  "message": { ... }
}
```

### Загрузка файлов

```http
POST /api/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  file: <file>

Response:
{
  "url": "https://cdn.example.com/files/file-123.jpg",
  "name": "photo.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

## WebSocket

### Подключение

```javascript
const ws = new WebSocket(`wss://pipipupu-production.up.railway.app?token=${token}`);

ws.onopen = () => {
    console.log('Connected');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleMessage(data);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('Disconnected');
};
```

### Отправка сообщений

```javascript
ws.send(JSON.stringify({
    type: 'message',
    payload: {
        chatId: 'chat-123',
        text: 'Hello!',
        attachments: []
    }
}));
```

### События от сервера

#### Новое сообщение
```json
{
  "type": "message",
  "payload": {
    "id": "msg-123",
    "chatId": "chat-123",
    "senderId": "user-456",
    "senderName": "Alice",
    "text": "Hello!",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Пользователь онлайн
```json
{
  "type": "user_online",
  "payload": {
    "userId": "user-456"
  }
}
```

#### Пользователь офлайн
```json
{
  "type": "user_offline",
  "payload": {
    "userId": "user-456"
  }
}
```

#### Набор текста
```json
{
  "type": "typing",
  "payload": {
    "chatId": "chat-123",
    "userId": "user-456",
    "isTyping": true
  }
}
```

#### Реакция на сообщение
```json
{
  "type": "reaction",
  "payload": {
    "chatId": "chat-123",
    "messageId": "msg-123",
    "emoji": "👍",
    "userId": "user-456"
  }
}
```

#### Обновление чата
```json
{
  "type": "chat_update",
  "payload": {
    "chatId": "chat-123",
    "updates": {
      "name": "New Chat Name"
    }
  }
}
```

#### Звонок (offer)
```json
{
  "type": "call_offer",
  "payload": {
    "userId": "user-456",
    "callType": "video",
    "offer": { ... }
  }
}
```

### События от клиента

#### Отправить набор текста
```javascript
ws.send(JSON.stringify({
    type: 'typing',
    payload: {
        chatId: 'chat-123',
        isTyping: true
    }
}));
```

#### Отправить реакцию
```javascript
ws.send(JSON.stringify({
    type: 'reaction',
    payload: {
        chatId: 'chat-123',
        messageId: 'msg-123',
        emoji: '👍'
    }
}));
```

#### Отметить прочитанным
```javascript
ws.send(JSON.stringify({
    type: 'read',
    payload: {
        chatId: 'chat-123',
        messageId: 'msg-123'
    }
}));
```

## Обработка ошибок

### HTTP ошибки

```javascript
try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    
    return await response.json();
} catch (error) {
    console.error('API Error:', error);
    // Показать пользователю
    alert(error.message);
}
```

### WebSocket переподключение

```javascript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
    const ws = new WebSocket(WS_URL);
    
    ws.onclose = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(() => {
                connect();
            }, 3000 * reconnectAttempts);
        }
    };
    
    ws.onopen = () => {
        reconnectAttempts = 0;
    };
}
```

## Аутентификация

### Сохранение токена

```javascript
// После успешного входа
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));

// При каждом запросе
const token = localStorage.getItem('token');
```

### Обновление токена

```javascript
// Если токен истек
if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Перенаправить на страницу входа
    window.location.href = '/';
}
```

## Best Practices

1. **Всегда проверяйте ошибки**
   - Обрабатывайте HTTP ошибки (4xx, 5xx)
   - Обрабатывайте WebSocket disconnects

2. **Используйте дебаунс для набора текста**
   ```javascript
   const sendTyping = debounce((isTyping) => {
       ws.send(JSON.stringify({
           type: 'typing',
           payload: { chatId, isTyping }
       }));
   }, 300);
   ```

3. **Кэшируйте данные**
   - Сохраняйте чаты в localStorage
   - Используйте Service Worker для офлайн режима

4. **Оптимизируйте загрузку сообщений**
   - Используйте пагинацию
   - Подгружайте старые сообщения по требованию

5. **Безопасность**
   - Никогда не храните пароли
   - Используйте HTTPS/WSS
   - Проверяйте токены на истечение

## Тестирование API

### cURL примеры

```bash
# Регистрация
curl -X POST https://pipipupu-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","password":"test123","displayName":"Test User"}'

# Вход
curl -X POST https://pipipupu-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","password":"test123"}'

# Получить чаты
curl https://pipipupu-production.up.railway.app/api/chats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Postman Collection

Импортируйте коллекцию API в Postman для тестирования всех эндпоинтов.

---

**Готово!** Теперь у вас есть полная документация по интеграции с бэкендом.
