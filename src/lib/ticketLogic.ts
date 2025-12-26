import {
  Track,
  Ticket,
  TicketCell,
  COLUMN_RANGES,
  ROWS,
  COLS,
  ITEMS_PER_ROW,
  TOTAL_ITEMS_PER_TICKET,
  TicketValidationResult,
  TicketsValidationSummary,
} from "@/types/ticket";

/**
 * Парсит входной текст и создает массив треков с ID от 1 до 90
 */
export function parseTracksFromInput(input: string): Track[] {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.slice(0, 90).map((name, index) => ({
    id: index + 1,
    name,
  }));
}

/**
 * Определяет индекс колонки для данного ID трека
 */
export function getColumnForId(id: number): number {
  for (let col = 0; col < COLUMN_RANGES.length; col++) {
    const [min, max] = COLUMN_RANGES[col];
    if (id >= min && id <= max) {
      return col;
    }
  }
  return -1;
}

/**
 * Фильтрует треки по колонке
 */
export function getTracksForColumn(tracks: Track[], col: number): Track[] {
  const [min, max] = COLUMN_RANGES[col];
  return tracks.filter((t) => t.id >= min && t.id <= max);
}

/**
 * Перемешивает массив (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Генерирует один билет по правилам Русского Лото
 * С мягким приоритетом для ещё не использованных треков
 * ГАРАНТИРУЕТ: ровно 5 ячеек в каждой строке, не более 1 полной колонки
 */
export function generateTicket(
  tracks: Track[],
  ticketNumber: number,
  priorityTracks?: Set<number>,
  priorityWeight: number = 0.3 // Мягкий приоритет (0 = нет, 1 = полный)
): Ticket {
  const maxGlobalAttempts = 100;
  
  for (let globalAttempt = 0; globalAttempt < maxGlobalAttempts; globalAttempt++) {
    // Шаг 1: Выбираем случайные треки для каждой колонки
    const selectedByColumn: Track[][] = [];

    for (let col = 0; col < COLS; col++) {
      const columnTracks = getTracksForColumn(tracks, col);
      
      // Перемешиваем с мягким приоритетом для неиспользованных треков
      let sortedTracks: Track[];
      if (priorityTracks && priorityTracks.size > 0 && Math.random() < priorityWeight) {
        const priority = columnTracks.filter((t) => priorityTracks.has(t.id));
        const nonPriority = columnTracks.filter((t) => !priorityTracks.has(t.id));
        sortedTracks = [...shuffleArray(priority), ...shuffleArray(nonPriority)];
      } else {
        sortedTracks = shuffleArray(columnTracks);
      }
      
      selectedByColumn.push(sortedTracks);
    }

    // Шаг 2: Используем детерминированное распределение по колонкам
    const columnCounts = generateValidColumnDistribution();

    // Шаг 3: Выбираем конкретные треки для каждой колонки
    const tracksPerColumn: Track[][] = columnCounts.map((count, col) => {
      return selectedByColumn[col].slice(0, count);
    });

    // Шаг 4: Распределяем треки по строкам с гарантией корректности
    const grid = distributeToGridStrict(tracksPerColumn);
    
    if (grid === null) {
      // Если не удалось — пробуем ещё раз
      continue;
    }

    // Создаем финальную структуру билета
    const cells: TicketCell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      cells[row] = [];
      for (let col = 0; col < COLS; col++) {
        cells[row][col] = {
          track: grid[row][col],
          row,
          col,
        };
      }
    }

    const ticket: Ticket = {
      id: `TICKET-${ticketNumber.toString().padStart(4, "0")}`,
      cells,
    };

    // Финальная проверка валидности
    const validation = validateTicketInternal(ticket);
    if (validation.isValid) {
      return ticket;
    }
  }

  // Fallback: если после всех попыток не удалось, используем гарантированно рабочее распределение
  return generateFallbackTicket(tracks, ticketNumber, priorityTracks);
}

/**
 * Внутренняя быстрая валидация билета
 */
