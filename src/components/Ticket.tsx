"use client";

import { Ticket as TicketType } from "@/types/ticket";
import { COLS, ROWS } from "@/types/ticket";
import { motion } from "framer-motion";

interface TicketProps {
  ticket: TicketType;
  index: number;
  forPrint?: boolean;
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function Ticket({ ticket, index, forPrint = false, showTrackNumbers = true, ticketTitle = "♪ МУЗЫКАЛЬНОЕ ЛОТО", fontSize = 9 }: TicketProps) {
  return (
    <motion.div
      initial={forPrint ? false : { opacity: 0, y: 20 }}
      animate={forPrint ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg overflow-hidden border-2 border-slate-800 shadow-sm"
    >
      {/* Заголовок билета */}
      <div className="flex justify-between items-center px-3 py-1.5 border-b-2 border-slate-800 bg-slate-100">
        <h3 className="font-bold text-sm tracking-wide text-slate-800">
          {ticketTitle}
        </h3>
        <span className="text-xs font-mono font-bold text-slate-700 border border-slate-400 px-2 py-0.5 rounded">
          {ticket.id}
        </span>
      </div>

      {/* Сетка билета - фиксированная ширина */}
      <div className="p-2">
        <table className="w-full border-collapse table-fixed">
          <tbody>
            {Array.from({ length: ROWS }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: COLS }).map((_, colIndex) => {
                  const cell = ticket.cells[rowIndex][colIndex];
                  const hasTrack = cell.track !== null;

                  return (
                    <td
                      key={colIndex}
                      className="border border-slate-700 text-center h-11 w-[11.11%] p-0.5 align-middle"
                      style={{ minWidth: "60px", maxWidth: "60px" }}
                    >
                      {hasTrack && (
                        <div className="flex flex-col justify-center h-full">
                          <span
                            className="leading-tight font-semibold text-slate-900 line-clamp-2 block px-0.5"
                            style={{ fontSize: `${fontSize}px` }}
                            title={cell.track!.name}
                          >
                            {cell.track!.name}
                          </span>
                          {showTrackNumbers && (
                            <span className="text-slate-500 font-mono" style={{ fontSize: `${Math.max(fontSize - 2, 6)}px` }}>
                              #{cell.track!.id}
                            </span>
                          )}
                        </div>
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
