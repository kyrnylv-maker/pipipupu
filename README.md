# 📱 Telegram Web Clone

![Telegram Web Clone](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)

Полнофункциональный клон Telegram Web, построенный на **чистом JavaScript** (Vanilla JS), HTML и Tailwind CSS с полной интеграцией бэкенда через REST API и WebSocket.

## 🚀 Особенности

### ✅ Реализованный функционал

1. **Авторизация и Профиль**
   - Регистрация и вход пользователей
   - Настройка профиля (имя, username, био)
   - Загрузка и отображение аватаров
   - Управление сеансами

2. **Интерфейс мессенджера**
   - Адаптивный дизайн (Desktop + Mobile)
   - Темная и светлая темы
   - Поиск по контактам и каналам
   - Папки: "Все", "Чаты", "Каналы"

3. **Сообщения (Real-time через WebSocket)**
   - Отправка и получение текстовых сообщений
   - Emoji picker
   - Отправка медиа файлов (фото, видео, документы)
   - Прогресс загрузки файлов
   - Реакции на сообщения
   - Индикатор набора текста
   - Статусы прочтения (одна/две галочки)

4. **Каналы и Группы**
   - Создание каналов (публичных/приватных)
   - Подписка/отписка от каналов
   - Просмотр количества подписчиков
   - Разделение прав (только админ может писать в канал)

5. **Звонки (UI готов)**
   - Аудио звонки
   - Видео звонки
   - WebRTC-готовая архитектура
   - Управление вызовами (отключение микрофона/камеры)

6. **Дополнительно**
   - Статусы онлайн/офлайн
   - Непрочитанные сообщения (счетчики)
   - Форматирование времени
   - Автоматическое переподключение WebSocket

## 🛠 Технологии

- **Frontend**: Vanilla JavaScript (ES6+)
- **Стили**: Tailwind CSS (CDN)
- **Иконки**: Material Icons
- **Real-time**: WebSocket
- **Backend API**: REST API на Railway

## 📁 Структура проекта

```
/
├── index.html          # Главный HTML файл
├── public/
│   ├── app.js          # Основная логика приложения
│   ├── api.js          # HTTP API модуль
│   ├── websocket.js    # WebSocket модуль
│   └── styles.css      # Кастомные стили
└── README.md
```

## 🔧 API Endpoints

### Backend URL
- **HTTP API**: `https://pipipupu-production.up.railway.app`
- **WebSocket**: `wss://pipipupu-production.up.railway.app`

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход

### Пользователи
- `GET /api/users/profile` - Получить профиль
- `PUT /api/users/profile` - Обновить профиль
- `POST /api/users/avatar` - Загрузить аватар
- `GET /api/users/search?q={query}` - Поиск пользователей

### Чаты
- `GET /api/chats` - Получить список чатов
- `GET /api/chats/:id` - Получить чат
- `POST /api/chats` - Создать чат
- `DELETE /api/chats/:id` - Удалить чат

### Сообщения
- `GET /api/chats/:id/messages` - Получить сообщения
- `POST /api/chats/:id/messages` - Отправить сообщение
- `PUT /api/chats/:chatId/messages/:msgId` - Редактировать
- `DELETE /api/chats/:chatId/messages/:msgId` - Удалить
- `POST /api/chats/:chatId/messages/:msgId/read` - Отметить прочитанным

### Каналы
- `GET /api/channels` - Получить каналы
- `POST /api/channels` - Создать канал
- `POST /api/channels/:id/subscribe` - Подписаться
- `POST /api/channels/:id/unsubscribe` - Отписаться
- `GET /api/channels/:id/messages` - Получить сообщения канала
- `POST /api/channels/:id/messages` - Отправить в канал

### Файлы
- `POST /api/upload` - Загрузить файл

## 📡 WebSocket Events

### Отправка (Client → Server)
```javascript
{
  type: 'message',
  payload: { chatId, text, attachments }
}

{
  type: 'typing',
  payload: { chatId, isTyping }
}

{
  type: 'reaction',
  payload: { chatId, messageId, emoji }
}

{
  type: 'read',
  payload: { chatId, messageId }
}
```

### Получение (Server → Client)
```javascript
{
  type: 'message',
  payload: { /* message object */ }
}

{
  type: 'user_online',
  payload: { userId }
}

{
  type: 'user_offline',
  payload: { userId }
}

{
  type: 'typing',
  payload: { chatId, userId, isTyping }
}

{
  type: 'reaction',
  payload: { chatId, messageId, emoji, userId }
}
```

## 🎨 Дизайн

