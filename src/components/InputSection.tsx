"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Music2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "./LanguageContext";

interface InputSectionProps {
  tracksInput: string;
  setTracksInput: (value: string) => void;
  ticketCount: number;
  setTicketCount: (value: number) => void;
  showTrackNumbers: boolean;
  setShowTrackNumbers: (value: boolean) => void;
  ticketTitle: string;
  setTicketTitle: (value: string) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  onGenerate: () => void;
  validation: {
    isValid: boolean;
    trackCount: number;
    message: string;
  };
  isGenerating: boolean;
}

export function InputSection({
  tracksInput,
  setTracksInput,
  ticketCount,
  setTicketCount,
  showTrackNumbers,
  setShowTrackNumbers,
  ticketTitle,
  setTicketTitle,
  fontSize,
  setFontSize,
  onGenerate,
  validation,
  isGenerating,
}: InputSectionProps) {
  const { t } = useLanguage();
  
  return (
    <Card className="border-2 border-slate-400 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4 border-b-2 border-slate-300">
        <CardTitle className="flex items-center gap-2 text-slate-900 text-base sm:text-lg">
          <Music2 className="h-4 w-4 sm:h-5 sm:w-5" />
          {t.inputSectionTitle}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t.inputHelp}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 pt-4">
        <div className="relative">
          <Textarea
            placeholder={t.inputPlaceholder}
            value={tracksInput}
            onChange={(e) => setTracksInput(e.target.value)}
            className="min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm resize-none border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600"
          />
          
          {/* Counter */}
          <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded shadow-sm border">
            {validation.trackCount}/90
          </div>
        </div>

        {/* Validation status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={validation.message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 text-xs sm:text-sm p-2 sm:p-3 rounded-lg ${
              validation.isValid
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {validation.isValid ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {validation.trackCount} {t.validTracksCount} {!validation.isValid && `(${t.needMoreTracks})`}
          </motion.div>
        </AnimatePresence>

        {/* Settings and generate button */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5 block">
              {t.ticketTitle}
            </label>
            <Input
              type="text"
              placeholder={t.defaultTicketTitle}
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5 block">
                {t.ticketCount}
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={ticketCount}
                onChange={(e) => setTicketCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1 sm:mb-1.5 block">
                {t.fontSize}
              </label>
              <Input
                type="number"
                min={6}
                max={14}
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(6, Math.min(14, parseInt(e.target.value) || 9)))}
                className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600 text-sm"
              />
            </div>          
            {/* Checkbox for track numbers */}
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1 sm:mt-6">
              <input
                type="checkbox"
                id="showNumbers"
                checked={showTrackNumbers}
                onChange={(e) => setShowTrackNumbers(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              <label htmlFor="showNumbers" className="text-xs sm:text-sm text-slate-700 select-none cursor-pointer">
                {t.showTrackNumbers}
              </label>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={onGenerate}
              disabled={!validation.isValid || isGenerating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-8 h-10 sm:h-11"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  {t.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t.generateTickets}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
