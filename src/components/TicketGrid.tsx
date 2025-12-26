"use client";

import { Ticket as TicketType } from "@/types/ticket";
import { Ticket } from "./Ticket";
import { motion } from "framer-motion";

interface TicketGridProps {
  tickets: TicketType[];
  showTrackNumbers?: boolean;
  ticketTitle?: string;
  fontSize?: number;
}

export function TicketGrid({ tickets, showTrackNumbers = true, ticketTitle, fontSize }: TicketGridProps) {
  if (tickets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Превью билетов
        </h2>
        <span className="text-sm text-slate-500">
          {tickets.length} {tickets.length === 1 ? "билет" : tickets.length < 5 ? "билета" : "билетов"}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
