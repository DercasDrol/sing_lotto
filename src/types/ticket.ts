// Типы для билетов "Музыкального Лото"

export interface Track {
  id: number; // 1-90
  name: string;
}

export interface TicketCell {
  track: Track | null; // null означает пустую ячейку
  row: number; // 0-2
  col: number; // 0-8
}

export interface Ticket {
  id: string;
  cells: TicketCell[][]; // 3x9 сетка
}

// Диапазоны колонок в стиле Русского Лото
export const COLUMN_RANGES: [number, number][] = [
  [1, 9],   // Колонка 1: ID 1-9
  [10, 19], // Колонка 2: ID 10-19
  [20, 29], // Колонка 3: ID 20-29
  [30, 39], // Колонка 4: ID 30-39
  [40, 49], // Колонка 5: ID 40-49
  [50, 59], // Колонка 6: ID 50-59
  [60, 69], // Колонка 7: ID 60-69
  [70, 79], // Колонка 8: ID 70-79
  [80, 90], // Колонка 9: ID 80-90
];

export const TOTAL_TRACKS = 90;
export const ROWS = 3;
export const COLS = 9;
export const ITEMS_PER_ROW = 5;
export const TOTAL_ITEMS_PER_TICKET = 15;

// === Типы для валидации билетов ===

export interface TicketValidationErrors {
  /** Строки с неправильным количеством заполненных ячеек (должно быть 5) */
  invalidRowCounts: { row: number; count: number }[];
  /** ID треков, которые дублируются в билете */
  duplicateTracks: number[];
  /** Количество полностью заполненных колонок (все 3 ячейки) */
  fullColumnsCount: number;
  /** Превышен лимит полностью заполненных колонок (>1) */
  fullColumnsExceeded: boolean;
}

export interface TicketValidationResult {
  isValid: boolean;
  ticketId: string;
  errors: TicketValidationErrors;
}

export interface TicketsValidationSummary {
  totalTickets: number;
  validTickets: number;
  invalidTickets: number;
  /** Детали по каждому невалидному билету */
  invalidDetails: TicketValidationResult[];
}
