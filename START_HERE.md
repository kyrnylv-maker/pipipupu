# 👋 НАЧНИТЕ ЗДЕСЬ

## ⚡ За 2 минуты

### Локально (на вашем компьютере)

```bash
# Установите зависимости
npm install

# Запустите
npm start

# Откройте браузер
http://localhost:3000
```

**Готово!** Приложение работает локально ✅

---

### На Railway (в интернете)

**Уже все готово! Просто:**

1. **Загрузите на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "First commit"
   git push origin main
   ```

2. **Деплой на Railway:**
   - Перейдите на https://railway.app
   - "Deploy from GitHub repo"
   - Выберите репозиторий
   - Дождитесь деплоя (2-3 минуты)

3. **Готово!** Ваш сайт в интернете 🎉

**Подробнее:** [QUICK_RAILWAY_DEPLOY.md](./QUICK_RAILWAY_DEPLOY.md)

---

## 🧪 Mock режим (тестирование без бэкенда)

Если бэкенд недоступен:

```javascript
// В консоли браузера (F12)
localStorage.setItem('mockMode', 'true');
location.reload();
```

Теперь можно тестировать с фейковыми данными!

---

## 📚 Документация

**Быстрый старт:**
- [QUICK_RAILWAY_DEPLOY.md](./QUICK_RAILWAY_DEPLOY.md) - Деплой за 5 минут
- [SETUP.md](./SETUP.md) - Локальный запуск

**Полная документация:**
- [README.md](./README.md) - Обзор проекта
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - Детальный гайд по Railway
- [FAQ.md](./FAQ.md) - Частые вопросы

**Решение проблем:**
- [FIX_RAILWAY_REGISTRATION.md](./FIX_RAILWAY_REGISTRATION.md) - Ошибка регистрации
- [FIXES.md](./FIXES.md) - Что было исправлено

---

## ❓ Что-то не работает?

### 1. Проверьте консоль
```
F12 → Console
```

### 2. Включите debug
```javascript
localStorage.setItem('debug', 'true');
```

### 3. Очистите localStorage
```javascript
localStorage.clear();
location.reload();
```

### 4. Проверьте FAQ
[FAQ.md](./FAQ.md)

---

## 🎯 Быстрые команды

```bash
# Локальный запуск
npm start

# Сборка для production
npm run build

# Логи Railway
railway logs

# Открыть на Railway
railway open

# Рестарт на Railway
railway restart
```

---

## ✅ Чеклист

**Локально:**
- [ ] `npm install` выполнен
- [ ] `npm start` работает
- [ ] Браузер открыт на http://localhost:3000
- [ ] Страница авторизации загрузилась

**Railway:**
- [ ] Код на GitHub
- [ ] Проект создан на Railway
- [ ] Деплой завершен
- [ ] URL работает
- [ ] Mock режим включен (если нужно)

---

## 🎉 Готово!

**Локально:**
```
http://localhost:3000
```

**Railway:**
```
https://your-project.up.railway.app
```

**Приятного использования!** 🚀
