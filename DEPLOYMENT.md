# 🚀 Инструкция по развертыванию

## Локальная разработка

### Вариант 1: Открыть напрямую
```bash
# Откройте index.html в браузере
open index.html
```

### Вариант 2: Локальный сервер
```bash
# Используя Python 3
python3 -m http.server 8000

# Используя Node.js (npx)
npx serve .

# Используя Node.js (http-server)
npm install -g http-server
http-server -p 8000
```

Затем откройте http://localhost:8000

## Сборка для production

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Развертывание на Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Разверните проект:
```bash
vercel
```

4. Для production:
```bash
vercel --prod
```

## Развертывание на Netlify

### Через Netlify CLI

1. Установите CLI:
```bash
npm install -g netlify-cli
```

2. Войдите:
```bash
netlify login
```

3. Разверните:
```bash
netlify deploy --prod --dir=public
```

### Через Netlify Drop

1. Соберите проект: `npm run build`
2. Перетащите папку `dist/` на https://app.netlify.com/drop

### Через Git

1. Создайте файл `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Подключите репозиторий к Netlify

## Развертывание на GitHub Pages

1. Обновите `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

2. Соберите проект:
```bash
npm run build
```

3. Разверните:
```bash
# Используя gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## Развертывание на Railway

1. Создайте `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Создайте проект на Railway
3. Подключите репозиторий
4. Railway автоматически обнаружит Dockerfile

## Развертывание на Firebase Hosting

1. Установите Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Войдите:
```bash
firebase login
```

3. Инициализируйте проект:
```bash
firebase init hosting
```

4. Выберите папку `public` как публичную директорию

5. Разверните:
```bash
firebase deploy
```

## Настройка окружения

### Production API URLs

Обновите `public/config.js`:

```javascript
export const CONFIG = {
    API_URL: 'https://your-backend.railway.app',
    WS_URL: 'wss://your-backend.railway.app',
    // ...
}
```

### Переменные окружения

Создайте `.env`:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_WS_URL=wss://your-backend.railway.app
```

Используйте в коде:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## PWA настройки

### Service Worker

Service Worker уже настроен в `public/sw.js`

### Манифест

Обновите `public/manifest.json`:
- Добавьте правильные иконки
- Обновите URLs
- Настройте цвета

### Иконки

Создайте иконки для PWA:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

Используйте сервисы:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/

## SSL/HTTPS

WebSocket требует HTTPS в production:
- Vercel/Netlify предоставляют бесплатный SSL
- Для кастомного домена настройте Let's Encrypt

## Оптимизация

### Минификация

```bash
# Уже включено в vite build
npm run build
```

### Кэширование

Настройте headers в `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Compression

Включите gzip/brotli на вашем хостинге

## Мониторинг

### Google Analytics

Добавьте в `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Sentry (Error tracking)

```bash
npm install @sentry/browser
```

```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

## Тестирование

### Локально

```bash
# После сборки
npm run build
npx serve dist
```

### Мобильное тестирование

1. Получите локальный IP:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

2. Запустите сервер:
```bash
npx serve -p 8000
```

3. Откройте на мобильном:
```
http://YOUR_IP:8000
```

## Troubleshooting

### CORS ошибки
- Убедитесь, что бэкенд настроен для CORS
- Проверьте заголовки Access-Control-Allow-Origin

### WebSocket не подключается
- Проверьте WSS протокол (не WS) для HTTPS
- Проверьте токен авторизации
- Проверьте firewall настройки

### 404 ошибки
- Настройте перенаправления для SPA
- Используйте hash routing вместо history API

### Service Worker не обновляется
- Очистите кэш браузера
- Добавьте versioning в CACHE_NAME
- Используйте skipWaiting()

## Чеклист перед деплоем

- [ ] Обновлены API URLs в config.js
- [ ] Настроен манифест PWA
- [ ] Добавлены иконки
- [ ] Протестировано локально
- [ ] Проверена мобильная версия
- [ ] Настроен SSL/HTTPS
- [ ] Включена компрессия
- [ ] Настроены заголовки кэширования
- [ ] Добавлена аналитика
- [ ] Настроен error tracking
- [ ] Протестированы все функции
- [ ] Проверены performance metrics

## Полезные ссылки

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [PWA Builder](https://www.pwabuilder.com/)

---

**Готово!** 🎉 Ваш Telegram Web Clone готов к развертыванию!