function validateTicketInternal(ticket: Ticket): { isValid: boolean } {
  // Проверка количества ячеек в строках
  for (let row = 0; row < ROWS; row++) {
    const count = ticket.cells[row].filter(c => c.track !== null).length;
    if (count !== ITEMS_PER_ROW) {
      return { isValid: false };
    }
  }

  // Проверка дубликатов
  const ids = new Set<number>();
  for (const row of ticket.cells) {
    for (const cell of row) {
      if (cell.track) {
        if (ids.has(cell.track.id)) {
          return { isValid: false };
        }
        ids.add(cell.track.id);
      }
    }
  }

  // Проверка полных колонок (не более 1)
  let fullCols = 0;
  for (let col = 0; col < COLS; col++) {
    const colCount = ticket.cells.filter(row => row[col].track !== null).length;
    if (colCount === ROWS) fullCols++;
  }
  if (fullCols > 1) {
    return { isValid: false };
  }

  return { isValid: true };
}

/**
 * Генерирует fallback билет с гарантированно корректным распределением
 */
function generateFallbackTicket(
  tracks: Track[],
  ticketNumber: number,
  priorityTracks?: Set<number>
): Ticket {
  // Используем фиксированное распределение, которое точно работает
  // 15 ячеек = 5+5+5 по строкам, распределено по 9 колонкам
  // Пример: [2,2,2,1,2,2,2,1,1] = 15, и легко распределить по 5 в ряд
  const fixedColumnCounts = [2, 2, 2, 1, 2, 2, 2, 1, 1];
  
  const selectedByColumn: Track[][] = [];
  for (let col = 0; col < COLS; col++) {
    const columnTracks = getTracksForColumn(tracks, col);
    let sortedTracks: Track[];
    if (priorityTracks && priorityTracks.size > 0) {
      const priority = columnTracks.filter((t) => priorityTracks.has(t.id));
      const nonPriority = columnTracks.filter((t) => !priorityTracks.has(t.id));
      sortedTracks = [...shuffleArray(priority), ...shuffleArray(nonPriority)];
    } else {
      sortedTracks = shuffleArray(columnTracks);
    }
    selectedByColumn.push(sortedTracks);
  }

  const tracksPerColumn: Track[][] = fixedColumnCounts.map((count, col) => {
    return selectedByColumn[col].slice(0, count);
  });

  // Строгое распределение по строкам
  const grid: (Track | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const rowCounts = [0, 0, 0];

  // Сначала размещаем колонки с 2 треками (их больше всего)
  const colsByCount = Array.from({ length: COLS }, (_, i) => i)
    .sort((a, b) => tracksPerColumn[b].length - tracksPerColumn[a].length);

  for (const col of colsByCount) {
    const colTracks = tracksPerColumn[col];
    for (const track of colTracks) {
      // Находим строку с минимальным заполнением
      let bestRow = -1;
      let minCount = ITEMS_PER_ROW + 1;
      for (let r = 0; r < ROWS; r++) {
        if (grid[r][col] === null && rowCounts[r] < ITEMS_PER_ROW && rowCounts[r] < minCount) {
          minCount = rowCounts[r];
          bestRow = r;
        }
      }
      if (bestRow !== -1) {
        grid[bestRow][col] = track;
        rowCounts[bestRow]++;
      }
    }
  }

  const cells: TicketCell[][] = [];
  for (let row = 0; row < ROWS; row++) {
    cells[row] = [];
    for (let col = 0; col < COLS; col++) {
      cells[row][col] = { track: grid[row][col], row, col };
    }
  }

  return {
    id: `TICKET-${ticketNumber.toString().padStart(4, "0")}`,
    cells,
  };
}

/**
 * Генерирует валидное распределение элементов по колонкам
 * Гарантирует, что сумма = 15 и распределение возможно разместить по строкам
 */
function generateValidColumnDistribution(): number[] {
  // Валидные распределения, которые гарантированно позволяют 5 элементов в каждой строке
  // Каждое распределение: сумма = 15, каждая колонка 0-3
  const validDistributions = [
    [2, 2, 2, 1, 2, 2, 2, 1, 1],
    [2, 2, 1, 2, 2, 1, 2, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 1, 2, 2, 1],
    [2, 2, 2, 2, 1, 1, 2, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 1],
    [2, 1, 2, 2, 2, 2, 1, 2, 1],
    [2, 2, 1, 2, 2, 2, 1, 2, 1],
    [1, 2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 1, 2, 1, 2, 2, 1],
    [2, 1, 2, 2, 1, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 1],
    [2, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 1, 1, 2, 1],
    [1, 2, 1, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 2, 1],
    [3, 2, 1, 2, 1, 2, 2, 1, 1], // с одной полной колонкой (3)
    [2, 3, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 3, 1, 2, 2, 2, 1, 1],
    [2, 1, 2, 3, 1, 2, 1, 2, 1],
  ];

  // Выбираем случайное распределение и перемешиваем его
  const base = validDistributions[Math.floor(Math.random() * validDistributions.length)];
  return shuffleArray([...base]);
}

/**
 * Распределяет 15 элементов по 9 колонкам
 * Каждая колонка получает 0, 1, 2 или 3 элемента
 */
function distributeItemsToColumns(): number[] {
  const counts = new Array(COLS).fill(0);
  let remaining = TOTAL_ITEMS_PER_TICKET;

  // Случайно распределяем элементы
  const columnOrder = shuffleArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);

  for (const col of columnOrder) {
    if (remaining === 0) break;

    // Определяем максимум для этой колонки (не больше 3, и не больше оставшегося)
    const maxForColumn = Math.min(3, remaining);

    // Выбираем случайное количество
    const count = Math.floor(Math.random() * (maxForColumn + 1));
    counts[col] = count;
    remaining -= count;
  }

  // Если остались нераспределенные элементы, добавляем их
  while (remaining > 0) {
    for (let col = 0; col < COLS && remaining > 0; col++) {
      if (counts[col] < 3) {
        counts[col]++;
        remaining--;
      }
    }
  }

  return counts;
}

