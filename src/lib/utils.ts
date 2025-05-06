import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string em um slug (URL-friendly)
 * Ex: "Minha Organização" -> "minha-organizacao"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')                // Normaliza acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '')        // Remove caracteres não-alfanuméricos
    .replace(/--+/g, '-')           // Substitui múltiplos hífens por um único
    .replace(/^-+/, '')             // Remove hífens do início
    .replace(/-+$/, '')             // Remove hífens do final
}
