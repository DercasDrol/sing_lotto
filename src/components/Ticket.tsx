"use client";

import { Ticket as TicketType } from "@/types/ticket";
import { COLS, ROWS } from "@/types/ticket";
import { motion } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

interface TicketProps {
  ticket: TicketType;
  index: number;
  forPrint?: boolean;
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

/**
 * Компонент ячейки с адаптивным размером шрифта
 * Уменьшает шрифт если текст не влезает в ячейку
 */
function AdaptiveCell({ 
  text, 
  maxFontSize, 
  minFontSize = 6,
  showNumber,
  trackId 
}: { 
  text: string; 
  maxFontSize: number; 
  minFontSize?: number;
  showNumber: boolean;
  trackId: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adaptedFontSize, setAdaptedFontSize] = useState(maxFontSize);
  const [lines, setLines] = useState<string[]>([text]);
  const [isReady, setIsReady] = useState(false);

  const fitText = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    if (containerWidth <= 0 || containerHeight <= 0) {
      return;
    }
    
    // Create canvas for text measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsReady(true);
      return;
    }

    // Reserve space for number if shown
    const numberReserve = showNumber ? 12 : 0;
    const availableWidth = containerWidth - 4;
    const availableHeight = containerHeight - numberReserve - 4;
    
    let fontSize = maxFontSize;
    let bestLines: string[] = [];
    let foundFit = false;
    
    // Try decreasing font sizes until text fits
    while (fontSize >= minFontSize && !foundFit) {
      ctx.font = `${fontSize}px Roboto, Arial, sans-serif`;
      
      // Split text into lines
      const words = text.split(/\s+/);
      const currentLines: string[] = [];
      let currentLine = "";
      let maxLinesFit = true;
      
      for (const word of words) {
        // Check if single word is too wide
        const wordWidth = ctx.measureText(word).width;
        if (wordWidth > availableWidth) {
          // Word too long, need smaller font
          maxLinesFit = false;
          break;
        }
        
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= availableWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            currentLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      if (currentLine) {
        currentLines.push(currentLine);
      }
      
      // Check if all text fits in height
      const lineHeight = fontSize * 1.15;
      const totalHeight = currentLines.length * lineHeight;
      
      if (maxLinesFit && totalHeight <= availableHeight) {
        bestLines = currentLines;
        foundFit = true;
      } else {
        fontSize -= 0.5;
      }
    }
    
    // Use minimum font if nothing fits
    if (!foundFit) {
      ctx.font = `${minFontSize}px Roboto, Arial, sans-serif`;
      const words = text.split(/\s+/);
      bestLines = [];
      let currentLine = "";
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= availableWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            bestLines.push(currentLine);
          }
          currentLine = word;
        }
      }
      if (currentLine) {
        bestLines.push(currentLine);
      }
      fontSize = minFontSize;
    }
    
    setAdaptedFontSize(fontSize);
    setLines(bestLines);
    setIsReady(true);
  }, [text, maxFontSize, minFontSize, showNumber]);

  useEffect(() => {
    // Initial fit after mount
    const timer = setTimeout(fitText, 10);
    
    // Refit on resize
    const resizeObserver = new ResizeObserver(() => {
      fitText();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, [fitText]);

  // Фиксированный размер номера трека (не зависит от размера текста)
  const numberFontSize = 12; // px - фиксированный (увеличен в 2 раза)

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full flex flex-col justify-center items-center"
      style={{ 
        visibility: isReady ? 'visible' : 'hidden',
        overflow: 'hidden'
      }}
    >
      <div
        className="text-center text-slate-900"
        style={{ 
          fontSize: `${adaptedFontSize}px`,
          fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif',
          lineHeight: 1.15,
          fontWeight: 400
        }}
        title={text}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      {showNumber && (
        <div 
          className="text-slate-500 font-mono text-center" 
          style={{ 
            fontSize: `${numberFontSize}px`,
            marginTop: '1.4px',
            lineHeight: 1
          }}
        >
          #{trackId}
        </div>
      )}
    </div>
  );
}

export function Ticket({ ticket, index, forPrint = false, showTrackNumbers = false, ticketTitle = "♪ SING LOTO", fontSize = 14 }: TicketProps) {
  // Scale: PDF uses mm, web uses pixels
  // Approximate ratio: 3px = 1mm for good readability on screen
  const scale = 3; // px per mm
  
  // Dimensions like in PDF
  const headerHeightMm = 12;
  const headerHeightPx = headerHeightMm * scale;
  
  // Font sizes (PDF uses pt, here we convert)
  const titleFontSizePt = Math.min(20, fontSize * 1.8);
  const titleFontSizePx = titleFontSizePt * 1.33; // pt to px
  
  const idFontSizePt = 9;
  const idFontSizePx = idFontSizePt * 1.33;
  
  // Размер шрифта ячеек (в PDF используется fontSize * 1.2, переводим в px)
  const cellFontSizePx = fontSize * 1.6;
  
  return (
    <motion.div
      initial={forPrint ? false : { opacity: 0, y: 20 }}
      animate={forPrint ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white overflow-hidden shadow-md w-full"
      style={{ 
        aspectRatio: "297 / 97",
        borderRadius: `${3 * scale}px`,
        border: `${0.8 * scale}px solid rgb(30, 41, 59)` // slate-800
      }}
    >
      {/* Заголовок билета - как в PDF */}
      <div 
        className="flex justify-between items-center bg-slate-100"
        style={{ 
          height: `${headerHeightPx}px`,
          padding: `0 ${4 * scale}px`
          // Убрал borderBottom - в PDF линия идёт от таблицы
        }}
      >
        <h3 
          className="font-bold tracking-wide text-slate-800"
          style={{ 
            fontSize: `${titleFontSizePx}px`,
            fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif'
          }}
        >
          {ticketTitle}
        </h3>
        <span 
          className="bg-white"
          style={{ 
            fontSize: `${idFontSizePx}px`,
            color: 'black',
            border: `${0.5 * scale}px solid black`,
            padding: `${1 * scale}px ${3 * scale}px`,
            borderRadius: `${1.5 * scale}px`,
            fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif',
            fontWeight: 400
          }}
        >
          {ticket.id}
        </span>
      </div>

      {/* Сетка билета - как в PDF */}
      <div 
        className="w-full"
        style={{ 
          height: `calc(100% - ${headerHeightPx}px)`,
          padding: `${2 * scale}px`
        }}
      >
        <table 
          className="w-full h-full border-collapse"
          style={{ border: `${0.7 * scale}px solid black` }}
        >
          <tbody>
            {Array.from({ length: ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex} style={{ height: `${100 / ROWS}%` }}>
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  const cell = ticket.cells[rowIndex][colIndex];
                  const hasTrack = cell.track !== null;

                  return (
                    <td
                      key={colIndex}
                      className="text-center align-middle"
                      style={{ 
                        width: `${100 / COLS}%`,
                        border: `${0.4 * scale}px solid black`,
                        padding: `${1.5 * scale}px`
                      }}
                    >
                      {hasTrack && (
                        <AdaptiveCell
                          text={cell.track!.name}
                          maxFontSize={cellFontSizePx}
                          minFontSize={7}
                          showNumber={showTrackNumbers}
                          trackId={cell.track!.id}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
