/**
 * Автотесты для алгоритма генерации билетов
 * Запуск: npm test
 */

// Константы (дублируем из ticket.ts для независимости теста)
const ROWS = 3;
const COLS = 9;
const ITEMS_PER_ROW = 5;
const TOTAL_ITEMS_PER_TICKET = 15;

const COLUMN_RANGES: [number, number][] = [
  [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
  [50, 59], [60, 69], [70, 79], [80, 90],
];

interface Track {
  id: number;
  name: string;
}

interface TicketCell {
  track: Track | null;
  row: number;
  col: number;
}

interface Ticket {
  id: string;
  cells: TicketCell[][];
}

// Импортируем функции напрямую (относительный путь)
import {
  parseTracksFromInput,
  generateTicket,
  generateTickets,
  validateTicket,
  validateTickets,
  getMissedTracks,
} from "./ticketLogic.js";

// Генерируем тестовые треки (90 штук)
function createTestTracks(): Track[] {
  return Array.from({ length: 90 }, (_, i) => ({
    id: i + 1,
    name: `Track ${i + 1}`,
  }));
}

// Цвета для консоли
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";
const YELLOW = "\x1b[33m";

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`${GREEN}✓${RESET} ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`${RED}✗${RESET} ${name}`);
    console.log(`  ${RED}Error: ${error instanceof Error ? error.message : error}${RESET}`);
    failedTests++;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== "number" || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toBeTrue() {
      if (actual !== true) {
        throw new Error(`Expected true, got ${actual}`);
      }
    },
    toBeFalse() {
      if (actual !== false) {
        throw new Error(`Expected false, got ${actual}`);
      }
    },
  };
}

// === ТЕСТЫ ===

console.log("\n" + YELLOW + "=== Тесты алгоритма генерации билетов ===" + RESET + "\n");

// Группа: Парсинг входных данных
console.log(YELLOW + "Парсинг входных данных:" + RESET);

test("parseTracksFromInput: парсит 90 строк корректно", () => {
  const input = Array.from({ length: 90 }, (_, i) => `Track ${i + 1}`).join("\n");
  const tracks = parseTracksFromInput(input);
  expect(tracks.length).toBe(90);
  expect(tracks[0].id).toBe(1);
  expect(tracks[89].id).toBe(90);
});

test("parseTracksFromInput: обрезает до 90 треков", () => {
  const input = Array.from({ length: 100 }, (_, i) => `Track ${i + 1}`).join("\n");
  const tracks = parseTracksFromInput(input);
  expect(tracks.length).toBe(90);
});

test("parseTracksFromInput: игнорирует пустые строки", () => {
  const input = "Track 1\n\nTrack 2\n  \nTrack 3";
  const tracks = parseTracksFromInput(input);
  expect(tracks.length).toBe(3);
});

// Группа: Генерация одного билета
console.log("\n" + YELLOW + "Генерация одного билета:" + RESET);

test("generateTicket: создаёт билет с правильной структурой", () => {
  const tracks = createTestTracks();
  const ticket = generateTicket(tracks, 1);
  
  expect(ticket.cells.length).toBe(ROWS);
  expect(ticket.cells[0].length).toBe(COLS);
});

test("generateTicket: ровно 5 заполненных ячеек в каждой строке", () => {
  const tracks = createTestTracks();
  
  // Проверяем 50 билетов для надёжности
  for (let i = 0; i < 50; i++) {
    const ticket = generateTicket(tracks, i + 1);
    
    for (let row = 0; row < ROWS; row++) {
      const filledCount = ticket.cells[row].filter(c => c.track !== null).length;
      expect(filledCount).toBe(ITEMS_PER_ROW);
    }
  }
});

test("generateTicket: всего 15 заполненных ячеек в билете", () => {
  const tracks = createTestTracks();
  
  for (let i = 0; i < 20; i++) {
    const ticket = generateTicket(tracks, i + 1);
    let totalFilled = 0;
    
    for (const row of ticket.cells) {
      for (const cell of row) {
        if (cell.track !== null) totalFilled++;
      }
    }
    
    expect(totalFilled).toBe(TOTAL_ITEMS_PER_TICKET);
  }
});

test("generateTicket: не более 1 полностью заполненной колонки", () => {
  const tracks = createTestTracks();
  
  for (let i = 0; i < 50; i++) {
    const ticket = generateTicket(tracks, i + 1);
    let fullColumns = 0;
    
    for (let col = 0; col < COLS; col++) {
      const colFilled = ticket.cells.filter(row => row[col].track !== null).length;
      if (colFilled === ROWS) fullColumns++;
    }
    
    expect(fullColumns).toBeLessThanOrEqual(1);
  }
});

test("generateTicket: нет дублирующихся треков", () => {
  const tracks = createTestTracks();
  
  for (let i = 0; i < 30; i++) {
    const ticket = generateTicket(tracks, i + 1);
    const trackIds = new Set<number>();
    
    for (const row of ticket.cells) {
      for (const cell of row) {
        if (cell.track) {
          if (trackIds.has(cell.track.id)) {
            throw new Error(`Дубликат трека ${cell.track.id} в билете ${i + 1}`);
          }
          trackIds.add(cell.track.id);
        }
      }
    }
  }
});

test("generateTicket: треки размещены в правильных колонках по ID", () => {
  const tracks = createTestTracks();
  const ticket = generateTicket(tracks, 1);
  
  const COLUMN_RANGES: [number, number][] = [
    [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
    [50, 59], [60, 69], [70, 79], [80, 90],
  ];
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = ticket.cells[row][col];
      if (cell.track) {
        const [min, max] = COLUMN_RANGES[col];
        if (cell.track.id < min || cell.track.id > max) {
          throw new Error(
            `Трек ${cell.track.id} в неправильной колонке ${col} (ожидается ${min}-${max})`
          );
        }
      }
    }
  }
});

// Группа: Валидация билетов
console.log("\n" + YELLOW + "Валидация билетов:" + RESET);

test("validateTicket: валидный билет проходит проверку", () => {
  const tracks = createTestTracks();
  const ticket = generateTicket(tracks, 1);
  const result = validateTicket(ticket);
  
  expect(result.isValid).toBeTrue();
  expect(result.errors.invalidRowCounts.length).toBe(0);
  expect(result.errors.duplicateTracks.length).toBe(0);
  expect(result.errors.fullColumnsExceeded).toBeFalse();
});

test("validateTickets: все сгенерированные билеты валидны", () => {
  const tracks = createTestTracks();
  const tickets = generateTickets(tracks, 20);
  const summary = validateTickets(tickets);
  
  expect(summary.totalTickets).toBe(20);
  expect(summary.validTickets).toBe(20);
  expect(summary.invalidTickets).toBe(0);
});

// Группа: Массовая генерация
console.log("\n" + YELLOW + "Массовая генерация билетов:" + RESET);

test("generateTickets: генерирует заданное количество билетов", () => {
  const tracks = createTestTracks();
  const tickets = generateTickets(tracks, 10);
  expect(tickets.length).toBe(10);
});

test("generateTickets: все билеты уникальны по ID", () => {
  const tracks = createTestTracks();
  const tickets = generateTickets(tracks, 20);
  const ids = new Set(tickets.map(t => t.id));
  expect(ids.size).toBe(20);
});

test("generateTickets: покрывает все 90 треков при достаточном количестве билетов", () => {
  const tracks = createTestTracks();
  const tickets = generateTickets(tracks, 10);
  const missed = getMissedTracks(tracks, tickets);
  
  // При 10 билетах (10 * 15 = 150 ячеек) должны покрыть все 90 треков
  expect(missed.length).toBe(0);
});

// Группа: Стресс-тесты
console.log("\n" + YELLOW + "Стресс-тесты:" + RESET);

test("generateTickets: 100 билетов — все валидны", () => {
  const tracks = createTestTracks();
  const tickets = generateTickets(tracks, 100);
  const summary = validateTickets(tickets);
  
  expect(summary.validTickets).toBe(100);
  expect(summary.invalidTickets).toBe(0);
});

test("generateTicket: 200 последовательных генераций — все валидны", () => {
  const tracks = createTestTracks();
  let allValid = true;
  
  for (let i = 0; i < 200; i++) {
    const ticket = generateTicket(tracks, i + 1);
    const result = validateTicket(ticket);
    if (!result.isValid) {
      allValid = false;
      console.log(`  Невалидный билет ${i + 1}:`, result.errors);
      break;
    }
  }
  
  expect(allValid).toBeTrue();
});

// Итоги
console.log("\n" + YELLOW + "=== Итоги ===" + RESET);
console.log(`${GREEN}Пройдено: ${passedTests}${RESET}`);
console.log(`${RED}Провалено: ${failedTests}${RESET}`);

if (failedTests > 0) {
  process.exit(1);
}
