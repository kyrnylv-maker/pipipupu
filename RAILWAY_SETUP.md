# 🚂 Настройка Railway - Пошаговая инструкция

## ✅ Файлы готовы!

В проекте уже есть все необходимое:
- ✅ `server.cjs` - сервер
- ✅ `package.json` - со скриптом `"start": "node server.cjs"`
- ✅ `nixpacks.toml` - конфигурация для Railway
- ✅ `railway.json` - настройки деплоя
- ✅ `Dockerfile` - альтернативный способ

---

## 🎯 ПОШАГОВАЯ НАСТРОЙКА

### Шаг 1: Загрузите код на GitHub

```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Шаг 2: Создайте проект на Railway

1. **Перейдите на https://railway.app**
2. **Нажмите "Start a New Project"**
3. **Выберите "Deploy from GitHub repo"**
4. **Авторизуйте Railway доступ к GitHub**
5. **Выберите репозиторий `telegram-web-clone`**

### Шаг 3: Настройте Custom Start Command

**ВАЖНО!** После создания проекта:

1. **Откройте Settings вашего проекта**
2. **Найдите секцию "Deploy"**
3. **В "Custom Start Command" введите:**
   ```bash
   node server.cjs
   ```
4. **Нажмите "Save"**

![Railway Settings Screenshot](https://i.imgur.com/example.png)

### Шаг 4: Настройте переменные окружения (опционально)

В разделе **Variables** добавьте:

```env
NODE_ENV=production
```

`PORT` устанавливается автоматически Railway, не добавляйте его!

### Шаг 5: Задеплойте

**Вариант A: Автоматический**
- Railway автоматически деплоит при создании

**Вариант B: Вручную**
- Settings → Redeploy

### Шаг 6: Получите URL

1. **Settings → Domains**
2. **Generate Domain** (если еще не создан)
3. **Скопируйте URL:**
   ```
   https://your-project-name.up.railway.app
   ```

---

## 📋 Проверочный список Railway Settings

### Deploy Section:
```
✅ Builder: Nixpacks (или Dockerfile)
✅ Custom Start Command: node server.cjs
✅ Root Directory: / (оставить пустым)
✅ Watch Paths: (оставить пустым)
```

### Variables Section:
```
✅ NODE_ENV: production (опционально)
❌ PORT: НЕ добавляйте! (Railway устанавливает автоматически)
```

### GitHub Section:
```
✅ Repository: ваш репозиторий
✅ Branch: main
✅ Auto Deploy: включено
```

---

## 🔍 Проверка после деплоя

### 1. Проверьте логи

Railway Dashboard → Deployments → Latest → Logs

**Должно быть:**
```
✅ Telegram Web Clone running on port 3000
🌐 Open: http://localhost:3000
```

**НЕ должно быть:**
```
❌ Error: Cannot find module
❌ ReferenceError: require is not defined
❌ PathError: Missing parameter name
```

### 2. Откройте приложение

Railway Dashboard → Settings → Domains → Open

**Должна загрузиться:**
- Страница авторизации Telegram
- Кнопки "Вход" и "Регистрация"
- Переключатель темы

### 3. Проверьте health endpoint

Откройте в браузере:
```
https://your-project.up.railway.app/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "message": "Telegram Web Clone is running"
}
```

---

## 🐛 Troubleshooting

### Проблема 1: "Application failed to respond"

**Причина:** Не указан Custom Start Command

**Решение:**
1. Settings → Deploy
2. Custom Start Command: `node server.cjs`
3. Redeploy

### Проблема 2: "Error: Cannot find module 'express'"

**Причина:** Зависимости не установлены

**Решение:**
1. Проверьте что `express` есть в `package.json`
2. Redeploy (Railway переустановит зависимости)

### Проблема 3: "require is not defined"

**Причина:** Используется `server.js` вместо `server.cjs`

**Решение:**
1. Custom Start Command: `node server.cjs`
2. Redeploy

### Проблема 4: "PathError: Missing parameter name"

**Причина:** Старая версия кода

**Решение:**
1. `git pull origin main` (получить последние изменения)
2. `git push origin main`
3. Railway автоматически передеплоит

---

## 🎛 Альтернативные способы

### Способ 1: Использовать Dockerfile

Railway Settings:
```
Builder: Dockerfile
```

Railway автоматически использует `Dockerfile` из проекта.

### Способ 2: Использовать Nixpacks с nixpacks.toml

Railway Settings:
```
Builder: Nixpacks
```

Railway автоматически использует `nixpacks.toml` из проекта.

### Способ 3: Вручную через package.json

Railway по умолчанию запускает `npm start`, который использует:
```json
{
  "scripts": {
    "start": "node server.cjs"
  }
}
```

---

## 📊 Какой способ использовать?

### Рекомендуемый: Custom Start Command
```
Settings → Deploy → Custom Start Command: node server.cjs
```

**Преимущества:**
- ✅ Явно и понятно
- ✅ Легко изменить
- ✅ Не зависит от других файлов

### Альтернатива 1: nixpacks.toml
```toml
[start]
cmd = 'node server.cjs'
```

**Преимущества:**
- ✅ Хранится в Git
- ✅ Версионируется
- ✅ Автоматически применяется

### Альтернатива 2: package.json
```json
{
  "scripts": {
    "start": "node server.cjs"
  }
}
```

**Преимущества:**
- ✅ Стандартный подход Node.js
- ✅ Работает везде (не только Railway)

---

## 🎯 Рекомендуемая конфигурация

### В Railway Dashboard:

```
Settings → Deploy:
├── Builder: Nixpacks
├── Custom Start Command: node server.cjs
└── Root Directory: (пустой)

Settings → Variables:
├── NODE_ENV: production
└── (PORT устанавливается автоматически)

Settings → GitHub:
├── Repository: your-repo
├── Branch: main
└── Auto Deploy: ✅ Enabled
```

---

## 🚀 Быстрый деплой (30 секунд)

```bash
# 1. Коммит и push
git add .
git commit -m "Deploy to Railway"
git push origin main

# 2. В Railway Dashboard:
Settings → Deploy → Custom Start Command: node server.cjs

# 3. Готово!
```

---

## 📱 После успешного деплоя

### 1. Откройте ваш URL
```
https://your-project.up.railway.app
```

### 2. Включите Mock режим

Если бэкенд недоступен:
```javascript
// В консоли браузера (F12)
localStorage.setItem('mockMode', 'true');
location.reload();
```

### 3. Зарегистрируйтесь

Mock режим:
- Имя: Test User
- Логин: test
- Пароль: 123

### 4. Поделитесь!

Отправьте ссылку друзьям:
```
https://your-project.up.railway.app
```

---

## 🎉 Готово!

Ваше приложение развернуто на Railway и работает!

**Custom Start Command решает большинство проблем деплоя.** ✅

---

## 📞 Нужна помощь?

1. Проверьте логи: Railway Dashboard → Deployments → Logs
2. Проверьте настройки: Settings → Deploy
3. См. [FAQ.md](./FAQ.md)
4. Создайте issue на GitHub

---

**Успешного деплоя!** 🚂🚀
