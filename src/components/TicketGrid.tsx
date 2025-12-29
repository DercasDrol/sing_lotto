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
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {t.previewTitle}
        </h2>
        <span className="text-sm text-slate-500">
          {tickets.length} {ticketWord}
        </span>
      </div>
      
      {/* One ticket per row for better preview */}
      <div className="flex flex-col gap-6">
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
    </motion.div>
  );
}
