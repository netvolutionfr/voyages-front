import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertDateToString(date: string) {
  // Convertit une date en une chaine DD/MM/YYYY
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function convertDateToISO(dateStr: string): string {
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month}-${day}` // format ISO compatible avec LocalDate
}

export function formatCurrencyFromCents(cents: number, locale = 'fr-FR', currency = 'EUR'): string {
  const euros = cents / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(euros);
}

export function parseCurrencyToCents(value: string): number | null {
  // Supprime les espaces, les symboles monétaires et les virgules
  const cleanedValue = value.replace(/[^\d.-]/g, '').replace(',', '.');
  const floatValue = parseFloat(cleanedValue);
  if (isNaN(floatValue)) {
    return null;
  }
  return Math.round(floatValue * 100);
}

export function getCoverUrl(coverPhotoUrl?: string | null): string | undefined {
    if (!coverPhotoUrl) return undefined;
    if (/^https?:\/\//i.test(coverPhotoUrl)) return coverPhotoUrl;
    const base = import.meta.env.VITE_FILES_BASE || "";
    const sep = base.endsWith("/") ? "" : "/";
    return `${base}${sep}${coverPhotoUrl}`;
}