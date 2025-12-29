"use client";

import { Button } from "@/components/ui/button";
import { Ticket as TicketType, ROWS, COLS } from "@/types/ticket";
import { Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { useLanguage } from "./LanguageContext";

// Fonts in base64 (loaded dynamically)
let fontsLoaded = false;
let robotoFontBase64: string | null = null;
let robotoBoldBase64: string | null = null;
let notoSymbolsBase64: string | null = null; // For symbols like ♪ 🎺

interface ExportButtonProps {
  tickets: TicketType[];
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function ExportButton({ tickets, showTrackNumbers = true, ticketTitle = "♪ SING LOTO", fontSize = 9 }: ExportButtonProps) {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(fontsLoaded);
  const [fontError, setFontError] = useState(false);

  // Load fonts on component mount
  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      loadAllFonts()
        .then(() => {
          fontsLoaded = true;
          setFontLoaded(true);
        })
        .catch(() => {
          setFontError(true);
          setFontLoaded(true); // Allow export even without font
        });
    }
  }, [fontError]);

  const exportToPDF = async () => {
    if (tickets.length === 0) return;

    setIsExporting(true);

    try {
      // Create PDF in A4 LANDSCAPE orientation
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add fonts with Cyrillic support
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
      
      // Add font for special symbols (♪, 🎣, etc.)
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

        // Add new page if needed
        if (i > 0 && positionOnPage === 0) {
          pdf.addPage();
        }

        const yOffset = marginY + positionOnPage * (ticketHeight + gapBetweenTickets);

        // Render ticket
        renderTicketToPDF(pdf, ticket, marginX, yOffset, ticketWidth, ticketHeight, showTrackNumbers, ticketTitle, fontSize);

        // Add dashed cut line between tickets
        if (positionOnPage === 0 && i + 1 < tickets.length) {
          const lineY = marginY + ticketHeight + gapBetweenTickets / 2;
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineDashPattern([2, 1.5], 0);
          pdf.setLineWidth(0.2);
          pdf.line(marginX, lineY, pageWidth - marginX, lineY);
        }
      }

      // Save PDF
      pdf.save(`sing-loto-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF. Please try again.");
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
          {t.exporting}
        </>
      ) : !fontLoaded ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t.loadingFont}
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {t.exportPDF}
        </>
      )}
    </Button>
  );
}

/**
 * Loads all required fonts: Roboto (Cyrillic) and Noto Sans Symbols (special characters)
 */
async function loadAllFonts(): Promise<void> {
  // Font URLs via jsDelivr CDN
  const robotoRegularUrl = "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Regular.ttf";
  const robotoBoldUrl = "https://cdn.jsdelivr.net/gh/googlefonts/roboto@main/src/hinted/Roboto-Bold.ttf";
  // Noto Sans Symbols contains music symbols ♪ ♫ and many others
  const notoSymbolsUrl = "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanssymbols/NotoSansSymbols%5Bwght%5D.ttf";
  
  // Load all fonts in parallel
  const results = await Promise.allSettled([
    loadSingleFont(robotoRegularUrl, "Roboto Regular"),
    loadSingleFont(robotoBoldUrl, "Roboto Bold"),
    loadSingleFont(notoSymbolsUrl, "Noto Sans Symbols")
  ]);
  
  // Process results
  if (results[0].status === 'fulfilled') {
    robotoFontBase64 = results[0].value;
    console.log("✓ Roboto Regular loaded successfully");
  } else {
    console.error("✗ Failed to load Roboto Regular:", results[0].reason);
    throw results[0].reason; // Roboto is required
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
 * Loads a single font and returns base64
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
  
  // Verify file is not empty and is a valid TTF
  if (arrayBuffer.byteLength < 10000) {
    throw new Error(`Font file too small (${arrayBuffer.byteLength} bytes), possibly not a valid TTF`);
  }
  
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to base64
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
 * Renders a ticket directly to PDF (text mode)
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
  const padding = 3; // Padding inside ticket frame
  const headerHeight = 12;
  const cornerRadius = 3;
  
  // Inner dimensions
  const innerX = x + padding;
  const innerY = y + padding;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  
  const tableY = innerY + headerHeight;
  const tableHeight = innerHeight - headerHeight;
  const cellWidth = innerWidth / COLS;
  const cellHeight = tableHeight / ROWS;

  // === OUTER TICKET FRAME WITH ROUNDED CORNERS ===
  pdf.setDrawColor(30, 41, 59); // slate-800
  pdf.setFillColor(255, 255, 255);
  pdf.setLineWidth(0.8);
  pdf.setLineDashPattern([], 0);
  pdf.roundedRect(x, y, width, height, cornerRadius, cornerRadius, "FD");

  // === HEADER ===
  pdf.setFillColor(241, 245, 249); // slate-100
  // Draw header as rectangle inside frame
  pdf.rect(innerX, innerY, innerWidth, headerHeight, "F");
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.4);
  pdf.line(innerX, innerY + headerHeight, innerX + innerWidth, innerY + headerHeight);

  // === TITLE ===
  pdf.setTextColor(15, 23, 42); // slate-900
  const titleFontSize = Math.min(20, maxFontSize * 1.8); // Max increased
  const symbolFontSize = titleFontSize * 1.3; // Symbols 30% larger for better visibility
  pdf.setFontSize(titleFontSize);
  
  // Calculate Y position for vertically centered text
  // Text baseline is at bottom, reduce offset
  const titleY = innerY + headerHeight / 2 + titleFontSize * 0.08;
  
  // Render title with mixed font support (symbols + Cyrillic)
  let titleX = innerX + 4;
  
  // Split text into segments: symbols and regular text
  // Unicode symbols: music notes, emoji, etc.
  const symbolPattern = /([♪♫🎵🎶🎺🎸🎹🎷🎻🥁🎤🎧🎼]+)/g;
  const segments = ticketTitle.split(symbolPattern);
  
  for (const segment of segments) {
    if (!segment) continue;
    
    const isSymbol = symbolPattern.test(segment);
    // Reset pattern right after test
    symbolPattern.lastIndex = 0;
    
    if (isSymbol) {
      // These are symbols - use Noto Sans Symbols if loaded, larger size
      if (notoSymbolsBase64) {
        try {
          pdf.setFont("NotoSymbols", "normal");
          pdf.setFontSize(symbolFontSize); // Larger size for symbols
          // Faux Bold: draw symbol three times with offset for boldness
          pdf.text(segment, titleX, titleY);
          pdf.text(segment, titleX + 0.2, titleY); // Offset right
          pdf.text(segment, titleX + 0.1, titleY - 0.1); // Diagonal offset
        } catch (e) {
          console.warn("Failed to set NotoSymbols font:", e);
          pdf.text(segment, titleX, titleY);
        }
      } else {
        pdf.text(segment, titleX, titleY);
      }
    } else {
      // Regular text - use Roboto Bold
      if (robotoBoldBase64) {
        try {
          pdf.setFont("Roboto", "bold");
        } catch {
          try { pdf.setFont("Roboto", "normal"); } catch { /* ignore */ }
        }
      }
      pdf.setFontSize(titleFontSize); // Normal size for text
      pdf.text(segment, titleX, titleY);
    }
    
    titleX += pdf.getTextWidth(segment);
  }
  
  // Reset to normal style for remaining text
  if (robotoFontBase64) {
    try {
      pdf.setFont("Roboto", "normal");
    } catch {
      // Ignore if failed
    }
  }

  // === TICKET ID ===
  const idFontSize = 9; // ID font size
  pdf.setFontSize(idFontSize);
  const idText = ticket.id;
  const idTextWidth = pdf.getTextWidth(idText);
  const idPadding = 3; // Padding
  const idBoxWidth = idTextWidth + idPadding * 2;
  const idBoxHeight = 5.5; // Compact height
  const idX = innerX + innerWidth - idBoxWidth - 4;
  // Center box vertically in header (raised by 2mm)
  const idY = innerY + (headerHeight - idBoxHeight) / 2 - 1;
  
  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(0, 0, 0); // Black border
  pdf.setLineWidth(0.5);
  pdf.roundedRect(idX, idY, idBoxWidth, idBoxHeight, 1.5, 1.5, "FD");
  pdf.setTextColor(0, 0, 0); // Black text
  
  // Center ID text inside box (exactly centered)
  const idTextY = idY + idBoxHeight / 2 + idFontSize * 0.15;
  pdf.text(idText, idX + idPadding, idTextY);

  // === TABLE ===
  pdf.setDrawColor(0, 0, 0); // Black lines
  pdf.setLineWidth(0.4); // Increased thickness for better visibility

  // Draw horizontal grid lines
  for (let row = 0; row <= ROWS; row++) {
    const lineY = tableY + row * cellHeight;
    pdf.line(innerX, lineY, innerX + innerWidth, lineY);
  }
  
  // Draw vertical grid lines
  for (let col = 0; col <= COLS; col++) {
    const lineX = innerX + col * cellWidth;
    pdf.line(lineX, tableY, lineX, tableY + tableHeight);
  }

  // Draw thicker outer table frame
  pdf.setDrawColor(0, 0, 0); // Black border
  pdf.setLineWidth(0.7); // Thicker frame
  pdf.rect(innerX, tableY, innerWidth, tableHeight);

  // === CELL CONTENT ===
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = ticket.cells[row][col];
      if (!cell.track) continue;

      const cellX = innerX + col * cellWidth;
      const cellY = tableY + row * cellHeight;
      const cellPadding = 0.8;
      const availableWidth = cellWidth - cellPadding * 2;
      const availableHeight = cellHeight - cellPadding * 2;

      // Track text with adaptive font size
      const trackText = cell.track.name;
      
      // Calculate adaptive font size - slightly smaller if showing numbers
      const pdfMaxFontSize = showTrackNumbers ? maxFontSize * 1.0 : maxFontSize * 1.2;
      const adaptiveFontSize = fitTextToCell(pdf, trackText, availableWidth, availableHeight, pdfMaxFontSize, 5, showTrackNumbers);
      pdf.setFontSize(adaptiveFontSize);

      // Split text into lines
      const lines = splitTextToLines(pdf, trackText, availableWidth);
      const lineHeight = adaptiveFontSize * 0.38;
      
      // Fixed track number font size (independent of text size)
      // 10px preview / 3 scale ≈ 3.33mm ≈ 9.5pt (rounded to 9pt for PDF)
      const numberFontSize = showTrackNumbers ? 9 : 0; // pt - fixed
      const numberHeight = showTrackNumbers ? numberFontSize * 0.35 : 0;
      
      // Calculate total content height for centering
      const totalContentHeight = lines.length * lineHeight + numberHeight;
      
      // Center vertically
      const textStartY = cellY + (cellHeight - totalContentHeight) / 2 + adaptiveFontSize * 0.28;

      // Draw track text
      pdf.setTextColor(15, 23, 42);
      for (let i = 0; i < lines.length; i++) {
        const lineWidth = pdf.getTextWidth(lines[i]);
        const lineX = cellX + (cellWidth - lineWidth) / 2;
        pdf.text(lines[i], lineX, textStartY + i * lineHeight);
      }

      // Track number
      if (showTrackNumbers) {
        pdf.setFontSize(numberFontSize);
        pdf.setTextColor(100, 116, 139); // slate-500
        const numberText = `#${cell.track.id}`;
        const numberWidth = pdf.getTextWidth(numberText);
        const numberX = cellX + (cellWidth - numberWidth) / 2;
        // marginTop: 0.3px preview / 3 scale ≈ 0.1mm in PDF
        const numberY = textStartY + lines.length * lineHeight + 0.1;
        pdf.text(numberText, numberX, numberY);
      }
    }
  }
}

