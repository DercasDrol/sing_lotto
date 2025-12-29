"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Music } from "lucide-react";
import { Track } from "@/types/ticket";
import { useLanguage } from "./LanguageContext";

interface MissedTracksSectionProps {
  missedTracks: Track[];
}

export function MissedTracksSection({ missedTracks }: MissedTracksSectionProps) {
  const { t, language } = useLanguage();
  
  if (missedTracks.length === 0) {
    return null;
  }

  const description = language === "ru" 
    ? "Следующие треки не вошли ни в один билет. Увеличьте количество билетов, чтобы включить все треки."
    : "The following tracks are not included in any ticket. Increase the number of tickets to include all tracks.";

  return (
    <Card className="border-2 border-amber-400 shadow-sm bg-amber-50/50">
      <CardHeader className="pb-3 border-b-2 border-amber-300">
        <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
          <AlertTriangle className="h-5 w-5" />
          {t.missedTracksTitle} ({missedTracks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-amber-700 mb-3">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {missedTracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-full text-sm text-amber-900"
            >
              <Music className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-medium">#{track.id}</span>
              <span className="text-amber-700">{track.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
