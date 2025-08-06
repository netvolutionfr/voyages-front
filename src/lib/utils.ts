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
