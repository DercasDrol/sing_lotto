"use client";

import { Music, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-10 w-10 text-slate-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          Вы не в сети
        </h1>
        
        <p className="text-slate-600 mb-6">
          Похоже, у вас нет подключения к интернету. 
          Проверьте соединение и попробуйте снова.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Music className="h-5 w-5" />
          <span className="font-medium">Sing Loto</span>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
