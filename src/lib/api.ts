import { authStore } from '#lib/stores/auth.svelte.js';

/**
 * El backend (docs/API.md en plazacomer-cloudflare) habla snake_case porque así son
 * los structs de Rust y el schema de D1 -- cero traducción de ese lado. El resto de
 * este cliente es camelCase (es lo idiomático en TS/Svelte). Este archivo es el único
 * punto donde se cruza esa frontera, para no ensuciar el resto del código con casing
 * mixto.
 */

function snakeToCamel(key: string): string {
	return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function camelToSnake(key: string): string {
	return key.replace(/([A-Z])/g, (_, c: string) => `_${c.toLowerCase()}`);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function toCamelCase<T = unknown>(value: unknown): T {
	if (Array.isArray(value)) return value.map((v) => toCamelCase(v)) as T;
	if (isPlainObject(value)) {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) out[snakeToCamel(k)] = toCamelCase(v);
		return out as T;
	}
	return value as T;
}

export function toSnakeCase<T = unknown>(value: unknown): T {
	if (Array.isArray(value)) return value.map((v) => toSnakeCase(v)) as T;
	if (isPlainObject(value)) {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value)) out[camelToSnake(k)] = toSnakeCase(v);
		return out as T;
	}
	return value as T;
}

/** Coincide con `{ error: { code, message } }` de docs/API.md §0. */
export class ApiError extends Error {
	code: string;
	status: number;
	constructor(code: string, message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.status = status;
	}
}

type ApiFetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	/** Por default se manda el token de Firebase si hay sesión. false para rutas públicas. */
	auth?: boolean;
};

/**
 * Wrapper único para hablar con los workers de plazacomer-cloudflare: adjunta el token
 * de Firebase, convierte el body a snake_case antes de mandarlo, convierte la respuesta
 * a camelCase, y lanza ApiError si la respuesta trae el envoltorio de error.
 */
export async function apiFetch<T = unknown>(
	baseUrl: string,
	path: string,
	options: ApiFetchOptions = {}
): Promise<T> {
	const { method = 'GET', body, auth = true } = options;

	const headers: Record<string, string> = {};
	if (body !== undefined) headers['Content-Type'] = 'application/json';
	if (auth && authStore.user) {
		headers['Authorization'] = `Bearer ${await authStore.user.getIdToken()}`;
	}

	const res = await fetch(`${baseUrl}${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined
	});

	if (res.status === 204) return undefined as T;

	const raw: unknown = await res.json().catch(() => null);

	if (!res.ok) {
		const err = isPlainObject(raw)
			? (raw.error as { code?: string; message?: string } | undefined)
			: undefined;
		throw new ApiError(
			err?.code ?? 'INTERNAL_ERROR',
			err?.message ?? 'Error inesperado',
			res.status
		);
	}

	return toCamelCase<T>(raw);
}
