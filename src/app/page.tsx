"use client";

import { useState, useMemo, useCallback } from "react";
import { InputSection } from "@/components/InputSection";
import { TicketGrid } from "@/components/TicketGrid";
import { ExportButton } from "@/components/ExportButton";
import { MissedTracksSection } from "@/components/MissedTracksSection";
import { ValidationStatus } from "@/components/ValidationStatus";
import { Ticket, Track, TicketsValidationSummary } from "@/types/ticket";
import {
  parseTracksFromInput,
  generateTickets,
  getMissedTracks,
  validateInput,
  validateTickets,
} from "@/lib/ticketLogic";
import { motion } from "framer-motion";
import { Music, Ticket as TicketIcon } from "lucide-react";

// Пример треков для демонстрации
const EXAMPLE_TRACKS = `Queen - Bohemian Rhapsody
ABBA - Dancing Queen
Michael Jackson - Thriller
The Beatles - Hey Jude
Freddie Mercury - Living On My Own
Madonna - Like a Prayer
Prince - Purple Rain
Whitney Houston - I Will Always Love You
Elton John - Rocket Man
David Bowie - Heroes
Led Zeppelin - Stairway to Heaven
Pink Floyd - Wish You Were Here
Nirvana - Smells Like Teen Spirit
AC/DC - Highway to Hell
Guns N' Roses - Sweet Child O' Mine
Bon Jovi - Livin' on a Prayer
U2 - With or Without You
Aerosmith - I Don't Want to Miss a Thing
The Rolling Stones - Paint It Black
Eagles - Hotel California
Metallica - Nothing Else Matters
Red Hot Chili Peppers - Californication
Coldplay - Yellow
Green Day - Boulevard of Broken Dreams
Linkin Park - In the End
Oasis - Wonderwall
Radiohead - Creep
The Police - Every Breath You Take
Sting - Shape of My Heart
Phil Collins - In the Air Tonight
Genesis - Invisible Touch
Dire Straits - Sultans of Swing
Eric Clapton - Tears in Heaven
Bee Gees - Stayin' Alive
Donna Summer - Hot Stuff
Gloria Gaynor - I Will Survive
Blondie - Heart of Glass
Cyndi Lauper - Girls Just Want to Have Fun
Tina Turner - What's Love Got to Do with It
Bonnie Tyler - Total Eclipse of the Heart
Bryan Adams - Summer of '69
Journey - Don't Stop Believin'
Foreigner - I Want to Know What Love Is
Boston - More Than a Feeling
Styx - Come Sail Away
REO Speedwagon - Keep On Loving You
Chicago - If You Leave Me Now
Hall & Oates - Maneater
Kenny Loggins - Footloose
Toto - Africa
Survivor - Eye of the Tiger
Europe - The Final Countdown
A-ha - Take On Me
Duran Duran - Hungry Like the Wolf
Tears for Fears - Everybody Wants to Rule the World
Depeche Mode - Enjoy the Silence
Pet Shop Boys - West End Girls
New Order - Blue Monday
The Cure - Friday I'm in Love
R.E.M. - Losing My Religion
Talking Heads - Psycho Killer
The Smiths - There Is a Light That Never Goes Out
Joy Division - Love Will Tear Us Apart
Blondie - Call Me
The Clash - Should I Stay or Should I Go
Sex Pistols - Anarchy in the U.K.
Ramones - Blitzkrieg Bop
The Stooges - I Wanna Be Your Dog
Iggy Pop - The Passenger
Lou Reed - Walk on the Wild Side
Velvet Underground - Sweet Jane
Patti Smith - Because the Night
Bruce Springsteen - Born to Run
Tom Petty - Free Fallin'
Bob Dylan - Like a Rolling Stone
Neil Young - Heart of Gold
Fleetwood Mac - Dreams
Stevie Nicks - Edge of Seventeen
Heart - Barracuda
Pat Benatar - Love Is a Battlefield
Joan Jett - I Love Rock 'n' Roll
Blondie - The Tide Is High
Eurythmics - Sweet Dreams
Annie Lennox - Walking on Broken Glass
George Michael - Careless Whisper
Wham! - Wake Me Up Before You Go-Go
Culture Club - Karma Chameleon
Spandau Ballet - True
Simple Minds - Don't You (Forget About Me)
INXS - Need You Tonight`;

export default function Home() {
  const [tracksInput, setTracksInput] = useState(EXAMPLE_TRACKS);
  const [ticketCount, setTicketCount] = useState(6);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [missedTracks, setMissedTracks] = useState<Track[]>([]);
  const [ticketsValidation, setTicketsValidation] = useState<TicketsValidationSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTrackNumbers, setShowTrackNumbers] = useState(true);
  const [ticketTitle, setTicketTitle] = useState("♪ МУЗЫКАЛЬНОЕ ЛОТО");
  const [fontSize, setFontSize] = useState(9); // Размер шрифта по умолчанию

  const validation = useMemo(() => validateInput(tracksInput), [tracksInput]);

  const handleGenerate = useCallback(() => {
    if (!validation.isValid) return;

    setIsGenerating(true);

    // Небольшая задержка для анимации
    setTimeout(() => {
      const tracks = parseTracksFromInput(tracksInput);
      const generatedTickets = generateTickets(tracks, ticketCount);
      const missed = getMissedTracks(tracks, generatedTickets);
      const ticketValidation = validateTickets(generatedTickets);
      
      setTickets(generatedTickets);
      setMissedTracks(missed);
      setTicketsValidation(ticketValidation);
      setIsGenerating(false);
    }, 500);
  }, [tracksInput, ticketCount, validation.isValid]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Хедер */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Music className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Singing Lotto</h1>
                <p className="text-xs text-slate-500">Генератор музыкальных билетов</p>
              </div>
            </div>
            
            {tickets.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ExportButton tickets={tickets} showTrackNumbers={showTrackNumbers} ticketTitle={ticketTitle} fontSize={fontSize} />
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Форма ввода */}
          <InputSection
            tracksInput={tracksInput}
            setTracksInput={setTracksInput}
            ticketCount={ticketCount}
            setTicketCount={setTicketCount}
            showTrackNumbers={showTrackNumbers}
            setShowTrackNumbers={setShowTrackNumbers}
            ticketTitle={ticketTitle}
            setTicketTitle={setTicketTitle}
            fontSize={fontSize}
            setFontSize={setFontSize}
            onGenerate={handleGenerate}
            validation={validation}
            isGenerating={isGenerating}
          />

          {/* Предупреждение о непопавших треках */}
          <MissedTracksSection missedTracks={missedTracks} />

          {/* Статус валидации билетов */}
          <ValidationStatus validation={ticketsValidation} />

          {/* Превью билетов */}
          <TicketGrid tickets={tickets} showTrackNumbers={showTrackNumbers} ticketTitle={ticketTitle} fontSize={fontSize} />
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="flex items-center justify-center gap-2">
            <TicketIcon className="h-4 w-4" />
            Singing Lotto — Музыкальное бинго в стиле Русского Лото
          </p>
        </div>
      </footer>
    </div>
  );
}