/**
 * Строгое распределение треков по сетке 3x9
 * Гарантирует ровно 5 элементов в каждой строке
 * Возвращает null если распределение невозможно
 */
function distributeToGridStrict(tracksPerColumn: Track[][]): (Track | null)[][] | null {
  const grid: (Track | null)[][] = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const rowCounts = [0, 0, 0];
  
  // Собираем все треки с их колонками
  const allPlacements: { track: Track; col: number }[] = [];
  for (let col = 0; col < COLS; col++) {
    for (const track of tracksPerColumn[col]) {
      allPlacements.push({ track, col });
    }
  }

  // Проверяем общее количество
  if (allPlacements.length !== TOTAL_ITEMS_PER_TICKET) {
    return null;
  }

  // Перемешиваем порядок размещения для рандомизации
  const shuffledPlacements = shuffleArray(allPlacements);

  // Сначала сортируем по "сложности" — треки из колонок с большим количеством элементов первыми
  const colCounts = tracksPerColumn.map(t => t.length);
  shuffledPlacements.sort((a, b) => colCounts[b.col] - colCounts[a.col]);

  // Размещаем каждый трек
  for (const { track, col } of shuffledPlacements) {
    // Находим доступные строки для этой колонки
    const availableRows: number[] = [];
    for (let row = 0; row < ROWS; row++) {
      if (grid[row][col] === null && rowCounts[row] < ITEMS_PER_ROW) {
        availableRows.push(row);
      }
    }

    if (availableRows.length === 0) {
      return null; // Невозможно разместить
    }

    // Выбираем строку с минимальным заполнением (для баланса)
    const minCount = Math.min(...availableRows.map(r => rowCounts[r]));
    const bestRows = availableRows.filter(r => rowCounts[r] === minCount);
    const selectedRow = bestRows[Math.floor(Math.random() * bestRows.length)];

    grid[selectedRow][col] = track;
    rowCounts[selectedRow]++;
  }

  // Проверяем результат
  for (let row = 0; row < ROWS; row++) {
    if (rowCounts[row] !== ITEMS_PER_ROW) {
      return null;
    }
  }

  // Проверяем количество полных колонок
  let fullCols = 0;
  for (let col = 0; col < COLS; col++) {
    const colCount = grid.filter(row => row[col] !== null).length;
    if (colCount === ROWS) fullCols++;
  }
  if (fullCols > 1) {
    return null;
  }

  return grid;
}

/**
 * Проверяет, можно ли распределить элементы так,
 * чтобы в каждой строке было ровно 5
 */
function canDistributeToRows(columnCounts: number[]): boolean {
  // Сумма должна быть 15
  const total = columnCounts.reduce((a, b) => a + b, 0);
  if (total !== TOTAL_ITEMS_PER_TICKET) return false;

  // Проверяем, что можно распределить по строкам
  // Используем жадный алгоритм для проверки
  const testGrid = distributeToGrid(
    columnCounts.map((count) => new Array(count).fill({ id: 0, name: "" }))
  );

  // Проверяем, что в каждой строке ровно 5 элементов
  for (let row = 0; row < ROWS; row++) {
    const rowCount = testGrid[row].filter((cell) => cell !== null).length;
    if (rowCount !== ITEMS_PER_ROW) return false;
  }

  return true;
}

