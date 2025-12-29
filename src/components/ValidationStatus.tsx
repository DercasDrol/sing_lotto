"use client";

import { TicketsValidationSummary } from "@/types/ticket";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";

interface ValidationStatusProps {
  validation: TicketsValidationSummary | null;
}

export function ValidationStatus({ validation }: ValidationStatusProps) {
  const { t } = useLanguage();
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
      {/* Header */}
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
              {isAllValid ? t.validationAllValid : t.validationErrorsFound}
            </h3>
            <p className={`text-sm ${isAllValid ? "text-green-600" : "text-red-600"}`}>
              {validation.validTickets} {t.validationPassedCount.replace("{total}", String(validation.totalTickets))}
            </p>
          </div>
        </div>
        
        {!isAllValid && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">
              {validation.invalidTickets} {t.validationWithErrors}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-red-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </button>

      {/* Error details */}
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
                        ❌ {detail.errors.invalidRowCounts
                          .map((r) => t.validationRowError
                            .replace("{row}", String(r.row + 1))
                            .replace("{count}", String(r.count)))
                          .join(", ")}
                      </li>
                    )}
                    
                    {detail.errors.duplicateTracks.length > 0 && (
                      <li>
                        ❌ {t.validationDuplicates}: #{detail.errors.duplicateTracks.join(", #")}
                      </li>
                    )}
                    
                    {detail.errors.fullColumnsExceeded && (
                      <li>
                        ❌ {t.validationTooManyColumns.replace("{count}", String(detail.errors.fullColumnsCount))}
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation criteria summary */}
      {isAllValid && (
        <div className="px-4 pb-4">
          <div className="text-xs text-green-600 space-y-1">
            <p>{t.validationCriteria1}</p>
            <p>{t.validationCriteria2}</p>
            <p>{t.validationCriteria3}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
