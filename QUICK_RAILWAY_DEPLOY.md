# ⚡ Быстрый деплой на Railway

## 🎯 За 5 минут

### Вариант 1: Через GitHub (Рекомендуется)

```bash
# 1. Создайте репозиторий на GitHub
# Перейдите на github.com → New repository

# 2. Загрузите код
git init
git add .
git commit -m "Telegram Web Clone"
git remote add origin https://github.com/YOUR_USERNAME/telegram-web-clone.git
git push -u origin main

# 3. Деплой на Railway
# - Перейдите на https://railway.app
# - Нажмите "Start a New Project"
# - Выберите "Deploy from GitHub repo"
# - Выберите ваш репозиторий
# - Готово! 🎉
```

### Вариант 2: Через Railway CLI

```bash
# 1. Установите Railway CLI
npm install -g @railway/cli

# 2. Авторизуйтесь
railway login

# 3. Деплой
railway init
railway up

# 4. Откройте приложение
railway open
```

---

## ✅ Что уже настроено

В проекте уже есть все необходимое:

- ✅ `server.js` - Express сервер
- ✅ `package.json` - с нужными зависимостями
- ✅ `railway.json` - конфигурация Railway
- ✅ `Procfile` - команда запуска

**Ничего дополнительно настраивать не нужно!**

---

## 🔧 После деплоя

### Получить URL приложения

**Через Dashboard:**
- Settings → Domains → Copy URL

**Через CLI:**
```bash
railway domain
```

### Настроить переменные (опционально)

```bash
railway variables set API_URL=https://pipipupu-production.up.railway.app
railway variables set WS_URL=wss://pipipupu-production.up.railway.app
```

### Открыть приложение

```bash
railway open
```

---

## 📱 Проверка

1. **Откройте ваш URL**
   ```
   https://your-project.up.railway.app
   ```

2. **Должна загрузиться страница Telegram**
   - Форма авторизации
   - Кнопки "Вход" и "Регистрация"

3. **Попробуйте зарегистрироваться**
   - Введите имя, логин, пароль
   - Нажмите "Зарегистрироваться"

---

## 🐛 Если что-то не работает

### Проверьте логи

```bash
railway logs
```

Должно быть:
```
✅ Telegram Web Clone running on port 3000
```

### Частые проблемы

**1. Ошибка регистрации**
- Проверьте что бэкенд `https://pipipupu-production.up.railway.app` работает
- Откройте консоль браузера (F12) и посмотрите ошибки

**2. Не загружается страница**
- Подождите 1-2 минуты (первый деплой может быть медленным)
- Проверьте статус: `railway status`

**3. 502 Bad Gateway**
- Перезапустите: `railway restart`

---

## 💡 Полезные команды

```bash
# Посмотреть логи
railway logs

# Рестарт
railway restart

# Статус
railway status

# Открыть в браузере
railway open

# Переменные окружения
railway variables
```

---

## 🎉 Готово!

Ваше приложение теперь доступно онлайн!

**URL:** `https://your-project.up.railway.app`

**Поделитесь с друзьями!** 🚀

---

## 📚 Дополнительно

Полная инструкция: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

**Нужна помощь?** Создайте issue на GitHub.