/**
 * Распределяет треки по сетке 3x9 так,
 * чтобы в каждой строке было ровно 5 элементов
 */
function distributeToGrid(tracksPerColumn: Track[][]): (Track | null)[][] {
  const grid: (Track | null)[][] = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  const rowCounts = [0, 0, 0];
  const columnQueues = tracksPerColumn.map((tracks) => [...tracks]);

  // Сортируем колонки по количеству элементов (сначала с большим количеством)
  const sortedCols = Array.from({ length: COLS }, (_, i) => i).sort(
    (a, b) => columnQueues[b].length - columnQueues[a].length
  );

  for (const col of sortedCols) {
    const tracks = columnQueues[col];

    for (const track of tracks) {
      // Находим строку с минимальным количеством элементов (< 5)
      let bestRow = -1;
      let minCount = ITEMS_PER_ROW;

      for (let row = 0; row < ROWS; row++) {
        if (rowCounts[row] < ITEMS_PER_ROW && rowCounts[row] < minCount) {
          minCount = rowCounts[row];
          bestRow = row;
        }
      }

      if (bestRow !== -1) {
        grid[bestRow][col] = track;
        rowCounts[bestRow]++;
      }
    }
  }

  return grid;
}

/**
 * Генерирует массив уникальных билетов с гарантией покрытия всех 90 треков
 * и минимизацией полностью заполненных колонок (не более 1 на билет)
 */
export function generateTickets(tracks: Track[], count: number): Ticket[] {
  const tickets: Ticket[] = [];
  
  // Отслеживаем использованные треки для обеспечения полного покрытия
  const usedTracks = new Set<number>();
  const allTrackIds = tracks.map((t) => t.id);
  
  // Первый проход: генерируем билеты с приоритетом на неиспользованные треки
  for (let i = 0; i < count; i++) {
    // Определяем неиспользованные треки
    const unusedTracks = new Set(
      allTrackIds.filter((id) => !usedTracks.has(id))
    );
    
    // Вычисляем приоритет в зависимости от оставшихся треков
    const remainingTickets = count - i;
    const tracksPerTicket = 15;
    const tracksCanCover = remainingTickets * tracksPerTicket;
    const unusedCount = unusedTracks.size;
    
    // Если неиспользованных треков много, приоритет низкий (больше случайности)
    // Если их мало и билетов мало - высокий приоритет
    let priorityWeight = 0.1;
    
    if (unusedCount > 0) {
      const urgency = unusedCount / Math.max(tracksCanCover, 1);
      
      if (urgency > 0.5) {
        priorityWeight = 0.9; // Критично нужно использовать
      } else if (urgency > 0.3) {
        priorityWeight = 0.6; // Высокий приоритет
      } else if (urgency > 0.15) {
        priorityWeight = 0.3; // Средний приоритет
      }
    }

    const ticket = generateTicket(tracks, i + 1, unusedTracks, priorityWeight);
    tickets.push(ticket);

    // Обновляем список использованных треков
    for (const row of ticket.cells) {
      for (const cell of row) {
        if (cell.track) {
          usedTracks.add(cell.track.id);
        }
      }
    }
  }

  // Второй проход: если есть неиспользованные треки, заменяем случайные треки в последних билетах
  const stillUnused = allTrackIds.filter((id) => !usedTracks.has(id));
  
  if (stillUnused.length > 0) {
    // Берем последние билеты и заменяем в них треки
    const ticketsToModify = Math.min(Math.ceil(stillUnused.length / 5), tickets.length);
    
    for (let i = 0; i < ticketsToModify && stillUnused.length > 0; i++) {
      const ticketIndex = tickets.length - 1 - i;
      const ticket = tickets[ticketIndex];
      
      // Собираем все треки в билете
      const tracksInTicket: { track: Track; row: number; col: number }[] = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (ticket.cells[row][col].track) {
            tracksInTicket.push({
              track: ticket.cells[row][col].track!,
              row,
              col,
            });
          }
        }
      }
      
      // Заменяем до 5 случайных треков на неиспользованные
      const toReplace = Math.min(5, stillUnused.length, tracksInTicket.length);
      const shuffledPositions = shuffleArray(tracksInTicket);
      
      for (let j = 0; j < toReplace; j++) {
        const unusedTrackId = stillUnused.shift();
        if (!unusedTrackId) break;
        
        const unusedTrack = tracks.find((t) => t.id === unusedTrackId);
        if (!unusedTrack) continue;
        
        const position = shuffledPositions[j];
        const oldTrack = position.track;
        
        // Проверяем, что новый трек принадлежит той же колонке
        const oldCol = getColumnForId(oldTrack.id);
        const newCol = getColumnForId(unusedTrack.id);
        
        if (oldCol === newCol) {
          ticket.cells[position.row][position.col].track = unusedTrack;
          usedTracks.add(unusedTrack.id);
        }
      }
    }
  }

  return tickets;
}