Приложение максимально приближено к дизайну официального Telegram Web:
- Характерные закругления (border-radius)
- Цветовая схема Telegram (#3390ec)
- Анимации и переходы
- Material Icons
- Темная и светлая темы

## 🚀 Запуск

### ✅ Быстрый запуск (исправлена ошибка авторизации)

```bash
# Вариант 1: Открыть напрямую
open index.html

# Вариант 2: Локальный сервер (рекомендуется)
npx serve .
# или
python3 -m http.server 8000
```

Затем откройте http://localhost:8000

### 🧪 Mock режим для тестирования

Если бэкенд недоступен:
```javascript
// В консоли браузера (F12)
localStorage.setItem('mockMode', 'true');
location.reload();
```

Подробнее см. [SETUP.md](./SETUP.md)

## 💡 Использование

### Регистрация
1. Откройте приложение
2. Переключитесь на вкладку "Регистрация"
3. Введите имя, username и пароль
4. Нажмите "Зарегистрироваться"

### Отправка сообщений
1. Выберите чат из списка
2. Введите сообщение в поле ввода
3. Нажмите Enter или кнопку "Отправить"

### Создание канала
1. Нажмите "Новый чат"
2. Выберите "Новый канал"
3. Заполните название и описание
4. Выберите тип (публичный/приватный)
5. Нажмите "Создать"

### Добавление реакций
1. Наведите курсор на сообщение
2. Нажмите кнопку "+" (появится слева или справа от сообщения)
3. Выберите эмодзи

### Звонки
1. Откройте чат
2. Нажмите на иконку телефона (аудио) или камеры (видео)
3. Дождитесь подключения
4. Используйте кнопки управления

## 🔐 Безопасность

- Токен авторизации хранится в localStorage
- Все запросы к API используют Bearer токен
- WebSocket подключение авторизовано через токен
- Автоматический выход при истечении сессии

## 📱 Адаптивность

- Desktop: полный интерфейс с двумя панелями
- Tablet: адаптивное отображение
- Mobile: переключение между списком чатов и активным чатом

## 🎯 Roadmap

- [ ] Голосовые сообщения
- [ ] Стикеры
- [ ] GIF поиск
- [ ] Пересылка сообщений
- [ ] Ответ на сообщения (reply)
- [ ] Редактирование сообщений
- [ ] Группы с несколькими участниками
- [ ] Права администраторов
- [ ] Закрепленные сообщения
- [ ] Архив чатов
- [ ] Уведомления браузера
- [ ] PWA поддержка

## 📚 Документация

- [📖 Архитектура проекта](./ARCHITECTURE.md)
- [🔌 Интеграция с бэкендом](./BACKEND_INTEGRATION.md)
- [🚀 Руководство по развертыванию](./DEPLOYMENT.md)
- [⚡ Быстрый старт](./public/QUICKSTART.md)
- [🤝 Руководство по внесению вклада](./CONTRIBUTING.md)

## 🛠 Troubleshooting

### Проблемы с WebSocket
```javascript
// Проверьте подключение в консоли
console.log(state.ws.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED
```

### Сообщения не отправляются
- Убедитесь, что WebSocket подключен
- Проверьте токен авторизации
- Проверьте формат сообщения

### Темная тема не работает
```javascript
// Очистите localStorage и перезагрузите
localStorage.clear();
location.reload();
```

## 🎯 Roadmap

### v1.1 (В разработке)
- [ ] Редактирование сообщений
- [ ] Пересылка сообщений
- [ ] Ответ на сообщения (reply)
- [ ] Поиск по сообщениям

### v1.2 (Планируется)
- [ ] Голосовые сообщения
- [ ] Стикеры
- [ ] GIF поиск
- [ ] Группы с участниками

### v2.0 (Будущее)
- [ ] Боты и Bot API
- [ ] Секретные чаты
- [ ] Самоуничтожающиеся сообщения
- [ ] Stories

## 🤝 Внесение вклада

Мы приветствуем вклад! Пожалуйста, прочитайте [CONTRIBUTING.md](./CONTRIBUTING.md) для деталей.

### Участники

Спасибо всем, кто вносит вклад в этот проект!

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](./LICENSE) для деталей.

## 👨‍💻 Автор

Проект создан как демонстрация возможностей современного Vanilla JavaScript.

## 🙏 Благодарности

- [Telegram](https://telegram.org/) за вдохновение
- [Tailwind CSS](https://tailwindcss.com/) за отличный CSS framework
- [Material Icons](https://fonts.google.com/icons) за иконки
- Все участники проекта

## ⚠️ Disclaimer

Это **неофициальный** клон Telegram Web, созданный в образовательных целях. Проект не связан с Telegram Messenger Inc.

## 📞 Контакты

- GitHub Issues: [Создать issue](https://github.com/yourusername/telegram-web-clone/issues)
- Discussions: [Обсуждения](https://github.com/yourusername/telegram-web-clone/discussions)

---

**Сделано с ❤️ используя Vanilla JavaScript**

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Powered by Tailwind](https://img.shields.io/badge/Powered%20by-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![WebSocket](https://img.shields.io/badge/Real--time-WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)
