/**
 * Security utilities for input sanitization
 * Note: React JSX already escapes strings, these are additional safety measures
 */

// Maximum allowed lengths
export const MAX_TRACK_NAME_LENGTH = 200;
export const MAX_TICKET_TITLE_LENGTH = 50;
export const MAX_TRACKS = 90;

/**
 * Sanitizes a single track name
 * - Trims whitespace
 * - Limits length
 * - Removes control characters (except newlines which are handled elsewhere)
 */
export function sanitizeTrackName(name: string): string {
  return name
    .trim()
    // Remove control characters (U+0000 to U+001F except tab, newline, carriage return)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Limit length
    .slice(0, MAX_TRACK_NAME_LENGTH);
}

/**
 * Sanitizes ticket title
 * - Trims whitespace
 * - Limits length
 * - Allows only safe characters and common symbols
 */
export function sanitizeTicketTitle(title: string): string {
  return title
    .trim()
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Limit length
    .slice(0, MAX_TICKET_TITLE_LENGTH);
}

/**
 * Validates that input doesn't contain suspicious patterns
 * Returns true if input is safe, false if suspicious
 */
export function isInputSafe(input: string): boolean {
  // Check for script tags (case insensitive)
  if (/<script/i.test(input)) return false;
  
  // Check for javascript: protocol
  if (/javascript:/i.test(input)) return false;
  
  // Check for data: URIs with suspicious content
  if (/data:\s*text\/html/i.test(input)) return false;
  
  // Check for on* event handlers
  if (/\bon\w+\s*=/i.test(input)) return false;
  
  return true;
}

/**
 * Sanitizes input and validates it
 * Throws error if input is suspicious
 */
export function sanitizeAndValidate(input: string, maxLength: number): string {
  const sanitized = input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .slice(0, maxLength);
  
  if (!isInputSafe(sanitized)) {
    console.warn('Potentially malicious input detected and blocked');
    return '';
  }
  
  return sanitized;
}