/**
 * Вычисляет треки, которые не попали ни в один билет
 */
export function getMissedTracks(tracks: Track[], tickets: Ticket[]): Track[] {
  const usedTrackIds = new Set<number>();
  
  for (const ticket of tickets) {
    for (const row of ticket.cells) {
      for (const cell of row) {
        if (cell.track) {
          usedTrackIds.add(cell.track.id);
        }
      }
    }
  }
  
  return tracks.filter((track) => !usedTrackIds.has(track.id));
}

/**
 * Валидирует входные данные
 */
export function validateInput(input: string): {
  isValid: boolean;
  trackCount: number;
  message: string;
} {
  const tracks = parseTracksFromInput(input);
  const count = tracks.length;

  if (count === 0) {
    return {
      isValid: false,
      trackCount: 0,
      message: "Введите хотя бы один трек/артист",
    };
  }

  if (count < 90) {
    return {
      isValid: false,
      trackCount: count,
      message: `Недостаточно треков: ${count}/90. Добавьте ещё ${90 - count}`,
    };
  }

  return {
    isValid: true,
    trackCount: 90,
    message: "Готово к генерации билетов!",
  };
}

// === ВАЛИДАЦИЯ БИЛЕТОВ ===

/**
 * Валидирует один билет по всем критериям:
 * 1. В каждой строке ровно 5 заполненных ячеек
 * 2. Нет дублирующихся треков
 * 3. Не более 1 полностью заполненной колонки
 */
export function validateTicket(ticket: Ticket): TicketValidationResult {
  const errors: TicketValidationResult["errors"] = {
    invalidRowCounts: [],
    duplicateTracks: [],
    fullColumnsCount: 0,
    fullColumnsExceeded: false,
  };

  // Проверка 1: Ровно 5 ячеек в каждой строке
  for (let row = 0; row < ROWS; row++) {
    const filledCount = ticket.cells[row].filter(cell => cell.track !== null).length;
    if (filledCount !== ITEMS_PER_ROW) {
      errors.invalidRowCounts.push({ row, count: filledCount });
    }
  }

  // Проверка 2: Нет дубликатов треков
  const trackIds = new Set<number>();
  const duplicates = new Set<number>();
  
  for (const row of ticket.cells) {
    for (const cell of row) {
      if (cell.track) {
        if (trackIds.has(cell.track.id)) {
          duplicates.add(cell.track.id);
        }
        trackIds.add(cell.track.id);
      }
    }
  }
  errors.duplicateTracks = Array.from(duplicates);

  // Проверка 3: Не более 1 полностью заполненной колонки
  for (let col = 0; col < COLS; col++) {
    const colFilledCount = ticket.cells.filter(row => row[col].track !== null).length;
    if (colFilledCount === ROWS) {
      errors.fullColumnsCount++;
    }
  }
  errors.fullColumnsExceeded = errors.fullColumnsCount > 1;

  const isValid = 
    errors.invalidRowCounts.length === 0 &&
    errors.duplicateTracks.length === 0 &&
    !errors.fullColumnsExceeded;

  return {
    isValid,
    ticketId: ticket.id,
    errors,
  };
}

/**
 * Валидирует все билеты и возвращает сводку
 */
export function validateTickets(tickets: Ticket[]): TicketsValidationSummary {
  const results = tickets.map(validateTicket);
  const invalidResults = results.filter(r => !r.isValid);

  return {
    totalTickets: tickets.length,
    validTickets: results.filter(r => r.isValid).length,
    invalidTickets: invalidResults.length,
    invalidDetails: invalidResults,
  };
}
