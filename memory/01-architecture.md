# 01. Архитектура

## Стек
- Чистый статичный сайт: HTML + CSS + JavaScript (ES5-совместимый, без сборки).
- Никакого бэкенда и БД. Открывается двойным кликом по `index.html` (file://) или
  через любой статик-сервер.
- Скрипты подключаются обычными `<script>` (НЕ ES-модули) — чтобы работало по
  `file://` без CORS-ошибок. Общее пространство имён `window.CVApp`, каждый файл
  добавляет свой подмодуль.

## Порядок загрузки скриптов (задан в index.html)
1. `js/state.js` — модель данных + localStorage.
2. `i18n/en.js`, `i18n/ru.js`, `i18n/hy.js` — словари (наполняют `CVApp.i18n.dict`).
3. `js/i18n.js` — `t()`, `setLang()`, `apply()`.
4. Модули: `photo.js`, `fields.js`, `form.js`, `preview.js`, `templates.js`.
5. Вендор: `vendor/html2canvas.min.js`, `vendor/jspdf.umd.min.js`, затем `export.js`.
6. `js/main.js` — bootstrap (последним), запускается на DOMContentLoaded.

## Модель данных (state.js)
Ключ localStorage: `cv-builder`. Форма объекта:
```
{ lang, template, photo (base64 data-URL или ''),
  fullName, jobTitle, email, phone, location, website, summary,
  experience: [{position, company, period, description}],
  education:  [{degree, institution, period}],
  skills:     ['строка', ...],
  languages:  [{name, level}] }
```
`State.set/replace/reset` пишут в localStorage и вызывают подписчиков (`notify`).
`load()` мержит сохранённое поверх `defaultData()`, чтобы новые поля не были
undefined.

## Поток данных
Ввод в поле → обработчик в form.js/fields.js обновляет state → `State.notify()` →
подписчик в main.js вызывает `preview.render()` → предпросмотр перерисовывается из
state. Форма при этом не перестраивается (фокус сохраняется); списки
опыт/образование/языки перестраиваются только при add/remove.

## Правило модульности
Один файл — одна ответственность. Файлы держим компактными. Логику новой фичи —
в новый файл-подмодуль `CVApp.<name>`, подключить в index.html в правильном месте.
