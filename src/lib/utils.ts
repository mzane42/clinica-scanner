import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function vibrate(pattern: number | number[] = 200) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function formatTime(timestamp: string): string {
  try {
    // Handle French format "19/01/2026 à 14:30:45"
    if (timestamp.includes('à')) {
      const timePart = timestamp.split('à')[1]?.trim();
      if (timePart) {
        return timePart.substring(0, 5); // Return HH:MM
      }
    }

    // Handle ISO format
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return timestamp;
  } catch {
    return timestamp;
  }
}
