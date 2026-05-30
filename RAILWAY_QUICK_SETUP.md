# ⚡ Railway - Быстрая настройка

## 🎯 ЧТО НУЖНО СДЕЛАТЬ:

### 1️⃣ Custom Start Command

**Railway Dashboard → Settings → Deploy:**

```
Custom Start Command: node server.cjs
```

![Settings](https://via.placeholder.com/600x100/3390ec/ffffff?text=Custom+Start+Command:+node+server.cjs)

### 2️⃣ Redeploy

**Railway Dashboard → Deployments:**

```
Нажмите "Redeploy"
```

### 3️⃣ Готово! ✅

---

## 📋 Полная конфигурация

### Settings → Deploy

| Параметр | Значение |
|----------|----------|
| **Builder** | Nixpacks |
| **Custom Start Command** | `node server.cjs` |
| **Root Directory** | _(пустой)_ |
| **Watch Paths** | _(пустой)_ |

### Settings → Variables

| Переменная | Значение |
|------------|----------|
| **NODE_ENV** | `production` _(опционально)_ |
| **PORT** | ❌ _НЕ добавлять! (автоматически)_ |

### Settings → GitHub

| Параметр | Значение |
|----------|----------|
| **Repository** | `your-username/telegram-web-clone` |
| **Branch** | `main` |
| **Auto Deploy** | ✅ _Enabled_ |

---

## ✅ Проверка

### После деплоя проверьте:

**1. Логи (Deployments → Logs):**
```
✅ Telegram Web Clone running on port 3000
```

**2. Health endpoint:**
```
https://your-project.up.railway.app/health

Ответ: {"status":"ok","message":"Telegram Web Clone is running"}
```

**3. Главная страница:**
```
https://your-project.up.railway.app/

Должна загрузиться страница авторизации
```

---

## 🚀 Команды

### Через CLI:

```bash
# Установка CLI
npm install -g @railway/cli

# Логин
railway login

# Деплой
railway up

# Логи
railway logs

# Открыть
railway open
```

---

## 🐛 Если не работает:

### Проверьте Custom Start Command:

```
Settings → Deploy → Custom Start Command
```

**Должно быть:** `node server.cjs`

**НЕ должно быть:**
- ❌ `node server.js`
- ❌ `npm start`
- ❌ (пустое)

### Затем Redeploy:

```
Deployments → Redeploy
```

---

## 📱 Включение Mock режима

После деплоя:

```javascript
// В консоли браузера (F12)
localStorage.setItem('mockMode', 'true');
location.reload();
```

**Теперь можно регистрироваться с любыми данными!** ✅

---

## 🎉 Готово!

```
✅ Custom Start Command: node server.cjs
✅ Переменные настроены
✅ Деплой завершен
✅ URL работает
✅ Mock режим доступен
```

**Ваше приложение онлайн:** `https://your-project.up.railway.app` 🚀

---

**Подробная инструкция:** [RAILWAY_SETUP.md](./RAILWAY_SETUP.md)
