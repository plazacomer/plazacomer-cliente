import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function fmtCOP(n: number): string {
	return '$' + (n ?? 0).toLocaleString('es-CO');
}
