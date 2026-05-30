# 🚂 Деплой на Railway

## 📋 Содержание
1. [Подготовка](#подготовка)
2. [Деплой через GitHub](#деплой-через-github)
3. [Деплой через Railway CLI](#деплой-через-railway-cli)
4. [Настройка переменных окружения](#настройка-переменных-окружения)
5. [Проверка](#проверка)
6. [Troubleshooting](#troubleshooting)

---

## Подготовка

### Что уже сделано ✅

В проект добавлено:
- ✅ `server.js` - Express сервер
- ✅ `railway.json` - конфигурация Railway
- ✅ `Procfile` - команда запуска
- ✅ `package.json` - обновлен с Express
- ✅ `.env.example` - пример переменных

### Требования

- Аккаунт на [Railway.app](https://railway.app)
- Git репозиторий (GitHub/GitLab)
- Или Railway CLI

---

## Деплой через GitHub (Рекомендуется)

### Шаг 1: Подготовка репозитория

```bash
# Инициализируйте Git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте коммит
git commit -m "Initial commit - Telegram Web Clone"

# Создайте репозиторий на GitHub и подключите его
git remote add origin https://github.com/YOUR_USERNAME/telegram-web-clone.git

# Загрузите код
git push -u origin main
```

### Шаг 2: Деплой на Railway

1. **Войдите на Railway**
   - Перейдите на https://railway.app
   - Нажмите "Start a New Project"

2. **Подключите GitHub**
   - Выберите "Deploy from GitHub repo"
   - Авторизуйте Railway доступ к GitHub
   - Выберите ваш репозиторий

3. **Railway автоматически определит настройки**
   - Обнаружит Node.js проект
   - Установит зависимости: `npm install`
   - Запустит: `npm start` (который выполнит `node server.js`)

4. **Дождитесь завершения деплоя**
   - Railway покажет логи сборки
   - После завершения появится URL вашего приложения

### Шаг 3: Получите URL

```
https://your-project.up.railway.app
```

---

## Деплой через Railway CLI

### Установка CLI

```bash
# Через npm
npm install -g @railway/cli

# Или через Homebrew (Mac)
brew install railway
```

### Авторизация

```bash
railway login
```

### Деплой

```bash
# В корневой папке проекта
railway init

# Выберите "Create new project"
# Введите имя проекта: telegram-web-clone

# Деплой
railway up

# Получить URL
railway domain
```

---

## Настройка переменных окружения

### Через Railway Dashboard

1. Откройте ваш проект на Railway
2. Перейдите в "Variables"
3. Добавьте переменные:

```env
NODE_ENV=production
PORT=3000
API_URL=https://pipipupu-production.up.railway.app
WS_URL=wss://pipipupu-production.up.railway.app
```

### Через CLI

```bash
# Установить переменную
railway variables set NODE_ENV=production
railway variables set API_URL=https://pipipupu-production.up.railway.app
railway variables set WS_URL=wss://pipipupu-production.up.railway.app

# Посмотреть все переменные
railway variables
```

### Важно! ⚠️

Railway автоматически устанавливает `PORT`, поэтому в коде используется:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## Проверка

### 1. Проверьте логи

**Через Dashboard:**
- Откройте проект → Deployments → Latest → Logs

**Через CLI:**
```bash
railway logs
```

Вы должны увидеть:
```
✅ Telegram Web Clone running on port 3000
🌐 Open: http://localhost:3000
```

### 2. Откройте приложение

```bash
# Через CLI
railway open

# Или вручную откройте URL
```

### 3. Проверьте функциональность

1. **Откройте сайт**
   - Должна загрузиться страница авторизации

2. **Проверьте консоль браузера (F12)**
   - Не должно быть ошибок

3. **Попробуйте зарегистрироваться**
   - Если бэкенд доступен, регистрация должна работать

---

## Настройка домена (опционально)

### Custom Domain

1. **В Railway Dashboard:**
   - Settings → Domains
   - Add Custom Domain
   - Введите ваш домен: `telegram.yourdomain.com`

2. **Настройте DNS:**
   ```
   Type: CNAME
   Name: telegram
   Value: your-project.up.railway.app
   ```

3. **Railway автоматически настроит SSL** ✅

---

## Автоматический деплой

Railway автоматически деплоит при push в main:

```bash
# Внесите изменения
git add .
git commit -m "Update feature"
git push

# Railway автоматически задеплоит
```

### Отключить автодеплой:

Settings → GitHub → Disable Auto-Deploy

---

## Troubleshooting

### Проблема 1: Приложение не запускается

**Проверьте логи:**
```bash
railway logs
```

**Частые причины:**
- Отсутствует `node_modules` - Railway должен установить сам
- Неправильный `start` скрипт - проверьте `package.json`
- Порт не `process.env.PORT` - исправьте в `server.js`

**Решение:**
```bash
# Пересоберите
railway up --detach
```

### Проблема 2: 404 Not Found

**Причина:** Express не находит файлы

**Решение:** Проверьте `server.js`:
```javascript
app.use(express.static('public'));
app.use(express.static('.'));
```

### Проблема 3: Cannot GET /

**Причина:** Не работает fallback роутинг

**Решение:** Убедитесь что есть:
```javascript
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
```

### Проблема 4: API не работает (CORS)

**Причина:** Бэкенд не разрешает запросы с Railway домена

**Решение:** Обновите CORS на бэкенде:
```javascript
// На вашем бэкенде
app.use(cors({
    origin: [
        'https://your-project.up.railway.app',
        'http://localhost:3000'
    ]
}));
```

### Проблема 5: WebSocket не подключается

**Проверьте:**
1. Используется ли `wss://` (не `ws://`)
2. Токен правильный
3. Бэкенд поддерживает WebSocket

**Debug:**
```javascript
// В консоли браузера
console.log('WS_URL:', 'wss://pipipupu-production.up.railway.app');
console.log('Token:', localStorage.getItem('token'));
```

### Проблема 6: 502 Bad Gateway

**Причина:** Сервер не отвечает

**Решение:**
1. Проверьте что сервер слушает на правильном порту
2. Перезапустите проект:
```bash
railway restart
```

---

## Мониторинг

### Просмотр метрик

Railway Dashboard → Metrics:
- CPU usage
- Memory usage
- Network traffic

### Настройка алертов

Settings → Notifications → Add notification

---

## Масштабирование

### Vertical Scaling (больше ресурсов)

Settings → Resources:
- Increase CPU
- Increase Memory

### Horizontal Scaling (несколько инстансов)

Railway Pro план:
- Settings → Scaling
- Add replicas

---

## Стоимость

### Free Tier
- ✅ $5 кредитов в месяц
- ✅ Достаточно для небольших проектов
- ✅ Автоматический sleep при неактивности

### Оптимизация расходов:
1. Используйте sleep mode
2. Настройте auto-scale
3. Оптимизируйте ресурсы

---

## Полезные команды

```bash
# Логи
railway logs

# Статус
railway status

# Переменные
railway variables

# Открыть в браузере
railway open

# Удалить проект
railway delete

# Рестарт
railway restart

# Shell доступ
railway shell
```

---

## Чеклист перед деплоем

- [ ] `package.json` обновлен
- [ ] Express установлен: `npm install express`
- [ ] `server.js` создан
- [ ] `railway.json` создан
- [ ] Git репозиторий инициализирован
- [ ] Код закоммичен
- [ ] Репозиторий загружен на GitHub
- [ ] Railway проект создан
- [ ] Переменные окружения настроены
- [ ] Деплой завершен успешно
- [ ] URL работает
- [ ] Функциональность протестирована

---

## Следующие шаги

После успешного деплоя:

1. **Настройте домен** (опционально)
2. **Настройте мониторинг**
3. **Включите автодеплой** с GitHub
4. **Добавьте CI/CD** (опционально)
5. **Настройте бэкап** (опционально)

---

## Дополнительная информация

### Документация Railway
- https://docs.railway.app/

### Примеры
- https://github.com/railwayapp/examples

### Поддержка
- Discord: https://discord.gg/railway
- GitHub Issues

---

## Краткая инструкция (TL;DR)

```bash
# 1. Установите зависимости
npm install

# 2. Создайте Git репозиторий
git init
git add .
git commit -m "Initial commit"

# 3. Загрузите на GitHub
git remote add origin https://github.com/YOUR_USERNAME/telegram-web-clone.git
git push -u origin main

# 4. Деплой на Railway
# Перейдите на railway.app
# Deploy from GitHub repo
# Выберите ваш репозиторий
# Готово! 🎉
```

---

**Ваше приложение теперь доступно по адресу:**
```
https://your-project.up.railway.app
```

**Успешного деплоя!** 🚀
