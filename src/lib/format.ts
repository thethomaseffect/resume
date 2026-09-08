import type { Copy, Language, Place, UiCopy } from './types';

export function pick(value: Copy, language: Language): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.en || '';
}

export function mailtoHref(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

export function formatRange(start: string, end: string | null | undefined, presentLabel: string, language: Language = 'en'): string {
  const startLabel = formatMonth(start, language);
  const endLabel = end ? formatMonth(end, language) : presentLabel;
  return `${startLabel} – ${endLabel}`;
}

export function yearMonthOf(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthsBetween(start: string, endInclusive: string): number {
  if (!start || !endInclusive) return 0;
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = endInclusive.split('-').map(Number);
  return Math.max(0, (ey - sy) * 12 + (em - sm));
}

export function formatDuration(months: number, language: Language): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (language === 'sv') {
    if (years && rest) return `${years} år ${rest} mån`;
    if (years) return years === 1 ? '1 år' : `${years} år`;
    if (rest === 1) return '1 mån';
    return `${rest} mån`;
  }
  if (years && rest) return `${years} yr ${rest} mo`;
  if (years) return years === 1 ? '1 year' : `${years} years`;
  if (rest === 1) return '1 month';
  return `${months} months`;
}

export function formatLivedMeta(place: Place, language: Language, ui: UiCopy, now = new Date()): string {
  const parts: string[] = [];
  if (place.current) parts.push(ui.currentCity);
  if (place.start) {
    parts.push(formatRange(place.start, place.end, ui.present, language));
  } else if (place.end) {
    parts.push(`${ui.until || (language === 'sv' ? 'till' : 'until')} ${formatMonth(place.end, language)}`);
  }
  if (!place.end && place.start) {
    parts.push(formatDuration(monthsBetween(place.start, yearMonthOf(now)), language));
  } else if (place.duration) {
    parts.push(pick(place.duration, language));
  }
  return parts.join(' · ');
}

export function formatMonth(yearMonth: string | null | undefined, language: Language = 'en'): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  const locale = language === 'sv' ? 'sv-SE' : 'en-GB';
  return date.toLocaleString(locale, { month: 'short', year: 'numeric' });
}
