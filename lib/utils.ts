import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function addEllipsis(str: string, startChars = 6, endChars = 4) {
  return str.substring(0, startChars) + '...' + str.substring(str.length - endChars);
}