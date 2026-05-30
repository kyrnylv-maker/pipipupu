# ❓ Часто задаваемые вопросы (FAQ)

## Общие вопросы

### Что это за проект?

Это полнофункциональный клон Telegram Web, написанный на чистом JavaScript (Vanilla JS) без использования React, Vue или других фреймворков. Проект демонстрирует, как создать современное веб-приложение используя только стандартные веб-технологии.

### Это официальное приложение Telegram?

Нет, это **неофициальный** образовательный проект. Он не связан с Telegram Messenger Inc.

### Можно ли использовать его в production?

Проект создан в образовательных целях. Для production использования потребуется:
- Тщательное тестирование
- Аудит безопасности
- Оптимизация производительности
- Настройка CI/CD

### Какие браузеры поддерживаются?

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android 5+)

## Технические вопросы

### Почему Vanilla JS, а не React/Vue?

Проект демонстрирует:
1. Как работают современные фреймворки "под капотом"
2. Чистые веб-технологии без абстракций
3. Легковесность (без bundle overhead)
4. Простоту понимания для начинающих

### Как работает управление состоянием?

Используется простой глобальный объект `state`:
```javascript
const state = {
    user: null,
    chats: [],
    messages: {}
};
```

При изменении состояния вызывается `render()` для перерисовки UI.

### Почему нет TypeScript?

Для простоты обучения используется чистый JavaScript. TypeScript можно легко добавить:
```bash
npm install -D typescript
# Переименуйте .js в .ts
# Добавьте tsconfig.json
```

### Как добавить новую функцию?

1. Создайте функцию в соответствующем файле
2. Добавьте UI элементы в рендер-функцию
3. Присоедините event listeners
4. Обновите документацию

Пример:
```javascript
// В app.js
function createGroup(name, members) {
    // Логика создания группы
}

// В render функции
<button onclick="showCreateGroupModal()">
    Создать группу
</button>
```

## Функциональность

### Как отправить сообщение?

1. Выберите чат из списка
2. Введите текст в поле ввода
3. Нажмите Enter или кнопку "Отправить"

### Как создать канал?

1. Нажмите "Новый чат"
2. Выберите "Новый канал"
3. Введите название и описание
4. Выберите тип (публичный/приватный)
5. Нажмите "Создать"

### Как добавить реакцию?

1. Наведите на сообщение
2. Нажмите кнопку "+" (появится рядом с сообщением)
3. Выберите emoji

### Как переключить тему?

Нажмите на иконку солнца/луны в правом верхнем углу.

Или программно:
```javascript
toggleTheme();
```

### Работают ли звонки?

UI для звонков готов. WebRTC интеграция требует:
1. Настройки TURN/STUN серверов
2. Бэкенд поддержки сигналинга
3. Обработки медиа потоков

## Разработка

### Как запустить локально?

```bash
# Вариант 1: Открыть index.html
open index.html

# Вариант 2: Локальный сервер
npx serve .
```

### Как включить mock режим?

```javascript
localStorage.setItem('mockMode', 'true');
location.reload();
```

В mock режиме используются тестовые данные без подключения к бэкенду.

### Как отлаживать WebSocket?

```javascript
// Включить debug логи
localStorage.setItem('debug', 'true');

// Проверить состояние
console.log(state.ws.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED

// Мониторить события
state.ws.addEventListener('message', (event) => {
    console.log('WebSocket message:', event.data);
});
```

### Как очистить все данные?

```javascript
localStorage.clear();
location.reload();
```

Или в DevTools:
Application → Storage → Clear site data

## Бэкенд

### Где находится бэкенд?

Backend развернут на Railway:
- HTTP API: `https://pipipupu-production.up.railway.app`
- WebSocket: `wss://pipipupu-production.up.railway.app`

### Как подключить свой бэкенд?

Обновите `public/config.js`:
```javascript
export const CONFIG = {
    API_URL: 'https://your-backend.com',
    WS_URL: 'wss://your-backend.com'
};
```

### Какие API endpoints доступны?

