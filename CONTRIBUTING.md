# 🤝 Руководство по внесению вклада

Спасибо за интерес к проекту! Мы рады любому вкладу.

## Как внести вклад

### 1. Fork репозитория

Нажмите кнопку "Fork" в правом верхнем углу GitHub.

### 2. Клонируйте репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/telegram-web-clone.git
cd telegram-web-clone
```

### 3. Создайте ветку

```bash
git checkout -b feature/amazing-feature
# или
git checkout -b fix/bug-fix
```

Именование веток:
- `feature/` - новая функция
- `fix/` - исправление бага
- `docs/` - документация
- `refactor/` - рефакторинг
- `style/` - стили, форматирование

### 4. Внесите изменения

Следуйте стилю кода проекта (см. ниже).

### 5. Commit изменения

```bash
git add .
git commit -m "feat: добавить поддержку стикеров"
```

Формат commit сообщений:
- `feat:` - новая функция
- `fix:` - исправление бага
- `docs:` - документация
- `style:` - форматирование
- `refactor:` - рефакторинг
- `test:` - тесты
- `chore:` - прочее

### 6. Push в ваш fork

```bash
git push origin feature/amazing-feature
```

### 7. Создайте Pull Request

Откройте Pull Request на GitHub с описанием изменений.

## Стиль кода

### JavaScript

```javascript
// ✅ Хорошо
function sendMessage(chatId, text) {
    if (!chatId || !text) return;
    
    const message = {
        chatId,
        text,
        timestamp: new Date().toISOString()
    };
    
    return api.sendMessage(message);
}

// ❌ Плохо
function sendMessage(chatId,text){
if(!chatId||!text)return
const message={chatId,text,timestamp:new Date().toISOString()}
return api.sendMessage(message)
}
```

### Правила
1. **Отступы**: 4 пробела
2. **Кавычки**: одинарные `'`
3. **Точка с запятой**: да
4. **Именование**:
   - camelCase для переменных и функций
   - PascalCase для классов
   - UPPER_CASE для констант
5. **Комментарии**: JSDoc для функций

### HTML/CSS

```html
<!-- ✅ Хорошо -->
<div class="flex items-center gap-3 p-4">
    <img src="avatar.jpg" alt="User" class="w-10 h-10 rounded-full">
    <span class="text-sm font-medium">Username</span>
</div>
```

### CSS классы
- Используйте Tailwind утилиты
- Кастомные классы только для компонентов
- БЭМ методология для сложных компонентов

## Структура файлов

При добавлении новых файлов:

```
public/
├── components/          # Компоненты (если нужны)
│   └── chat-item.js
├── services/            # Сервисы
│   └── analytics.js
└── utils/               # Утилиты
    └── helpers.js
```

## Тестирование

### Мануальное тестирование

Перед отправкой PR, протестируйте:

1. **Основной функционал**:
   - ✅ Регистрация/вход
   - ✅ Отправка сообщений
   - ✅ Создание каналов
   - ✅ Переключение темы

2. **Браузеры**:
   - ✅ Chrome
   - ✅ Firefox
   - ✅ Safari

3. **Устройства**:
   - ✅ Desktop
   - ✅ Mobile

### Mock режим

Для тестирования без бэкенда:
```javascript
localStorage.setItem('mockMode', 'true');
location.reload();
```

## Документация

При добавлении функций:
1. Обновите README.md
2. Добавьте JSDoc комментарии
3. Обновите BACKEND_INTEGRATION.md (если нужно)

### JSDoc пример

```javascript
/**
 * Отправить сообщение в чат
 * @param {string} chatId - ID чата
 * @param {string} text - Текст сообщения
 * @param {Array} [attachments=[]] - Прикрепленные файлы
 * @returns {Promise<Object>} Отправленное сообщение
 * @throws {Error} Если чат не найден
 */
async function sendMessage(chatId, text, attachments = []) {
    // ...
}
```

## Что можно улучшить

### Priority High
- [ ] Редактирование сообщений
- [ ] Пересылка сообщений
- [ ] Голосовые сообщения
- [ ] Стикеры
- [ ] Группы

### Priority Medium
- [ ] Поиск по сообщениям
- [ ] Закрепленные сообщения
- [ ] Архив чатов
- [ ] Папки чатов (custom)
- [ ] Бот API

### Priority Low
- [ ] Темы (custom colors)
- [ ] Анимированные стикеры
- [ ] GIF search
- [ ] Polls
- [ ] Stories

## Баги и проблемы

### Как сообщить о баге

1. Проверьте, что баг уже не зарегистрирован
2. Создайте issue с:
   - Описанием проблемы
   - Шагами воспроизведения
   - Ожидаемым результатом
   - Актуальным результатом
   - Скриншотами (если возможно)
   - Браузер и версия

### Template для issue

```markdown
**Описание бага**
Краткое описание проблемы.

**Воспроизведение**
1. Перейти на страницу...
2. Нажать на...
3. Увидеть ошибку

**Ожидаемое поведение**
Что должно происходить.

**Скриншоты**
Если возможно, добавьте скриншоты.

**Окружение**
- Браузер: Chrome 120
- ОС: macOS 14.0
- Версия: 1.0.0

**Дополнительно**
Любая дополнительная информация.
```

## Code Review

### Что проверяют в PR

1. **Функциональность**: Работает ли код?
2. **Стиль**: Соответствует ли стандартам?
3. **Документация**: Есть ли комментарии?
4. **Тесты**: Протестировано ли?
5. **Performance**: Нет ли проблем с производительностью?

### Критерии приема

- ✅ Код работает
- ✅ Следует стилю проекта
- ✅ Нет console.log (кроме важных)
- ✅ Обработаны ошибки
- ✅ Обновлена документация
- ✅ Протестировано на разных браузерах

## Полезные ссылки

- [Telegram API Documentation](https://core.telegram.org/api)
- [Material Design Icons](https://fonts.google.com/icons)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

## Вопросы?

Если у вас есть вопросы:
1. Проверьте документацию
2. Создайте issue с меткой "question"
3. Напишите в дискуссиях GitHub

## Лицензия

Внося вклад, вы соглашаетесь, что ваш код будет лицензирован под MIT License.

---

**Спасибо за вклад!** ❤️