/**
 * Fits text to cell by finding optimal font size
 * Considers both width of words, total width of lines, AND total height
 */
function fitTextToCell(
  pdf: jsPDF,
  text: string,
  maxWidth: number,
  maxHeight: number,
  maxFontSize: number,
  minFontSize: number = 5,
  showTrackNumbers: boolean = false
): number {
  let fontSize = maxFontSize;
  
  // Fixed track number font size (10px preview ≈ 9pt in PDF)
  const numberFontSize = 9; // pt
  const numberHeight = showTrackNumbers ? numberFontSize * 0.35 + 0.1 : 0; // including marginTop
  
  while (fontSize > minFontSize) {
    pdf.setFontSize(fontSize);
    
    // Check if longest word fits in width
    const words = text.split(/\s+/);
    let allWordsFit = true;
    
    for (const word of words) {
      if (pdf.getTextWidth(word) > maxWidth) {
        allWordsFit = false;
        break;
      }
    }
    
    if (allWordsFit) {
      // Check that lines after splitting fit in width
      const lines = splitTextToLines(pdf, text, maxWidth);
      let allLinesFit = true;
      
      for (const line of lines) {
        if (pdf.getTextWidth(line) > maxWidth) {
          allLinesFit = false;
          break;
        }
      }
      
      if (allLinesFit) {
        // Check height: text + number must fit
        const lineHeight = fontSize * 0.38;
        const totalHeight = lines.length * lineHeight + numberHeight;
        
        if (totalHeight <= maxHeight) {
          return fontSize;
        }
      }
    }
    
    fontSize -= 0.5;
  }
  
  return minFontSize;
}

/**
 * Splits text into lines so each fits within the given width
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
      // If word itself doesn't fit, add it anyway
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // Limit to 3 lines max
  return lines.slice(0, 3);
}