См. полную документацию в [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

Основные:
- `POST /api/auth/login` - Вход
- `GET /api/chats` - Список чатов
- `POST /api/chats/:id/messages` - Отправить сообщение
- `POST /api/channels` - Создать канал

### Как работает аутентификация?

1. Пользователь входит → получает JWT token
2. Token сохраняется в localStorage
3. Все запросы включают header:
   ```
   Authorization: Bearer {token}
   ```

## Проблемы и решения

### WebSocket не подключается

**Проблема**: `WebSocket connection failed`

**Решения**:
1. Проверьте токен:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

2. Проверьте URL:
   ```javascript
   console.log(WS_URL);
   ```

3. Проверьте HTTPS (требуется для WSS)

4. Проверьте firewall/proxy настройки

### Сообщения не отправляются

**Проблема**: Сообщения не доходят до сервера

**Решения**:
1. Проверьте WebSocket подключение:
   ```javascript
   console.log(state.ws?.readyState === 1); // должно быть true
   ```

2. Проверьте формат сообщения

3. Проверьте чат выбран:
   ```javascript
   console.log(state.currentChat);
   ```

### Темная тема не применяется

**Проблема**: Тема не меняется

**Решения**:
1. Очистите localStorage:
   ```javascript
   localStorage.removeItem('theme');
   ```

2. Проверьте класс на html:
   ```javascript
   console.log(document.documentElement.classList.contains('dark'));
   ```

3. Принудительно установите:
   ```javascript
   state.theme = 'dark';
   initTheme();
   ```

### Файлы не загружаются

**Проблема**: Ошибка при загрузке файлов

**Решения**:
1. Проверьте размер файла (макс. 50 МБ)
2. Проверьте тип файла
3. Проверьте CORS на сервере
4. Проверьте endpoint:
   ```javascript
   console.log(API_URL + '/api/upload');
   ```

### 401 Unauthorized

**Проблема**: Все запросы возвращают 401

**Решение**:
Токен истек, нужно войти снова:
```javascript
logout();
```

### CORS ошибка

**Проблема**: `CORS policy: No 'Access-Control-Allow-Origin'`

**Решение**:
Бэкенд должен включить CORS:
```javascript
// На сервере
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
```

## Performance

### Приложение работает медленно

**Решения**:
1. Очистите старые сообщения:
   ```javascript
   // Оставить только последние 100
   state.messages[chatId] = state.messages[chatId].slice(-100);
   ```

2. Используйте debounce для поиска

3. Оптимизируйте рендеринг (рендерить только видимые элементы)

### Большой размер bundle

**Решение**:
Проект уже минимален. Для дальнейшей оптимизации:
1. Используйте Vite/Webpack code splitting
2. Lazy load компонентов
3. Минификация (уже включена)

## Безопасность

### Безопасно ли хранить токен в localStorage?

**Ответ**: localStorage доступен только для вашего домена, но:
- ⚠️ Уязвим к XSS атакам
- ✅ Мы используем escapeHtml для защиты
- ✅ Токены имеют срок действия

Для production рекомендуется:
- HttpOnly cookies
- CSRF защита
- Regular token rotation

### Как защититься от XSS?

Используем:
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

Всегда экранируем пользовательский ввод перед отображением.

## Развертывание

### Как деплоить на Vercel?

```bash
npm install -g vercel
vercel
```

См. [DEPLOYMENT.md](./DEPLOYMENT.md) для деталей.

### Как деплоить на Netlify?

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

### Нужен ли Node.js для production?

Нет! Это статический сайт, нужен только веб-сервер (nginx, Apache, или CDN).

## PWA

### Как установить как приложение?

В Chrome/Edge:
1. Откройте приложение
2. Нажмите на иконку установки в адресной строке
3. Или: Menu → Install Telegram Web

### Работает ли офлайн?

Частично. Service Worker кэширует:
- ✅ UI и стили
- ✅ JavaScript
- ❌ API данные (требуется подключение)

### Как обновить Service Worker?

```javascript
// В DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.update());
});
```

## Другое

### Можно ли использовать с другим бэкендом?

Да! Просто обновите API endpoints в `config.js`.

### Есть ли мобильное приложение?

Нет, но веб-версия адаптивна и работает на мобильных устройствах.

### Как внести вклад?

См. [CONTRIBUTING.md](./CONTRIBUTING.md).

### Где найти документацию API?

См. [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

### Поддерживаются ли боты?

Пока нет. Запланировано в v2.0.

---

## Не нашли ответ?

1. Проверьте [документацию](./README.md)
2. Создайте [issue](https://github.com/yourusername/telegram-web-clone/issues)
3. Задайте вопрос в [discussions](https://github.com/yourusername/telegram-web-clone/discussions)

**Будем рады помочь!** 💬
