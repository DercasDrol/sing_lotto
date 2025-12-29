# 🎵 Sing Loto / Пой-Лото

**[English](#english) | [Русский](#russian)**

---

<a name="english"></a>
## 🇬🇧 English

A web application for generating music bingo tickets in the style of Russian Lotto.

### Features

- 📋 Ticket format: 3 rows × 9 columns (27 cells)
- 🎯 15 tracks per ticket (5 in each row)
- 🎲 Random generation of unique tickets
- 📄 PDF export (2 tickets per A4 page, vector text)
- 🌐 Bilingual interface (EN/RU)
- 📱 Responsive design
- ✨ Animations with Framer Motion

### Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** — UI components
- **jsPDF** — vector PDF generation
- **Framer Motion** — animations
- **Lucide React** — icons

### Generation Algorithm

Each ticket follows classic Russian Lotto rules:

| Column | ID Range |
|--------|----------|
| 1      | 1-9      |
| 2      | 10-19    |
| 3      | 20-29    |
| 4      | 30-39    |
| 5      | 40-49    |
| 6      | 50-59    |
| 7      | 60-69    |
| 8      | 70-79    |
| 9      | 80-90    |

### Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open in browser
# http://localhost:3010
```

### Usage

1. Enter 90 tracks/artists (one per line)
2. Specify number of tickets (1-100)
3. Click "Generate"
4. Preview tickets
5. Download PDF for printing

### Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/
│   ├── ui/             # Shadcn UI components
│   ├── InputSection.tsx
│   ├── Ticket.tsx
│   ├── TicketGrid.tsx
│   ├── ExportButton.tsx
│   ├── LanguageToggle.tsx
│   └── LanguageContext.tsx
├── lib/
│   ├── ticketLogic.ts  # Ticket generation algorithm
│   ├── i18n.ts         # Translations
│   └── utils.ts        # Utilities
└── types/
    └── ticket.ts       # TypeScript types
```

---

<a name="russian"></a>
## 🇷🇺 Русский

Веб-приложение для создания билетов музыкального бинго в стиле Русского Лото.

### Особенности

- 📋 Формат билета: 3 ряда × 9 колонок (27 ячеек)
- 🎯 15 треков на билет (5 в каждом ряду)
- 🎲 Случайная генерация уникальных билетов
- 📄 Экспорт в PDF (2 билета на страницу А4, векторный текст)
- 🌐 Двуязычный интерфейс (EN/RU)
- 📱 Адаптивный дизайн
- ✨ Анимации с Framer Motion

### Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** — компоненты интерфейса
- **jsPDF** — векторная генерация PDF
- **Framer Motion** — анимации
- **Lucide React** — иконки

### Алгоритм генерации

Каждый билет следует правилам классического Русского Лото:

| Колонка | Диапазон ID |
|---------|-------------|
| 1       | 1-9         |
| 2       | 10-19       |
| 3       | 20-29       |
| 4       | 30-39       |
| 5       | 40-49       |
| 6       | 50-59       |
| 7       | 60-69       |
| 8       | 70-79       |
| 9       | 80-90       |

### Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Открыть в браузере
# http://localhost:3010
```

### Использование

1. Введите 90 треков/артистов (по одному на строку)
2. Укажите количество билетов (1-100)
3. Нажмите "Сгенерировать"
4. Просмотрите билеты в превью
5. Скачайте PDF для печати

### Структура проекта

```
src/
├── app/
│   ├── layout.tsx      # Корневой layout
│   ├── page.tsx        # Главная страница
│   └── globals.css     # Глобальные стили
├── components/
│   ├── ui/             # Shadcn UI компоненты
│   ├── InputSection.tsx
│   ├── Ticket.tsx
│   ├── TicketGrid.tsx
│   ├── ExportButton.tsx
│   ├── LanguageToggle.tsx
│   └── LanguageContext.tsx
├── lib/
│   ├── ticketLogic.ts  # Алгоритм генерации билетов
│   ├── i18n.ts         # Переводы
│   └── utils.ts        # Утилиты
└── types/
    └── ticket.ts       # TypeScript типы
```

---

## License / Лицензия

MIT

## GitHub

https://github.com/DercasDrol/sing_lotto
