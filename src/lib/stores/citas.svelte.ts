import { browser } from '$app/environment';
import type { Servicio, Store } from '$lib/data/mock';

export type EstadoCita =
	| 'pendiente'
	| 'confirmada'
	| 'completada'
	| 'cancelada'
	| 'solicitada'
	| 'cotizada'
	| 'aceptada'
	| 'cerrada'
	| 'atendida';

export type Cita = {
	id: string;
	tiendaId: string;
	servicioId: string;
	servicioNombre: string;
	tipo: 'cita' | 'cotizacion' | 'consulta';
	cta: string;
	estado: EstadoCita;
	fecha: string | null;
	hora: string | null;
	cliente: { nombre: string; telefono: string; email: string };
	datos: Record<string, unknown>;
	precio: number | null;
	propio?: boolean;
	createdAt: number;
};

export const ESTADOS_CITA: Record<
	EstadoCita,
	{ label: string; color: string; icon: string; grupo: string }
> = {
	pendiente: { label: 'Por confirmar', color: '#EA580C', icon: 'clock', grupo: 'activa' },
	confirmada: { label: 'Confirmada', color: '#16A34A', icon: 'check', grupo: 'activa' },
	completada: { label: 'Completada', color: '#2563EB', icon: 'check', grupo: 'cerrada' },
	cancelada: { label: 'Cancelada', color: '#DC2626', icon: 'close', grupo: 'cerrada' },
	solicitada: { label: 'Solicitud nueva', color: '#7C3AED', icon: 'sparkle', grupo: 'activa' },
	cotizada: { label: 'Cotización enviada', color: '#0EA5E9', icon: 'receipt', grupo: 'activa' },
	aceptada: { label: 'Aceptada', color: '#16A34A', icon: 'check', grupo: 'cerrada' },
	cerrada: { label: 'Cerrada', color: '#6B7280', icon: 'check', grupo: 'cerrada' },
	atendida: { label: 'Atendida', color: '#16A34A', icon: 'check', grupo: 'cerrada' }
};

