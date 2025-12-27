"use client";

import { Button } from "@/components/ui/button";
import { Ticket as TicketType, ROWS, COLS } from "@/types/ticket";
import { Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";

// Шрифты в base64 (будут загружены динамически)
let fontsLoaded = false;
let robotoFontBase64: string | null = null;
let robotoBoldBase64: string | null = null;
let notoSymbolsBase64: string | null = null; // Для символов ♪ 🎺 и т.д.

interface ExportButtonProps {
  tickets: TicketType[];
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function ExportButton({ tickets, showTrackNumbers = true, ticketTitle = "♪ МУЗЫКАЛЬНОЕ ЛОТО", fontSize = 9 }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(fontsLoaded);
  const [fontError, setFontError] = useState(false);

  // Загружаем шрифты при монтировании компонента
  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      loadAllFonts()
        .then(() => {
          fontsLoaded = true;
          setFontLoaded(true);
        })
        .catch(() => {
          setFontError(true);
          setFontLoaded(true); // Позволяем экспорт даже без шрифта
        });
    }
  }, [fontError]);

  const exportToPDF = async () => {
    if (tickets.length === 0) return;

    setIsExporting(true);

    try {
      // Создаем PDF в формате A4 АЛЬБОМНАЯ ориентация
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Добавляем шрифты с поддержкой кириллицы
      if (robotoFontBase64) {
        pdf.addFileToVFS("Roboto-Regular.ttf", robotoFontBase64);
        pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        
        if (robotoBoldBase64) {
          pdf.addFileToVFS("Roboto-Bold.ttf", robotoBoldBase64);
          pdf.addFont("Roboto-Bold.ttf", "Roboto", "bold");
        }
        
        pdf.setFont("Roboto");
      } else {
        console.warn("Roboto font not loaded, using default font");
      }
      
      // Добавляем шрифт для символов (♪, 🎺 и т.д.)
      if (notoSymbolsBase64) {
        pdf.addFileToVFS("NotoSansSymbols.ttf", notoSymbolsBase64);
        pdf.addFont("NotoSansSymbols.ttf", "NotoSymbols", "normal");
        console.log("✓ Noto Symbols font added to PDF");
      }

      // A4 landscape: 297mm x 210mm
      const pageWidth = 297;
      const pageHeight = 210;
      const marginX = 10;
      const marginY = 8;
      const ticketWidth = pageWidth - marginX * 2;
      const ticketsPerPage = 2;
      const gapBetweenTickets = 8;
      const ticketHeight = (pageHeight - marginY * 2 - gapBetweenTickets) / 2;

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const positionOnPage = i % ticketsPerPage;

        // Добавляем новую страницу если нужно
        if (i > 0 && positionOnPage === 0) {
          pdf.addPage();
        }

        const yOffset = marginY + positionOnPage * (ticketHeight + gapBetweenTickets);

        // Рисуем билет
        renderTicketToPDF(pdf, ticket, marginX, yOffset, ticketWidth, ticketHeight, showTrackNumbers, ticketTitle, fontSize);

        // Добавляем пунктирную линию для вырезания между билетами
        if (positionOnPage === 0 && i + 1 < tickets.length) {
          const lineY = marginY + ticketHeight + gapBetweenTickets / 2;
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineDashPattern([2, 1.5], 0);
          pdf.setLineWidth(0.2);
          pdf.line(marginX, lineY, pageWidth - marginX, lineY);
        }
      }

      // Сохраняем PDF
      pdf.save(`singing-lotto-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Ошибка при экспорте PDF. Попробуйте ещё раз.");
    } finally {
      setIsExporting(false);
    }
  };

  if (tickets.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting || !fontLoaded}
      className="bg-slate-900 hover:bg-slate-800 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Экспорт...
        </>
      ) : !fontLoaded ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Загрузка шрифта...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Скачать PDF
        </>
      )}
    </Button>
  );
}

/**
 * Загружает все необходимые шрифты: Roboto (кириллица) и Noto Sans Symbols (спецсимволы)
 */
async function loadAllFonts(): Promise<void> {
  // URL'ы шрифтов через jsDelivr CDN
  const robotoRegularUrl = "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf";
  const robotoBoldUrl = "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf";
  // Noto Sans Symbols содержит музыкальные символы ♪ ♫ и многие другие
  const notoSymbolsUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanssymbols/NotoSansSymbols%5Bwght%5D.ttf";
  
  // Загружаем все шрифты параллельно
  const results = await Promise.allSettled([
    loadSingleFont(robotoRegularUrl, "Roboto Regular"),
    loadSingleFont(robotoBoldUrl, "Roboto Bold"),
    loadSingleFont(notoSymbolsUrl, "Noto Sans Symbols")
  ]);
  
  // Обрабатываем результаты
  if (results[0].status === 'fulfilled') {
    robotoFontBase64 = results[0].value;
    console.log("✓ Roboto Regular loaded successfully");
  } else {
    console.error("✗ Failed to load Roboto Regular:", results[0].reason);
    throw results[0].reason; // Roboto обязателен
  }
  
  if (results[1].status === 'fulfilled') {
    robotoBoldBase64 = results[1].value;
    console.log("✓ Roboto Bold loaded successfully");
  } else {
    console.warn("✗ Failed to load Roboto Bold (will use Regular):", results[1].reason);
  }
  
  if (results[2].status === 'fulfilled') {
    notoSymbolsBase64 = results[2].value;
    console.log("✓ Noto Sans Symbols loaded successfully");
  } else {
    console.warn("✗ Failed to load Noto Sans Symbols (music notes may not render):", results[2].reason);
  }
}

/**
 * Загружает один шрифт и возвращает base64
 */
async function loadSingleFont(url: string, name: string): Promise<string> {
  console.log(`Loading ${name} font from: ${url}`);
  
  const response = await fetch(url, { 
    mode: 'cors',
    cache: 'default'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  
  // Проверяем что файл не пустой и это TTF
  if (arrayBuffer.byteLength < 10000) {
    throw new Error(`Font file too small (${arrayBuffer.byteLength} bytes), possibly not a valid TTF`);
  }
  
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Конвертируем в base64
  let binary = "";
  const chunkSize = 8192;
  for (let j = 0; j < uint8Array.length; j += chunkSize) {
    const chunk = uint8Array.subarray(j, j + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  console.log(`✓ ${name} font converted to base64 (${arrayBuffer.byteLength} bytes)`);
  return btoa(binary);
}

/**
 * Рисует билет напрямую в PDF (текстовый режим)
 */
function renderTicketToPDF(
  pdf: jsPDF,
  ticket: TicketType,
  x: number,
  y: number,
  width: number,
  height: number,
  showTrackNumbers: boolean,
  ticketTitle: string,
  maxFontSize: number
): void {
  const padding = 3; // Отступ внутри рамки билета
  const headerHeight = 12;
  const cornerRadius = 3;
  
  // Внутренние размеры
  const innerX = x + padding;
  const innerY = y + padding;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  const tableY = innerY + headerHeight;
  const tableHeight = innerHeight - headerHeight;
  const cellWidth = innerWidth / COLS;
  const cellHeight = tableHeight / ROWS;

  // === ВНЕШНЯЯ РАМКА БИЛЕТА С ЗАКРУГЛЕНИЯМИ ===
  pdf.setDrawColor(30, 41, 59); // slate-800
  pdf.setFillColor(255, 255, 255);
  pdf.setLineWidth(0.8);
  pdf.setLineDashPattern([], 0);
  pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, "FD");

  // === ШАПКА ===
  pdf.setFillColor(241, 245, 249); // slate-100
  // Рисуем шапку как прямоугольник внутри рамки
  pdf.rect(innerX, innerY, innerWidth, headerHeight, "F");
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.4);
  pdf.line(innerX, innerY + headerHeight, innerX + innerWidth, innerY + headerHeight);

  // === ЗАГОЛОВОК ===
  pdf.setTextColor(15, 23, 42); // slate-900
  const titleFontSize = Math.min(20, maxFontSize * 1.8); // Увеличен максимум
  const symbolFontSize = titleFontSize * 1.3; // Символы на 30% больше для лучшей видимости
  pdf.setFontSize(titleFontSize);
  
  // Вычисляем позицию Y для центрирования текста (подняли выше)
  // baseline текста внизу, уменьшаем смещение
  const titleY = innerY + headerHeight / 2 + titleFontSize * 0.08;
  
  // Рендерим заголовок с поддержкой смешанных шрифтов (символы + кириллица)
  let titleX = innerX + 4;
  
  // Разбиваем текст на сегменты: символы и обычный текст
  // Символы Unicode: музыкальные ноты, эмодзи и т.д.
  const symbolPattern = /([♪♫🎵🎶🎺🎸🎹🎷🎻🥁🎤🎧🎼]+)/g;
  const segments = ticketTitle.split(symbolPattern);
  
  for (const segment of segments) {
    if (!segment) continue;
    
    const isSymbol = symbolPattern.test(segment);
    // Сбрасываем pattern сразу после теста
    symbolPattern.lastIndex = 0;
    
    if (isSymbol) {
      // Это символы - используем Noto Sans Symbols если загружен, увеличенный размер
      if (notoSymbolsBase64) {
        try {
          pdf.setFont("NotoSymbols", "normal");
          pdf.setFontSize(symbolFontSize); // Увеличенный размер для символов
          // Faux Bold: рисуем символ трижды со смещением для жирности
          pdf.text(segment, titleX, titleY);
          pdf.text(segment, titleX + 0.2, titleY); // Смещение вправо
          pdf.text(segment, titleX + 0.1, titleY - 0.1); // Смещение по диагонали
        } catch (e) {
          console.warn("Failed to set NotoSymbols font:", e);
          pdf.text(segment, titleX, titleY);
        }
      } else {
        pdf.text(segment, titleX, titleY);
      }
    } else {
      // Обычный текст - используем Roboto Bold
      if (robotoBoldBase64) {
        try {
          pdf.setFont("Roboto", "bold");
        } catch {
          try { pdf.setFont("Roboto", "normal"); } catch { /* ignore */ }
        }
      }
      pdf.setFontSize(titleFontSize); // Обычный размер для текста
      pdf.text(segment, titleX, titleY);
    }
    
    titleX += pdf.getTextWidth(segment);
  }
  
  // Возвращаем обычный стиль для остального текста
  if (robotoFontBase64) {
    try {
      pdf.setFont("Roboto", "normal");
    } catch {
      // Игнорируем если не удалось
    }
  }

  // === ID БИЛЕТА ===
  const idFontSize = 9; // Размер шрифта ID
  pdf.setFontSize(idFontSize);
  const idText = ticket.id;
  const idTextWidth = pdf.getTextWidth(idText);
  const idPadding = 3; // Паддинг
  const idBoxWidth = idTextWidth + idPadding * 2;
  const idBoxHeight = 5.5; // Компактная высота
  const idX = innerX + innerWidth - idBoxWidth - 4;
  // Центрируем бокс по вертикали в шапке (поднимаем на 2мм)
  const idY = innerY + (headerHeight - idBoxHeight) / 2 - 1;
  
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(0, 0, 0); // Чёрная рамка
  pdf.setLineWidth(0.5);
  pdf.roundedRect(idX, idY, idBoxWidth, idBoxHeight, 1.5, 1.5, "FD");
  pdf.setTextColor(0, 0, 0); // Чёрный текст
  
  // Центрируем текст ID внутри бокса (точно по центру)
  const idTextY = idY + idBoxHeight / 2 + idFontSize * 0.15;
  pdf.text(idText, idX + idPadding, idTextY);

  // === ТАБЛИЦА ===
  pdf.setDrawColor(0, 0, 0); // Чёрные линии
  pdf.setLineWidth(0.4); // Увеличена толщина для лучшей видимости

  // Рисуем горизонтальные линии сетки
  for (let row = 0; row <= ROWS; row++) {
    const lineY = tableY + row * cellHeight;
    pdf.line(innerX, lineY, innerX + innerWidth, lineY);
  }
  
  // Рисуем вертикальные линии сетки
  for (let col = 0; col <= COLS; col++) {
    const lineX = innerX + col * cellWidth;
    pdf.line(lineX, tableY, lineX, tableY + tableHeight);
  }

  // Рисуем внешнюю рамку таблицы толще
  pdf.setDrawColor(0, 0, 0); // Чёрная рамка
  pdf.setLineWidth(0.7); // Увеличена толщина рамки
  pdf.rect(innerX, tableY, innerWidth, tableHeight);

  // === СОДЕРЖИМОЕ ЯЧЕЕК ===
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = ticket.cells[row][col];
      if (!cell.track) continue;

      const cellX = innerX + col * cellWidth;
      const cellY = tableY + row * cellHeight;
      const cellPadding = 1.5;
      const availableWidth = cellWidth - cellPadding * 2;

      // Текст трека с адаптивным размером шрифта
      const trackText = cell.track.name;
      
      // Вычисляем адаптивный размер шрифта для текста
      const pdfMaxFontSize = maxFontSize * 1.2; // Увеличиваем базовый размер для PDF
      const adaptiveFontSize = fitTextToCell(pdf, trackText, availableWidth, pdfMaxFontSize, 5);
      pdf.setFontSize(adaptiveFontSize);

      // Разбиваем текст на строки
      const lines = splitTextToLines(pdf, trackText, availableWidth);
      const lineHeight = adaptiveFontSize * 0.4;
      
      // Вычисляем высоту контента для центрирования
      const numberFontSize = showTrackNumbers ? Math.max(adaptiveFontSize * 0.7, 5) : 0;
      const numberHeight = showTrackNumbers ? numberFontSize * 0.5 + 1 : 0;
      const totalContentHeight = lines.length * lineHeight + numberHeight;
      
      // Центрируем по вертикали
      const textStartY = cellY + (cellHeight - totalContentHeight) / 2 + adaptiveFontSize * 0.35;

      // Рисуем текст трека
      pdf.setTextColor(15, 23, 42);
      for (let i = 0; i < lines.length; i++) {
        const lineWidth = pdf.getTextWidth(lines[i]);
        const lineX = cellX + (cellWidth - lineWidth) / 2;
        pdf.text(lines[i], lineX, textStartY + i * lineHeight);
      }

      // Номер трека
      if (showTrackNumbers) {
        pdf.setFontSize(numberFontSize);
        pdf.setTextColor(100, 116, 139); // slate-500
        const numberText = `#${cell.track.id}`;
        const numberWidth = pdf.getTextWidth(numberText);
        const numberX = cellX + (cellWidth - numberWidth) / 2;
        const numberY = textStartY + lines.length * lineHeight + 1.5;
        pdf.text(numberText, numberX, numberY);
      }
    }
  }
}

