"use client";

import { Button } from "@/components/ui/button";
import { Ticket as TicketType } from "@/types/ticket";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportButtonProps {
  tickets: TicketType[];
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function ExportButton({ tickets, showTrackNumbers = true, ticketTitle = "♪ МУЗЫКАЛЬНОЕ ЛОТО", fontSize = 9 }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

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

      // A4 landscape: 297mm x 210mm
      const pageWidth = 297;
      const marginX = 10;
      const marginY = 8;
      const ticketWidth = pageWidth - marginX * 2;
      const ticketHeight = 88;
      const ticketsPerPage = 2;
      const gapBetweenTickets = 8;

      // Создаем временный контейнер для рендеринга
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "1200px"; // Увеличенная ширина для лучшего качества
      container.style.backgroundColor = "white";
      container.style.padding = "0";
      document.body.appendChild(container);

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const positionOnPage = i % ticketsPerPage;

        // Добавляем новую страницу если нужно
        if (i > 0 && positionOnPage === 0) {
          pdf.addPage();
        }

        // Создаем HTML билета
        container.innerHTML = renderTicketHTML(ticket, showTrackNumbers, ticketTitle, fontSize);

        // Ждем загрузки стилей
        await new Promise(resolve => setTimeout(resolve, 50));

        // Конвертируем в canvas с оптимизированным качеством
        const canvas = await html2canvas(container, {
          scale: 2, // Уменьшено с 3 до 2 для уменьшения размера
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
        });

        // Добавляем изображение в PDF в формате JPEG для уменьшения размера файла
        const imgData = canvas.toDataURL("image/jpeg", 0.85); // JPEG с качеством 85%
        const yPosition = marginY + positionOnPage * (ticketHeight + gapBetweenTickets);

        pdf.addImage(imgData, "JPEG", marginX, yPosition, ticketWidth, ticketHeight);

        // Добавляем пунктирную линию для вырезания между билетами
        if (positionOnPage === 0 && i + 1 < tickets.length) {
          const lineY = marginY + ticketHeight + gapBetweenTickets / 2;
          pdf.setDrawColor(140, 140, 140);
          pdf.setLineDashPattern([3, 2], 0);
          pdf.setLineWidth(0.3);
          pdf.line(marginX, lineY, pageWidth - marginX, lineY);
        }
      }

      // Удаляем временный контейнер
      document.body.removeChild(container);

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
      disabled={isExporting}
      className="bg-slate-900 hover:bg-slate-800 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Экспорт...
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
 * Генерирует HTML билета с правильным выравниванием и без обрезки
 * ВАЖНО: НЕ используем flexbox и line-clamp, т.к. html2canvas их плохо рендерит
 */
function renderTicketHTML(ticket: TicketType, showTrackNumbers: boolean, ticketTitle: string, fontSize: number): string {
  const numberFontSize = Math.max(fontSize - 2, 6);
  // Динамическая высота ячейки: адаптируется к размеру шрифта
  const cellHeight = 40 + fontSize * 3;
  
  const cellsHTML = ticket.cells
    .map(
      (row) => `
      <tr>
        ${row
          .map(
            (cell) => `
          <td style="
            border: 1px solid #475569;
            width: 11.11%;
            height: ${cellHeight}px;
            text-align: center;
            vertical-align: middle;
            padding: 4px 3px;
            box-sizing: border-box;
          ">
            ${
              cell.track
                ? `
              <div style="
                display: table;
                width: 100%;
                height: 100%;
              ">
                <div style="
                  display: table-cell;
                  vertical-align: middle;
                  text-align: center;
                ">
                  <div style="
                    font-size: ${fontSize}px;
                    font-weight: 600;
                    color: #0f172a;
                    line-height: 1.25;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                  ">
                    ${cell.track.name}
                  </div>
                  ${showTrackNumbers ? `
                  <div style="
                    font-size: ${numberFontSize}px;
                    color: #64748b;
                    font-family: 'Courier New', monospace;
                    line-height: 1;
                    margin-top: 3px;
                  ">
                    #${cell.track.id}
                  </div>
                  ` : ''}
                </div>
              </div>
            `
                : ""
            }
          </td>
        `
          )
          .join("")}
      </tr>
    `
    )
    .join("");

  return `
    <div style="
      background: white;
      border: 2px solid #1e293b;
      border-radius: 8px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      box-sizing: border-box;
    ">
      <div style="
        min-height: 36px;
        padding: 8px 14px;
        background: #f1f5f9;
        border-bottom: 2px solid #1e293b;
        display: table;
        width: 100%;
        box-sizing: border-box;
      ">
        <div style="
          display: table-cell;
          vertical-align: middle;
          width: 85%;
        ">
          <span style="
            font-weight: 700;
            font-size: 13px;
            color: #0f172a;
            letter-spacing: 0.3px;
            line-height: 1.3;
          ">${ticketTitle}</span>
        </div>
        <div style="
          display: table-cell;
          vertical-align: middle;
          text-align: right;
        ">
          <span style="
            font-size: 10px;
            font-family: 'Courier New', monospace;
            font-weight: 700;
            color: #334155;
            border: 1.5px solid #475569;
            padding: 4px 8px;
            border-radius: 3px;
            background: white;
            line-height: 1;
            white-space: nowrap;
          ">
            ${ticket.id}
          </span>
        </div>
      </div>
      <div style="padding: 8px;">
        <table style="
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          border: 2px solid #334155;
        ">
          <tbody>
            ${cellsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