function isoForOffset(days: number): string {
	return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

export function fmtFechaCita(iso: string | null): string {
	if (!iso) return 'Sin fecha';
	const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
	const meses = [
		'ene',
		'feb',
		'mar',
		'abr',
		'may',
		'jun',
		'jul',
		'ago',
		'sep',
		'oct',
		'nov',
		'dic'
	];
	// Fechas temporales de una función de formato pura, no estado reactivo.
	/* eslint-disable svelte/prefer-svelte-reactivity */
	const d = new Date(iso + 'T00:00:00');
	const hoy = new Date();
	/* eslint-enable svelte/prefer-svelte-reactivity */
	hoy.setHours(0, 0, 0, 0);
	const diff = Math.round((d.getTime() - hoy.getTime()) / 86400000);
	if (diff === 0) return 'Hoy';
	if (diff === 1) return 'Mañana';
	if (diff === -1) return 'Ayer';
	return `${dias[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
}

const CITAS_KEY = 'pc_citas_v1';

function seedCitas(): Cita[] {
	const now = Date.now();
	return [
		{
			id: 'c-seed-1',
			tiendaId: 't9',
			servicioId: 's2',
			servicioNombre: 'Profilaxis + control de placa',
			tipo: 'cita',
			cta: 'agendar',
			estado: 'confirmada',
			fecha: isoForOffset(1),
			hora: '9:30 am',
			cliente: {
				nombre: 'Andrés Gómez',
				telefono: '+57 311 555 0142',
				email: 'andres.g@correo.co'
			},
			datos: { profesional: 'Dra. María Camila Hoyos' },
			precio: 95000,
			propio: true,
			createdAt: now - 86400000
		},
		{
			id: 'c-seed-2',
			tiendaId: 't9',
			servicioId: 's3',
			servicioNombre: 'Blanqueamiento dental LED',
			tipo: 'cita',
			cta: 'agendar',
			estado: 'pendiente',
			fecha: isoForOffset(2),
			hora: '3:30 pm',
			cliente: {
				nombre: 'Valentina Ruiz',
				telefono: '+57 320 555 0188',
				email: 'valeruiz@correo.co'
			},
			datos: {},
			precio: 480000,
			propio: true,
			createdAt: now - 3600000 * 5
		},
		{
			id: 'c-seed-3',
			tiendaId: 't10',
			servicioId: 's10',
			servicioNombre: 'Primera sesión gratuita',
			tipo: 'cita',
			cta: 'agendar',
			estado: 'pendiente',
			fecha: isoForOffset(0),
			hora: '6:30 pm',
			cliente: { nombre: 'Daniela Pérez', telefono: '+57 315 555 0177', email: 'danip@correo.co' },
			datos: { modalidad: 'video' },
			precio: 0,
			propio: true,
			createdAt: now - 3600000 * 2
		},
		{
			id: 'c-seed-4',
			tiendaId: 't11',
			servicioId: 's21',
			servicioNombre: 'Paquete Completo',
			tipo: 'cotizacion',
			cta: 'cotizar',
			estado: 'solicitada',
			fecha: isoForOffset(5),
			hora: null,
			cliente: {
				nombre: 'Carolina Díaz',
				telefono: '+57 304 555 0166',
				email: 'caro.diaz@correo.co'
			},
			datos: { origen: 'El Poblado', destino: 'Laureles' },
			precio: null,
			propio: true,
			createdAt: now - 3600000 * 3
		},
		{
			id: 'c-seed-5',
			tiendaId: 't12',
			servicioId: 's30',
			servicioNombre: 'Seguro Todo Riesgo Auto',
			tipo: 'cotizacion',
			cta: 'cotizar',
			estado: 'cotizada',
			fecha: null,
			hora: null,
			cliente: {
				nombre: 'Marcela Tovar',
				telefono: '+57 301 555 0144',
				email: 'm.tovar@correo.co'
			},
			datos: { vehiculo: 'Mazda CX-30 2023' },
			precio: null,
			propio: true,
			createdAt: now - 3600000 * 6
		},
		{
			id: 'c-seed-6',
			tiendaId: 't9',
			servicioId: 's5',
			servicioNombre: 'Implante dental unitario',
			tipo: 'cita',
			cta: 'agendar',
			estado: 'completada',
			fecha: isoForOffset(-3),
			hora: '11:00 am',
			cliente: { nombre: 'Jorge Mejía', telefono: '+57 300 555 0111', email: 'jmejia@correo.co' },
			datos: {},
			precio: 3200000,
			propio: true,
			createdAt: now - 86400000 * 5
		}
	];
}

function readCitas(): Cita[] {
	if (!browser) return seedCitas();
	try {
		const raw = localStorage.getItem(CITAS_KEY);
		if (raw) return JSON.parse(raw);
	} catch {
		/* */
	}
	const seed = seedCitas();
	localStorage.setItem(CITAS_KEY, JSON.stringify(seed));
	return seed;
}

function createCitasStore() {
	let items = $state<Cita[]>(readCitas());

	function persist() {
		if (browser) localStorage.setItem(CITAS_KEY, JSON.stringify(items));
	}

	return {
		get items() {
			return items;
		},
		get proximas() {
			const hoy = new Date().toISOString().slice(0, 10);
			return items.filter(
				(c) =>
					(c.fecha ?? '') >= hoy &&
					['pendiente', 'confirmada', 'solicitada', 'cotizada'].includes(c.estado)
			);
		},
		get historial() {
			const hoy = new Date().toISOString().slice(0, 10);
			return items.filter(
				(c) =>
					!c.fecha ||
					c.fecha < hoy ||
					['completada', 'cancelada', 'aceptada', 'cerrada', 'atendida'].includes(c.estado)
			);
		},
		add(payload: {
			servicio: Servicio;
			tienda: Store;
			datos: Record<string, unknown>;
			cta: string;
		}) {
			const tipo =
				payload.cta === 'agendar' ? 'cita' : payload.cta === 'cotizar' ? 'cotizacion' : 'consulta';
			const estado: EstadoCita = tipo === 'cita' ? 'pendiente' : 'solicitada';
			const cita: Cita = {
				id: 'c-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
				tiendaId: payload.tienda.id,
				servicioId: payload.servicio.id,
				servicioNombre: payload.servicio.nombre,
				tipo,
				cta: payload.cta,
				estado,
				fecha: (payload.datos.fecha as string) ?? (payload.datos.fechaTentativa as string) ?? null,
				hora: (payload.datos.hora as string) ?? null,
				cliente: {
					nombre: (payload.datos.nombre as string) ?? 'Cliente',
					telefono: (payload.datos.telefono as string) ?? '',
					email: (payload.datos.email as string) ?? ''
				},
				datos: payload.datos,
				precio: payload.servicio.precio,
				propio: true,
				createdAt: Date.now()
			};
			items = [cita, ...items];
			persist();
			return cita;
		},
		cancel(id: string) {
			items = items.map((c) => (c.id === id ? { ...c, estado: 'cancelada' as EstadoCita } : c));
			persist();
		},
		update(id: string, patch: Partial<Cita>) {
			items = items.map((c) => (c.id === id ? { ...c, ...patch } : c));
			persist();
		}
	};
}

export const citas = createCitasStore();
