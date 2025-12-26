"use client";

import { TicketsValidationSummary } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ValidationStatusProps {
  validation: TicketsValidationSummary | null;
}

export function ValidationStatus({ validation }: ValidationStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!validation || validation.totalTickets === 0) {
    return null;
  }

  const isAllValid = validation.invalidTickets === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border-2 ${
        isAllValid
          ? "bg-green-50 border-green-300"
          : "bg-red-50 border-red-300"
      }`}
    >
      {/* Заголовок */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {isAllValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <h3 className={`font-semibold ${isAllValid ? "text-green-800" : "text-red-800"}`}>
              {isAllValid ? "Все билеты валидны" : "Обнаружены ошибки в билетах"}
            </h3>
            <p className={`text-sm ${isAllValid ? "text-green-600" : "text-red-600"}`}>
              {validation.validTickets} из {validation.totalTickets} билетов прошли проверку
            </p>
          </div>
        </div>
        
        {!isAllValid && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">
              {validation.invalidTickets} с ошибками
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </button>

      {/* Детали ошибок */}
      <AnimatePresence>
        {isExpanded && !isAllValid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {validation.invalidDetails.map((detail) => (
                <div
                  key={detail.ticketId}
                  className="bg-white rounded-lg p-3 border border-red-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-mono text-sm font-semibold text-red-700">
                      {detail.ticketId}
                    </span>
                  </div>
                  
                  <ul className="text-sm text-red-600 space-y-1 ml-6">
                    {detail.errors.invalidRowCounts.length > 0 && (
                      <li>
                        ❌ Неверное количество ячеек в строках:{" "}
                        {detail.errors.invalidRowCounts
                          .map((r) => `строка ${r.row + 1}: ${r.count} вместо 5`)
                          .join(", ")}
                      </li>
                    )}
                    
                    {detail.errors.duplicateTracks.length > 0 && (
                      <li>
                        ❌ Дублирующиеся треки: #{detail.errors.duplicateTracks.join(", #")}
                      </li>
                    )}
                    
                    {detail.errors.fullColumnsExceeded && (
                      <li>
                        ❌ Слишком много полных колонок: {detail.errors.fullColumnsCount} (макс. 1)
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сводка критериев валидации */}
      {isAllValid && (
        <div className="px-4 pb-4">
          <div className="text-xs text-green-600 space-y-1">
            <p>✓ В каждой строке ровно 5 заполненных ячеек</p>
            <p>✓ Нет дублирующихся треков в билетах</p>
            <p>✓ Не более 1 полностью заполненной колонки на билет</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