/**
 * Подбирает размер шрифта, чтобы текст влез в ячейку
 * Учитывает как ширину отдельных слов, так и общую ширину строк после разбиения
 */
function fitTextToCell(
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number = 5
): number {
  let fontSize = maxFontSize;
  
  while (fontSize > minFontSize) {
    pdf.setFontSize(fontSize);
    
    // Проверяем, влезает ли самое длинное слово
    const words = text.split(/\s+/);
    let allWordsFit = true;
    
    for (const word of words) {
      if (pdf.getTextWidth(word) > maxWidth) {
        allWordsFit = false;
        break;
      }
    }
    
    if (allWordsFit) {
      // Проверяем также что строки после разбиения не слишком длинные
      const lines = splitTextToLines(pdf, text, maxWidth);
      let allLinesFit = true;
      
      for (const line of lines) {
        if (pdf.getTextWidth(line) > maxWidth) {
          allLinesFit = false;
          break;
        }
      }
      
      if (allLinesFit) {
        return fontSize;
      }
    }
    
    fontSize -= 0.5;
  }
  
  return minFontSize;
}

/**
 * Разбивает текст на строки, чтобы каждая влезала в заданную ширину
 */
function splitTextToLines(pdf: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = pdf.getTextWidth(testLine);

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      // Если слово само по себе не влезает, всё равно добавляем
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Ограничиваем количество строк до 3
  return lines.slice(0, 3);
}
