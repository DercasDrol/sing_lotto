/**
 * Localization system for Sing Loto
 * Default language: English
 */

export type Language = "en" | "ru";

export interface Translations {
  // Header
  appTitle: string;
  languageToggle: string;
  
  // Input section
  inputSectionTitle: string;
  inputPlaceholder: string;
  inputHelp: string;
  trackCount: string;
  invalidInput: string;
  
  // Settings
  settingsTitle: string;
  ticketCount: string;
  ticketTitle: string;
  fontSize: string;
  showTrackNumbers: string;
  
  // Generate button
  generateTickets: string;
  generating: string;
  
  // Ticket preview
  previewTitle: string;
  noTickets: string;
  
  // Export
  exportPDF: string;
  exporting: string;
  loadingFont: string;
  
  // Missed tracks
  missedTracksTitle: string;
  allTracksCovered: string;
  
  // Default ticket title (localized)
  defaultTicketTitle: string;
  
  // Validation messages
  validTracksCount: string;
  needMoreTracks: string;
  tooManyTracks: string;
  
  // Ticket validation
  validationAllValid: string;
  validationErrorsFound: string;
  validationPassedCount: string;
  validationWithErrors: string;
  validationRowError: string;
  validationDuplicates: string;
  validationTooManyColumns: string;
  validationCriteria1: string;
  validationCriteria2: string;
  validationCriteria3: string;
}

const en: Translations = {
  // Header
  appTitle: "Sing Loto Generator",
  languageToggle: "RU",
  
  // Input section
  inputSectionTitle: "Track List",
  inputPlaceholder: "Enter tracks, one per line (90 tracks total)...\n\n1. Song Name\n2. Another Song\n...",
  inputHelp: "Enter 90 tracks, one per line.",
  trackCount: "Tracks:",
  invalidInput: "Invalid input",
  
  // Settings
  settingsTitle: "Settings",
  ticketCount: "Number of tickets",
  ticketTitle: "Ticket title",
  fontSize: "Font size",
  showTrackNumbers: "Show track numbers",
  
  // Generate button
  generateTickets: "Generate Tickets",
  generating: "Generating...",
  
  // Ticket preview
  previewTitle: "Preview",
  noTickets: "No tickets generated yet. Enter tracks and click Generate.",
  
  // Export
  exportPDF: "Download PDF",
  exporting: "Exporting...",
  loadingFont: "Loading font...",
  
  // Missed tracks
  missedTracksTitle: "Missed Tracks",
  allTracksCovered: "All tracks are covered!",
  
  // Default ticket title
  defaultTicketTitle: "♪ SING LOTO",
  
  // Validation messages
  validTracksCount: "tracks entered",
  needMoreTracks: "Need 90 tracks",
  tooManyTracks: "Maximum 90 tracks",
  
  // Ticket validation
  validationAllValid: "All tickets are valid",
  validationErrorsFound: "Errors found in tickets",
  validationPassedCount: "of {total} tickets passed validation",
  validationWithErrors: "with errors",
  validationRowError: "row {row}: {count} instead of 5",
  validationDuplicates: "Duplicate tracks",
  validationTooManyColumns: "Too many full columns: {count} (max 1)",
  validationCriteria1: "✓ Exactly 5 filled cells in each row",
  validationCriteria2: "✓ No duplicate tracks in tickets",
  validationCriteria3: "✓ No more than 1 fully filled column per ticket"
};

const ru: Translations = {
  // Header
  appTitle: "Генератор Пой-Лото",
  languageToggle: "EN",
  
  // Input section
  inputSectionTitle: "Список треков",
  inputPlaceholder: "Введите треки, по одному на строку (всего 90 треков)...\n\n1. Название песни\n2. Другая песня\n...",
  inputHelp: "Введите 90 треков, по одному на строку.",
  trackCount: "Треков:",
  invalidInput: "Неверный ввод",
  
  // Settings
  settingsTitle: "Настройки",
  ticketCount: "Количество билетов",
  ticketTitle: "Заголовок билета",
  fontSize: "Размер шрифта",
  showTrackNumbers: "Показывать номера треков",
  
  // Generate button
  generateTickets: "Сгенерировать билеты",
  generating: "Генерация...",
  
  // Ticket preview
  previewTitle: "Превью",
  noTickets: "Билеты ещё не сгенерированы. Введите треки и нажмите Сгенерировать.",
  
  // Export
  exportPDF: "Скачать PDF",
  exporting: "Экспорт...",
  loadingFont: "Загрузка шрифта...",
  
  // Missed tracks
  missedTracksTitle: "Пропущенные треки",
  allTracksCovered: "Все треки покрыты!",
  
  // Default ticket title
  defaultTicketTitle: "♪ ПОЙ-ЛОТО",
  
  // Validation messages
  validTracksCount: "треков введено",
  needMoreTracks: "Нужно 90 треков",
  tooManyTracks: "Максимум 90 треков",
  
  // Ticket validation
  validationAllValid: "Все билеты валидны",
  validationErrorsFound: "Обнаружены ошибки в билетах",
  validationPassedCount: "из {total} билетов прошли проверку",
  validationWithErrors: "с ошибками",
  validationRowError: "строка {row}: {count} вместо 5",
  validationDuplicates: "Дублирующиеся треки",
  validationTooManyColumns: "Слишком много полных колонок: {count} (макс. 1)",
  validationCriteria1: "✓ В каждой строке ровно 5 заполненных ячеек",
  validationCriteria2: "✓ Нет дублирующихся треков в билетах",
  validationCriteria3: "✓ Не более 1 полностью заполненной колонки на билет"
};

export const translations: Record<Language, Translations> = { en, ru };

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = "sing-loto-language";

/**
 * Detects browser/system language
 * Returns "ru" if Russian, otherwise "en"
 */
function detectBrowserLanguage(): Language {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "en";
  }
  
  // Check navigator.language and navigator.languages
  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]);
  
  if (browserLang) {
    // Check if language starts with "ru" (e.g., "ru", "ru-RU", "ru-UA")
    if (browserLang.toLowerCase().startsWith("ru")) {
      return "ru";
    }
  }
  
  return "en"; // Default to English for all other languages
}

/**
 * Gets saved language from localStorage
 * If no saved preference, detects browser language
 */
export function getSavedLanguage(): Language {
  if (typeof window === "undefined") return "en";
  
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  
  // If user has previously saved a preference, use it
  if (saved === "ru" || saved === "en") {
    return saved;
  }
  
  // First visit: detect browser language
  const detected = detectBrowserLanguage();
  
  // Save detected language so we don't re-detect next time
  localStorage.setItem(LANGUAGE_STORAGE_KEY, detected);
  
  return detected;
}

export function saveLanguage(lang: Language): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}
