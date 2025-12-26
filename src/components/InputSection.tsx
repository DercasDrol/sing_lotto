"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Music2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <Card className="border-2 border-slate-400 shadow-sm">
      <CardHeader className="pb-4 border-b-2 border-slate-300">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Music2 className="h-5 w-5" />
          Генератор билетов
        </CardTitle>
        <CardDescription>
          Введите 90 артистов или треков (по одному на строку)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder={`Пример:\n1. Queen - Bohemian Rhapsody\n2. ABBA - Dancing Queen\n3. Michael Jackson - Thriller\n...\n90. The Beatles - Yesterday`}
            value={tracksInput}
            onChange={(e) => setTracksInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm resize-none border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600"
          />
          
          {/* Счётчик строк */}
          <div className="absolute bottom-3 right-3 text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded shadow-sm border">
            {validation.trackCount}/90
          </div>
        </div>

        {/* Статус валидации */}
        <AnimatePresence mode="wait">
          <motion.div
            key={validation.message}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
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
            {validation.message}
          </motion.div>
        </AnimatePresence>

        {/* Настройки и кнопка генерации */}
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Заголовок билета
            </label>
            <Input
              type="text"
              placeholder="♪ МУЗЫКАЛЬНОЕ ЛОТО"
              value={ticketTitle}
              onChange={(e) => setTicketTitle(e.target.value)}
              className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Количество билетов
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={ticketCount}
                onChange={(e) => setTicketCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Размер шрифта (px)
              </label>
              <Input
                type="number"
                min={6}
                max={14}
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(6, Math.min(14, parseInt(e.target.value) || 9)))}
                className="border-2 border-slate-400 focus:border-slate-600 focus:ring-slate-600"
              />
            </div>          
          {/* Чекбокс для номеров треков */}
          <div className="flex items-center gap-2 sm:mt-6">
            <input
              type="checkbox"
              id="showNumbers"
              checked={showTrackNumbers}
              onChange={(e) => setShowTrackNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label htmlFor="showNumbers" className="text-sm text-slate-700 select-none cursor-pointer">
              Показывать номера треков
            </label>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={onGenerate}
              disabled={!validation.isValid || isGenerating}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8"
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
                  Генерация...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Сгенерировать
                </>
              )}
            </Button>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
