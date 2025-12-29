"use client";

import { Ticket as TicketType } from "@/types/ticket";
import { Ticket } from "./Ticket";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageContext";

interface TicketGridProps {
  tickets: TicketType[];
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function TicketGrid({ tickets, showTrackNumbers = true, ticketTitle, fontSize }: TicketGridProps) {
  const { t, language } = useLanguage();
  
  if (tickets.length === 0) {
    return null;
  }

  const ticketWord = language === "ru" 
    ? (tickets.length === 1 ? "билет" : tickets.length < 5 ? "билета" : "билетов")
    : (tickets.length === 1 ? "ticket" : "tickets");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 min-w-0 w-full"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
          {t.previewTitle}
        </h2>
        <span className="text-xs sm:text-sm text-slate-500">
          {tickets.length} {ticketWord}
        </span>
      </div>
      
      {/* Preview container - 3 level structure for proper scroll containment */}
      {/* Level 1: Visual container with border - clips overflow */}
      <div className="border-2 border-slate-300 rounded-lg bg-slate-100 p-4 overflow-clip w-full">
        {/* Level 2: Scroll container - shows horizontal scrollbar when content is wider */}
        <div 
          className="overflow-x-auto"
          style={{ 
            scrollbarWidth: "thin",
            scrollbarColor: "#94a3b8 #e2e8f0"
          }}
        >
          {/* Level 3: Content with fixed minimum width - does NOT shrink */}
          <div 
            className="flex flex-col gap-4"
            style={{ minWidth: "891px" }}
          >
            {tickets.map((ticket, index) => (
              <Ticket 
                key={ticket.id}
                ticket={ticket} 
                index={index} 
                showTrackNumbers={showTrackNumbers}
                ticketTitle={ticketTitle}
                fontSize={fontSize}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
