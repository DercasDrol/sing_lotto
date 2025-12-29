# Copilot / AI Agents — Instructions for `sing_loto` Repository

## Overview
This repository is a frontend web application built with Next.js 14 (App Router) + TypeScript for generating "Music Lotto" (Sing Loto) bingo tickets. AI agents work with both UI components and algorithmic logic in `src/lib`.

## User Interaction Rules
- ALL questions, confirmations, or clarifications to the user MUST be done via the `mcp_interactive-m_ask_user_text` tool (default language: Russian). Do not send direct questions in chat without using the tool.
- Before making code changes, always get user confirmation (yes/no or option selection).
- Cannot end the session without explicit user confirmation via `mcp_interactive-m_ask_user_text` that the result is satisfactory.

## Architecture Overview

### Entry Points (Next.js 14, App Router)
- `src/app/layout.tsx` — global fonts/metadata, LanguageProvider wrapper
- `src/app/page.tsx` — main page, combines UI and generation logic

### UI Components
- `src/components/` — main components:
  - `InputSection` — track input form with validation
  - `Ticket` — single ticket preview with adaptive font sizing
  - `TicketGrid` — grid of ticket previews
  - `ExportButton` — PDF export functionality
  - `MissedTracksSection` — displays tracks not covered
  - `ValidationStatus` — ticket validation display
  - `LanguageToggle` — EN/RU language switcher
  - `LanguageContext` — React context for i18n
- `src/components/ui/` — primitives/templates (shadcn style)

### Ticket Generation Logic
- `src/lib/ticketLogic.ts` — main algorithm:
  - `parseTracksFromInput` — parses text input to Track[]
  - `generateTicket` — generates single ticket
  - `generateTickets` — generates multiple tickets with track coverage
  - `getMissedTracks` — finds tracks not used in any ticket
  - `validateInput` — validates input text
  - `validateTickets` — validates generated tickets
  - **Important**: Algorithm guarantees 90 track coverage, column distribution, and 3×9 grid with 5 items per row.

### Utilities and Types
- `src/lib/utils.ts` — helper `cn` (clsx + tailwind-merge)
- `src/lib/i18n.ts` — translations and language utilities
- `src/types/ticket.ts` — constants (COLUMN_RANGES, ROWS, COLS, ITEMS_PER_ROW) and types Track/Ticket

### PDF Export
- `src/components/ExportButton.tsx` — vector text PDF rendering with jsPDF
  - Roboto font (with Cyrillic support) loaded via jsDelivr CDN
  - Noto Sans Symbols for music notes (♪ ♫)
  - A4 landscape, 2 tickets per page
  - Dashed cut lines between tickets

## Quick Start

### Development
```bash
npm install
npm run dev  # Dev server at http://localhost:3010
```

### Production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## Project Conventions

### Code Style
- All comments MUST be in English
- Most components are client components (`"use client"`)
- CSS/Tailwind with local fonts (Roboto)
- Scale factor: 3px = 1mm for web preview proportions

### i18n System
- English is the default language
- Language stored in localStorage
- Translations in `src/lib/i18n.ts`
- LanguageContext provides `language`, `setLanguage`, `t` (translations)

### Ticket Rules (Russian Lotto)
- 3 rows × 9 columns grid
- Exactly 5 filled cells per row (15 total)
- Maximum 1 fully filled column
- No duplicate tracks in a ticket
- Track IDs 1-90 distributed across columns by ranges

### Column Ranges (from `ticket.ts`)
- Column 0: 1-9
- Column 1: 10-19
- Column 2: 20-29
- ...
- Column 8: 80-90

## Common Tasks

### Modify ticket generation behavior
Edit `src/lib/ticketLogic.ts` — look for `generateTickets` and `generateTicket` functions.

### Fix PDF export (position, font, quality)
Edit `src/components/ExportButton.tsx` — `renderTicketToPDF`, `fitTextToCell`, `splitTextToLines`.

### Change global fonts
Edit `src/app/layout.tsx` (font imports) and `ExportButton.tsx` (PDF fonts).

### Add new translations
Edit `src/lib/i18n.ts` — add keys to both `en` and `ru` objects.

## Commit Messages
- Use conventional commits format
- Prefix with: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Example: `fix: reduce pdf size by using JPEG and scale=2 in ExportButton`
- If change affects ticket generation, include: algorithm explanation, reason for change, example test data

## GitHub Repository
https://github.com/DercasDrol/sing_lotto

## Default Language
Use Russian (`ru`) by default for user communication, unless the user explicitly indicates a different preference.
