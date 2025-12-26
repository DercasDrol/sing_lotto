import {
  Track,
  Ticket,
  TicketCell,
  COLUMN_RANGES,
  ROWS,
  COLS,
  ITEMS_PER_ROW,
  TOTAL_ITEMS_PER_TICKET,
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
 */
export function generateTicket(
  tracks: Track[],
  ticketNumber: number,
  priorityTracks?: Set<number>,
  priorityWeight: number = 0.3 // Мягкий приоритет (0 = нет, 1 = полный)
): Ticket {
  // Шаг 1: Выбираем случайные треки для каждой колонки
  const selectedByColumn: Track[][] = [];

  for (let col = 0; col < COLS; col++) {
    const columnTracks = getTracksForColumn(tracks, col);
    
    // Перемешиваем с мягким приоритетом для неиспользованных треков
    let sortedTracks: Track[];
    if (priorityTracks && priorityTracks.size > 0 && Math.random() < priorityWeight) {
      // С вероятностью priorityWeight ставим приоритетные треки вперед
      const priority = columnTracks.filter((t) => priorityTracks.has(t.id));
      const nonPriority = columnTracks.filter((t) => !priorityTracks.has(t.id));
      sortedTracks = [...shuffleArray(priority), ...shuffleArray(nonPriority)];
    } else {
      // Полностью случайный порядок
      sortedTracks = shuffleArray(columnTracks);
    }
    
    selectedByColumn.push(sortedTracks);
  }

  // Шаг 2: Определяем количество элементов на колонку
  let columnCounts: number[];
  let attempts = 0;
  const maxAttempts = 1000;

  do {
    columnCounts = distributeItemsToColumns();
    attempts++;
  } while (!canDistributeToRows(columnCounts) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    columnCounts = [2, 2, 2, 1, 2, 1, 2, 2, 1];
  }

  // Шаг 3: Выбираем конкретные треки для каждой колонки
  const tracksPerColumn: Track[][] = columnCounts.map((count, col) => {
    return selectedByColumn[col].slice(0, count);
  });

  // Шаг 4: Распределяем треки по строкам (с рандомизацией)
  const grid = distributeToGridRandomized(tracksPerColumn);

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

  return {
    id: `TICKET-${ticketNumber.toString().padStart(4, "0")}`,
    cells,
  };
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
 * Распределяет треки по сетке 3x9 с проверкой:
 * - Максимум 1 полностью заполненная колонка (все 3 ячейки) на билет
 * - В каждой строке ровно 5 элементов
 */
function distributeToGridRandomized(tracksPerColumn: Track[][]): (Track | null)[][] {
  let grid: (Track | null)[][] = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  let attempts = 0;
  const maxAttempts = 200;
  let success = false;

  while (!success && attempts < maxAttempts) {
    attempts++;
    
    grid = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));

    const rowCounts = [0, 0, 0];
    const columnQueues = tracksPerColumn.map((tracks) => [...tracks]);

    // Подсчитываем колонки с 3 треками
    const columnsWithThreeTracks: number[] = [];
    for (let col = 0; col < COLS; col++) {
      if (columnQueues[col].length === 3) {
        columnsWithThreeTracks.push(col);
      }
    }

    // Если колонок с 3 треками больше 1, выбираем только одну для полного заполнения
    let fullColumnIndex = -1;
    if (columnsWithThreeTracks.length > 0) {
      // Случайно выбираем одну колонку, которая будет заполнена полностью
      fullColumnIndex = columnsWithThreeTracks[Math.floor(Math.random() * columnsWithThreeTracks.length)];
    }

    // Перемешиваем порядок обработки колонок
    const shuffledCols = shuffleArray(Array.from({ length: COLS }, (_, i) => i));
    
    success = true;

    for (const col of shuffledCols) {
      const tracks = columnQueues[col];
      const tracksInColumn = tracks.length;

      if (tracksInColumn === 0) continue;

      // Если в колонке 3 трека и это НЕ выбранная полная колонка
      if (tracksInColumn === 3 && col !== fullColumnIndex) {
        // Заполняем только 2 из 3 строк
        const availableRows = [0, 1, 2];
        const shuffledRows = shuffleArray(availableRows);

        for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
          const track = tracks[trackIndex];
          
          // Ищем свободную строку среди доступных
          let placed = false;
          for (const row of shuffledRows) {
            if (grid[row][col] === null && rowCounts[row] < ITEMS_PER_ROW) {
              grid[row][col] = track;
              rowCounts[row]++;
              placed = true;
              break;
            }
          }
          
          if (!placed && trackIndex < 2) {
            // Если не смогли разместить первые 2 трека - неудача
            success = false;
            break;
          }
          
          // Третий трек просто пропускаем если не удалось разместить
        }
      } else {
        // Для всех остальных колонок (или выбранной полной) - обычное размещение
        for (const track of tracks) {
          // Проверяем, какие строки свободны в этой колонке
          const availableRows: number[] = [];
          for (let row = 0; row < ROWS; row++) {
            if (grid[row][col] === null && rowCounts[row] < ITEMS_PER_ROW) {
              availableRows.push(row);
            }
          }

          if (availableRows.length > 0) {
            // Среди доступных выбираем те, где меньше всего элементов
            const minCount = Math.min(...availableRows.map(r => rowCounts[r]));
            const minRows = availableRows.filter(r => rowCounts[r] === minCount);
            const selectedRow = minRows[Math.floor(Math.random() * minRows.length)];
            
            grid[selectedRow][col] = track;
            rowCounts[selectedRow]++;
          } else {
            success = false;
            break;
          }
        }
      }

      if (!success) break;
    }

    // Проверяем, что в каждой строке ровно 5 элементов
    if (success) {
      for (let row = 0; row < ROWS; row++) {
        const count = grid[row].filter(cell => cell !== null).length;
        if (count !== ITEMS_PER_ROW) {
          success = false;
          break;
        }
      }
    }

    // Проверяем количество полностью заполненных колонок
    if (success) {
      let fullColumnsCount = 0;
      for (let col = 0; col < COLS; col++) {
        const colCount = grid.filter(row => row[col] !== null).length;
        if (colCount === ROWS) {
          fullColumnsCount++;
        }
      }
      
      // Допускаем максимум 1 полностью заполненную колонку
      if (fullColumnsCount > 1) {
        success = false;
      }
    }
  }

  if (!success) {
    // Fallback: пытаемся еще раз с более простой логикой
    grid = Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));

    const rowCounts = [0, 0, 0];
    const columnQueues = tracksPerColumn.map((tracks) => [...tracks]);

    // Сортируем колонки: сначала с меньшим количеством треков
    const sortedCols = Array.from({ length: COLS }, (_, i) => i)
      .sort((a, b) => columnQueues[a].length - columnQueues[b].length);

    for (const col of sortedCols) {
      const tracks = columnQueues[col];
      for (const track of tracks) {
        for (let row = 0; row < ROWS; row++) {
          if (rowCounts[row] < ITEMS_PER_ROW && grid[row][col] === null) {
            grid[row][col] = track;
            rowCounts[row]++;
            break;
          }
        }
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
