export type Category = {
	label: string;
	emoji: string;
	color: string;
	slug: string;
};

export type RatingSummary = {
	average: number;
	total: number;
	distribution: Record<number, number>;
};

export const CATEGORIES: Record<string, Category> = {
	food:     { label: 'Comida',      emoji: '🍔', color: '#EA580C', slug: 'food' },
	fashion:  { label: 'Moda',        emoji: '👗', color: '#7C3AED', slug: 'fashion' },
	tech:     { label: 'Tecnología',  emoji: '💻', color: '#2563EB', slug: 'tech' },
	market:   { label: 'Mercado',     emoji: '🛒', color: '#16A34A', slug: 'market' },
	services: { label: 'Servicios',   emoji: '⚡', color: '#F59E0B', slug: 'services' },
	crafts:   { label: 'Artesanías',  emoji: '🎨', color: '#DC2626', slug: 'crafts' },
	beauty:   { label: 'Belleza',     emoji: '💄', color: '#EC4899', slug: 'beauty' },
};

export type StoreLandingData = {
	tagline?: string;
	eyebrow?: string;
	heroLabel?: string;
	stats?: Array<{ valor: string; label: string }>;
	ctaPrincipal?: { tipo: string; texto: string; telefono?: string };
	ctaSecundaria?: { tipo: string; texto: string; telefono?: string };
	pillars?: Array<{ icon: string; titulo: string; desc: string }>;
	proceso?: Array<{ paso: string; titulo: string; desc: string }>;
	equipo?: Array<{ nombre: string; rol: string; exp: string; avatar: string; iniciales: string }>;
	convenios?: Array<{ nombre: string; color: string }>;
	aliados?: Array<{ nombre: string; color: string }>;
	modalidades?: Array<{ icon: string; titulo: string; desc: string }>;
	paquetes?: Array<{ nombre: string; color: string; incluido: string[] }>;
	flota?: Array<{ tipo: string; capacidad: string; uso: string }>;
	cobertura?: string[];
	ramos?: Array<{ id: string; icon: string; titulo: string; desc: string; desde: number }>;
	galeria?: Array<{ label: string; tono: string }>;
	faqs?: Array<{ q: string; a: string }>;
};

export type Store = {
	id: string;
	slug: string;
	name: string;
	category: string;
	kind?: 'product' | 'service';
	subtype?: 'dental' | 'psicologia' | 'mudanzas' | 'seguros';
	emoji: string;
	logoColor: string;
	bannerGradient: string;
	description: string;
	hours: string;
	paymentMethods: string[];
	followers: number;
	rating: number;
	following: boolean;
	location: string;
	status?: string;
	ratingSummary?: RatingSummary;
	landing?: StoreLandingData;
};

export const STORES: Store[] = [
	{
		id: 't1', slug: 'sabor-casero', name: 'El Sabor Casero',
		category: 'food', emoji: '🍲', logoColor: '#EA580C',
		bannerGradient: 'linear-gradient(135deg, #FB923C, #EA580C 60%, #9A3412)',
		description: 'Comida casera colombiana hecha con amor. Entregas en 30–45 min.',
		hours: 'Lun–Sáb · 11:00 am – 9:00 pm',
		paymentMethods: ['ePayco', 'Enlace de pago'],
		followers: 2840, rating: 4.8, following: true,
		location: 'Plaza Central · Local 14',
		ratingSummary: { average: 4.8, total: 384, distribution: { 5: 280, 4: 70, 3: 24, 2: 7, 1: 3 } },
	},
	{
		id: 't2', slug: 'mercafresh', name: 'MercaFresh',
		category: 'market', emoji: '🥑', logoColor: '#16A34A',
		bannerGradient: 'linear-gradient(135deg, #86EFAC, #16A34A 55%, #14532D)',
		description: 'Frutas, verduras y abarrotes frescos del día, directo del campo.',
		hours: 'Todos los días · 6:00 am – 10:00 pm',
		paymentMethods: ['PayU', 'ePayco', 'Efectivo contra entrega'],
		followers: 5230, rating: 4.9, following: true,
		location: 'Plaza Central · Local 2',
	},
	{
		id: 't3', slug: 'atelier-monarca', name: 'Atelier Monarca',
		category: 'fashion', emoji: '🦋', logoColor: '#7C3AED',
		bannerGradient: 'linear-gradient(135deg, #C4B5FD, #7C3AED 55%, #4C1D95)',
		description: 'Moda urbana diseñada y confeccionada en Medellín.',
		hours: 'Lun–Sáb · 10:00 am – 7:00 pm',
		paymentMethods: ['Wompi', 'PayU'],
		followers: 1890, rating: 4.7, following: false,
		location: 'Plaza Central · Local 8',
	},
	{
		id: 't4', slug: 'techzone', name: 'TechZone',
		category: 'tech', emoji: '🖥️', logoColor: '#2563EB',
		bannerGradient: 'linear-gradient(135deg, #93C5FD, #2563EB 55%, #1E3A8A)',
		description: 'Accesorios, gadgets y reparación de equipos al mejor precio.',
		hours: 'Lun–Sáb · 9:00 am – 6:00 pm',
		paymentMethods: ['PayU', 'Efectivo'],
		followers: 3120, rating: 4.6, following: true,
		location: 'Plaza Central · Local 21',
	},
	{
		id: 't5', slug: 'bella-piel', name: 'Bella Piel',
		category: 'beauty', emoji: '✨', logoColor: '#EC4899',
		bannerGradient: 'linear-gradient(135deg, #FBCFE8, #EC4899 55%, #9D174D)',
		description: 'Cosméticos naturales, cuidado facial y corporal premium.',
		hours: 'Lun–Sáb · 9:00 am – 7:00 pm',
		paymentMethods: ['Wompi', 'ePayco'],
		followers: 4100, rating: 4.9, following: false,
		location: 'Plaza Central · Local 5',
	},
	{
		id: 't6', slug: 'artesanias-taino', name: 'Artesanías Taíno',
		category: 'crafts', emoji: '🏺', logoColor: '#DC2626',
		bannerGradient: 'linear-gradient(135deg, #FCA5A5, #DC2626 55%, #7F1D1D)',
		description: 'Piezas únicas hechas a mano por artesanos colombianos.',
		hours: 'Mar–Dom · 10:00 am – 6:00 pm',
		paymentMethods: ['Nequi', 'Efectivo'],
		followers: 980, rating: 5.0, following: false,
		location: 'Plaza Central · Local 33',
		status: 'closed',
	},
	{
		id: 't7', slug: 'voltio-express', name: 'Voltio Express',
		category: 'services', emoji: '⚡', logoColor: '#F59E0B',
		bannerGradient: 'linear-gradient(135deg, #FDE68A, #F59E0B 55%, #92400E)',
		description: 'Electricidad, plomería y servicios del hogar a domicilio.',
		hours: 'Lun–Dom · 7:00 am – 8:00 pm',
		paymentMethods: ['Efectivo', 'Nequi'],
		followers: 1560, rating: 4.5, following: true,
		location: 'Plaza Central · Local 40',
	},
	{
		id: 't8', slug: 'pizza-pazza', name: 'Pizza Pazza',
		category: 'food', emoji: '🍕', logoColor: '#EA580C',
		bannerGradient: 'linear-gradient(135deg, #FED7AA, #EA580C 55%, #7C2D12)',
		description: 'Pizzas artesanales al horno de leña con ingredientes italianos.',
		hours: 'Mar–Dom · 12:00 pm – 10:00 pm',
		paymentMethods: ['PayU', 'Efectivo'],
		followers: 3870, rating: 4.8, following: false,
		location: 'Plaza Central · Local 19',
		ratingSummary: { average: 4.8, total: 521, distribution: { 5: 390, 4: 95, 3: 26, 2: 7, 1: 3 } },
	},
	// ── Tiendas de servicio ──────────────────────────────────────
	{
		id: 't9', slug: 'clinica-sonrisa-mayor', name: 'Clínica Sonrisa Mayor',
		category: 'services', kind: 'service', subtype: 'dental',
		emoji: '🦷', logoColor: '#0EA5E9',
		bannerGradient: 'linear-gradient(135deg, #BAE6FD, #0EA5E9 55%, #0C4A6E)',
		description: 'Odontología integral y estética en El Poblado. Atendemos toda la familia.',
		hours: 'Lun–Sáb · 7:00 am – 7:00 pm',
		paymentMethods: ['ePayco', 'PayU', 'Transferencia', 'Datafono en sede'],
		followers: 1820, rating: 4.9, following: false,
		location: 'Cra 43A #18-95 · El Poblado · Medellín',
		landing: {
			tagline: 'Sonrisas que duran toda la vida',
			eyebrow: 'Odontología integral',
			heroLabel: 'Sede El Poblado · 4 unidades odontológicas',
			stats: [
				{ valor: '18+', label: 'años de experiencia' },
				{ valor: '12.4k', label: 'pacientes atendidos' },
				{ valor: '4.9', label: 'calificación promedio' },
				{ valor: '4', label: 'odontólogos especialistas' },
			],
			ctaPrincipal: { tipo: 'agendar', texto: 'Agendar valoración' },
			ctaSecundaria: { tipo: 'llamar', texto: 'Llamar a la clínica', telefono: '+57 4 444 9182' },
			pillars: [
				{ icon: 'shield', titulo: 'Bioseguridad nivel hospitalario', desc: 'Esterilización clase B y protocolos auditados.' },
				{ icon: 'sparkle', titulo: 'Tecnología digital', desc: 'Radiografía panorámica 3D y escáner intraoral.' },
				{ icon: 'heart', titulo: 'Trato sin miedo', desc: 'Sedación consciente disponible para todos los procedimientos.' },
			],
			proceso: [
				{ paso: '1', titulo: 'Valoración inicial', desc: 'Diagnóstico, radiografía y plan de tratamiento. 45 min.' },
				{ paso: '2', titulo: 'Plan personalizado', desc: 'Cotización clara, opciones de pago y financiación a 6/12 meses.' },
				{ paso: '3', titulo: 'Tratamiento', desc: 'Sesiones programadas a tu ritmo, con seguimiento por WhatsApp.' },
				{ paso: '4', titulo: 'Control y garantía', desc: 'Revisiones gratuitas durante 6 meses y garantía sobre el trabajo.' },
			],
			equipo: [
				{ nombre: 'Dra. María Camila Hoyos', rol: 'Odontóloga general · Especialista en estética', exp: '12 años', avatar: '#0EA5E9', iniciales: 'MH' },
				{ nombre: 'Dr. Andrés Felipe Rúa', rol: 'Endodoncista', exp: '9 años', avatar: '#7C3AED', iniciales: 'AR' },
				{ nombre: 'Dra. Laura Restrepo', rol: 'Ortodoncista · Invisalign certificada', exp: '15 años', avatar: '#EC4899', iniciales: 'LR' },
				{ nombre: 'Dr. Sebastián Marín', rol: 'Cirujano oral · Implantología', exp: '11 años', avatar: '#16A34A', iniciales: 'SM' },
			],
			convenios: [
				{ nombre: 'Sura', color: '#0033A0' },
				{ nombre: 'Colsanitas', color: '#E20613' },
				{ nombre: 'Coomeva', color: '#76BC21' },
				{ nombre: 'Compensar', color: '#005CAB' },
				{ nombre: 'Bolívar', color: '#FFD200' },
				{ nombre: 'Sanitas', color: '#1B3680' },
			],
			galeria: [
				{ label: 'Sala de espera · luz natural', tono: '#E0F2FE' },
				{ label: 'Unidad de ortodoncia', tono: '#FEF3C7' },
				{ label: 'Antes / después · blanqueamiento', tono: '#FCE7F3' },
				{ label: 'Antes / después · resinas', tono: '#DCFCE7' },
				{ label: 'Equipo de esterilización', tono: '#E0E7FF' },
				{ label: 'Sonrisas reales · pacientes', tono: '#FFE4E6' },
			],
			faqs: [
				{ q: '¿Atienden urgencias odontológicas?', a: 'Sí. Tenemos línea directa 24/7 para pacientes activos y atendemos urgencias el mismo día en horario de clínica.' },
				{ q: '¿Cuánto cuesta una valoración?', a: 'La primera valoración con diagnóstico y radiografía panorámica cuesta $45.000. Si decides iniciar tratamiento se descuenta del primer pago.' },
				{ q: '¿Manejan financiación?', a: 'Sí, financiación interna sin intereses a 3 meses y planes a 6/12/18 meses con Tuya, Sufi y Sistecrédito.' },
				{ q: '¿Atienden niños?', a: 'Sí, desde los 2 años. La Dra. Laura tiene formación en odontopediatría.' },
			],
		},
	},
	{
		id: 't10', slug: 'tejido-terapia', name: 'Tejido · Centro de Psicología',
		category: 'services', kind: 'service', subtype: 'psicologia',
		emoji: '🌿', logoColor: '#8B5CF6',
		bannerGradient: 'linear-gradient(135deg, #DDD6FE, #8B5CF6 55%, #4C1D95)',
		description: 'Terapia presencial y online. Un espacio para escucharte sin juicios.',
		hours: 'Lun–Sáb · 8:00 am – 9:00 pm',
		paymentMethods: ['ePayco', 'PSE', 'Transferencia', 'Tarjeta'],
		followers: 960, rating: 4.9, following: false,
		location: 'Cl 10 #36-28 · Manila · Medellín · Online a toda Colombia',
		landing: {
			tagline: 'Un espacio para escucharte, sin juicios',
			eyebrow: 'Salud mental · Terapia individual, pareja, familia',
			heroLabel: 'Atención presencial y videollamada · Primera sesión gratuita',
			stats: [
				{ valor: '1.200+', label: 'procesos acompañados' },
				{ valor: '50 min', label: 'duración por sesión' },
				{ valor: '3', label: 'psicólogas con maestría' },
				{ valor: '24 h', label: 'tiempo máximo de respuesta' },
			],
			ctaPrincipal: { tipo: 'agendar', texto: 'Reservar primera sesión gratis' },
			ctaSecundaria: { tipo: 'mensaje', texto: 'Hacer una pregunta antes' },
			pillars: [
				{ icon: 'shield', titulo: 'Confidencialidad total', desc: 'Todo lo que se habla en sesión se queda en sesión. Profesionales colegiadas.' },
				{ icon: 'heart', titulo: 'Sin diagnósticos apresurados', desc: 'Trabajamos con enfoque humanista, cognitivo-conductual y sistémico.' },
				{ icon: 'clock', titulo: 'A tu ritmo', desc: 'Sesiones semanales o quincenales. Tú decides la frecuencia.' },
			],
			proceso: [
				{ paso: '1', titulo: 'Cuéntanos qué te trae aquí', desc: 'Un formulario breve (2 min) para entender tu situación y emparejarte con la psicóloga adecuada.' },
				{ paso: '2', titulo: 'Primera sesión gratuita', desc: 'Encuentro de 30 min para conocernos. Sin compromiso de continuar.' },
				{ paso: '3', titulo: 'Plan personalizado', desc: 'Acordamos frecuencia, objetivos y duración estimada del proceso.' },
				{ paso: '4', titulo: 'Acompañamiento continuo', desc: 'Sesiones presenciales o por video + chat de apoyo entre semanas.' },
			],
			equipo: [
				{ nombre: 'Mariana Quintero', rol: 'Adultos · Ansiedad, duelo, autoestima', exp: 'Maestría · 8 años', avatar: '#8B5CF6', iniciales: 'MQ' },
				{ nombre: 'Daniela Echeverri', rol: 'Pareja y familia · Terapia sistémica', exp: 'Maestría · 11 años', avatar: '#EC4899', iniciales: 'DE' },
				{ nombre: 'Felipe Cárdenas', rol: 'Niños y adolescentes · Juego terapéutico', exp: 'Especialización · 6 años', avatar: '#0EA5E9', iniciales: 'FC' },
			],
			galeria: [
				{ label: 'Consultorio principal · luz cálida', tono: '#F3E8FF' },
				{ label: 'Sala de espera con plantas', tono: '#DCFCE7' },
				{ label: 'Setup para videollamada', tono: '#E0E7FF' },
			],
			faqs: [
				{ q: '¿Es realmente gratis la primera sesión?', a: 'Sí, sin trampa. Son 30 minutos para conocernos. Si decides no continuar, no hay ningún cobro.' },
				{ q: '¿Cuánto cuesta cada sesión?', a: 'Sesión individual $130.000 · Pareja $160.000 · Niños $120.000. Paquetes de 4 sesiones con 10% de descuento.' },
				{ q: '¿Atienden EPS o aseguradoras?', a: 'No directamente, pero entregamos factura para que reclames el reembolso si tu póliza lo cubre.' },
				{ q: '¿Qué pasa si necesito cancelar?', a: 'Puedes cancelar o reagendar hasta 12 horas antes sin costo. Después se cobra el 50%.' },
				{ q: '¿Recetan medicamentos?', a: 'No. Somos psicólogas, no psiquiatras. Si lo necesitas, te referimos a profesionales aliados.' },
			],
		},
	},
	{
		id: 't11', slug: 'mudanzas-norte', name: 'Mudanzas del Norte',
		category: 'services', kind: 'service', subtype: 'mudanzas',
		emoji: '📦', logoColor: '#EA580C',
		bannerGradient: 'linear-gradient(135deg, #FED7AA, #EA580C 55%, #7C2D12)',
		description: 'Trasteos sin estrés. Embalamos, cargamos y montamos. Tú no levantas ni una caja.',
		hours: 'Lun–Dom · 6:00 am – 8:00 pm · Servicio 24h con recargo',
		paymentMethods: ['ePayco', 'PayU', 'Transferencia', 'Efectivo contra entrega'],
		followers: 540, rating: 4.8, following: false,
		location: 'Centro logístico · Bello · Cobertura Antioquia y Eje Cafetero',
		landing: {
			tagline: 'Trasteos sin estrés. Tú no levantas ni una caja.',
			eyebrow: 'Empresa de mudanzas · Embalaje · Bodegaje',
			heroLabel: '8 años · 3.200+ trasteos realizados · 5 camiones propios',
			stats: [
				{ valor: '3.2k', label: 'trasteos completados' },
				{ valor: '4.8', label: 'calificación promedio' },
				{ valor: '0', label: 'objetos perdidos en 2 años' },
				{ valor: '30 min', label: 'visita de cotización' },
			],
			ctaPrincipal: { tipo: 'cotizar', texto: 'Cotizar mi trasteo' },
			ctaSecundaria: { tipo: 'llamar', texto: 'Línea directa', telefono: '+57 304 555 0184' },
			pillars: [
				{ icon: 'shield', titulo: 'Seguro hasta $50M', desc: 'Cada trasteo incluye póliza de responsabilidad civil sobre tus pertenencias.' },
				{ icon: 'box', titulo: 'Embalaje incluido', desc: 'Cajas, papel burbuja, mantas para muebles y cinta industrial. No traes nada.' },
				{ icon: 'check', titulo: 'Equipo capacitado', desc: 'Cuadrilla en uniforme con curso de manejo de carga y montaje de muebles.' },
			],
			proceso: [
				{ paso: '1', titulo: 'Cotiza online o llama', desc: 'Cuéntanos origen, destino y volumen estimado. Te damos un rango en 10 min.' },
				{ paso: '2', titulo: 'Visita técnica gratis', desc: 'Vamos a tu casa para medir exacto y confirmar precio cerrado por escrito.' },
				{ paso: '3', titulo: 'Día del trasteo', desc: 'Llegamos 15 min antes. Embalamos, cargamos, transportamos y montamos.' },
				{ paso: '4', titulo: 'Garantía 30 días', desc: 'Cualquier ajuste, rayón o pieza faltante: lo resolvemos sin discusión.' },
			],
			paquetes: [
				{ nombre: 'Express', color: '#FB923C', incluido: ['Carga y descarga', 'Transporte', 'Hasta 4 horas', 'No incluye embalaje'] },
				{ nombre: 'Completo', color: '#EA580C', incluido: ['Embalaje profesional', 'Carga y transporte', 'Montaje de muebles básico', 'Hasta 8 horas'] },
				{ nombre: 'Premium', color: '#9A3412', incluido: ['Embalaje + desembalaje', 'Transporte', 'Montaje completo', 'Limpieza final', 'Sin límite de horas'] },
			],
			flota: [
				{ tipo: 'Camioneta', capacidad: 'Hasta 8 m³', uso: 'Apartaestudios y oficinas pequeñas' },
				{ tipo: 'Turbo', capacidad: 'Hasta 18 m³', uso: 'Apartamentos 2 hab' },
				{ tipo: 'Camión 350', capacidad: 'Hasta 35 m³', uso: 'Casas y apartamentos grandes' },
			],
			cobertura: ['Medellín · Área Metropolitana', 'Antioquia', 'Pereira · Manizales · Armenia', 'Bogotá (intermunicipal)'],
			galeria: [
				{ label: 'Cuadrilla cargando piano vertical', tono: '#FED7AA' },
				{ label: 'Embalaje de vajilla y cristalería', tono: '#FEF3C7' },
				{ label: 'Camión 350 con rampa hidráulica', tono: '#FFEDD5' },
				{ label: 'Bodega climatizada · storage', tono: '#FCE7F3' },
			],
			faqs: [
				{ q: '¿En cuánto tiempo me dan la cotización?', a: 'Por chat: 10 min con datos básicos. Visita técnica: el mismo día o al día siguiente.' },
				{ q: '¿Qué pasa si algo se rompe?', a: 'Tienes 7 días para reportarlo. Reponemos el valor a precio comercial sin reducciones.' },
				{ q: '¿Puedo solo contratar transporte?', a: 'Sí. El paquete Express es solo transporte, tú embalas.' },
				{ q: '¿Hacen trasteos intermunicipales?', a: 'Sí, dentro y fuera de Antioquia.' },
				{ q: '¿Trabajan domingos y festivos?', a: 'Sí. Hay un recargo del 15% en festivos y del 25% en horario nocturno.' },
			],
		},
	},
	{
		id: 't12', slug: 'portico-seguros', name: 'Pórtico Seguros',
		category: 'services', kind: 'service', subtype: 'seguros',
		emoji: '🛡️', logoColor: '#1E40AF',
		bannerGradient: 'linear-gradient(135deg, #BFDBFE, #1E40AF 55%, #1E3A8A)',
		description: 'Asesoría que te protege. Pólizas sin letra pequeña, con asesor humano.',
		hours: 'Lun–Vie · 8:00 am – 6:00 pm · Sáb · 9:00 am – 1:00 pm',
		paymentMethods: ['Débito a aseguradora', 'PSE', 'Tarjeta de crédito'],
		followers: 720, rating: 4.7, following: false,
		location: 'Cra 25 #1A-31 · Patio Bonito · Medellín · Asesoría virtual a Colombia',
		landing: {
			tagline: 'Asesoría que te protege. Sin letra pequeña.',
			eyebrow: 'Corredor de seguros · 6 aseguradoras aliadas',
			heroLabel: 'Comparamos primas de 6 aseguradoras y te recomendamos · No vendemos por comisión',
			stats: [
				{ valor: '6', label: 'aseguradoras aliadas' },
				{ valor: '14', label: 'años en el mercado' },
				{ valor: '94%', label: 'renovaciones con nosotros' },
				{ valor: '48 h', label: 'tiempo de cotización' },
			],
			ctaPrincipal: { tipo: 'cotizar', texto: 'Cotizar mi póliza' },
			ctaSecundaria: { tipo: 'mensaje', texto: 'Hablar con asesor' },
			pillars: [
				{ icon: 'shield', titulo: 'Independencia real', desc: 'No somos exclusivos de ninguna aseguradora. Recomendamos lo que más te conviene.' },
				{ icon: 'users', titulo: 'Asesor humano dedicado', desc: 'Cada cliente tiene un asesor con nombre y celular directo. Sin call centers.' },
				{ icon: 'check', titulo: 'Acompañamiento en siniestros', desc: 'Si pasa algo, nosotros llamamos a la aseguradora y peleamos por ti.' },
			],
			ramos: [
				{ id: 'auto', icon: '🚗', titulo: 'Auto', desc: 'Todo riesgo, RC, asistencia 24h.', desde: 1200000 },
				{ id: 'vida', icon: '❤️', titulo: 'Vida', desc: 'Vida individual, deudores, exequial.', desde: 480000 },
				{ id: 'salud', icon: '🩺', titulo: 'Salud', desc: 'Medicina prepagada y complementarios.', desde: 1800000 },
				{ id: 'hogar', icon: '🏠', titulo: 'Hogar', desc: 'Incendio, hurto, daños eléctricos.', desde: 360000 },
				{ id: 'pyme', icon: '🏢', titulo: 'Pyme', desc: 'Responsabilidad civil y patrimonial.', desde: 720000 },
				{ id: 'mascota', icon: '🐾', titulo: 'Mascotas', desc: 'Veterinaria, urgencias y RC.', desde: 240000 },
			],
			proceso: [
				{ paso: '1', titulo: 'Cuéntanos qué necesitas', desc: 'Llenas un formulario corto o nos llamas. 5 minutos.' },
				{ paso: '2', titulo: 'Cotizamos con 6 aseguradoras', desc: 'En máximo 48 horas te enviamos comparativo claro con pros y contras.' },
				{ paso: '3', titulo: 'Eliges con asesoría', desc: 'Te explicamos cada opción. Cero presión de compra.' },
				{ paso: '4', titulo: 'Te acompañamos siempre', desc: 'Renovaciones, modificaciones y siniestros: nosotros gestionamos todo.' },
			],
			aliados: [
				{ nombre: 'Sura', color: '#0033A0' },
				{ nombre: 'Bolívar', color: '#FFD200' },
				{ nombre: 'Mapfre', color: '#E30613' },
				{ nombre: 'Equidad', color: '#7CB342' },
				{ nombre: 'Allianz', color: '#003781' },
				{ nombre: 'Liberty', color: '#FBB034' },
			],
			equipo: [
				{ nombre: 'Carlos Andrés Pino', rol: 'Asesor senior · Auto y hogar', exp: '14 años', avatar: '#1E40AF', iniciales: 'CP' },
				{ nombre: 'Lina Marcela Tobón', rol: 'Asesora · Vida, salud y pyme', exp: '9 años', avatar: '#7C3AED', iniciales: 'LT' },
			],
			galeria: [
				{ label: 'Reunión de asesoría virtual', tono: '#DBEAFE' },
				{ label: 'Equipo de asesores', tono: '#E0E7FF' },
				{ label: 'Comparativo de pólizas', tono: '#EDE9FE' },
			],
			faqs: [
				{ q: '¿Me cobran por la asesoría?', a: 'No. Nuestra comisión la pagan las aseguradoras, sin recargo para ti.' },
				{ q: '¿Qué pasa si tengo un siniestro?', a: 'Nos llamas a nosotros primero. Coordinamos con la aseguradora y te acompañamos en todo el proceso.' },
				{ q: '¿Puedo cambiarme de aseguradora?', a: 'Sí, cuando se renueva la póliza. Hacemos el comparativo cada año.' },
				{ q: '¿Atienden personas fuera de Medellín?', a: 'Sí, toda la asesoría puede ser virtual. Tenemos clientes en toda Colombia.' },
			],
		},
	},
];

export type OpcionMod = { id: string; nombre: string; extra: number };
export type Modificador = {
	id: string;
	nombre: string;
	tipo: 'single' | 'multi';
	requerido: boolean;
	min?: number;
	max?: number;
	opciones: OpcionMod[];
};

export type Product = {
	id: string;
	storeId: string;
	name: string;
	description: string;
	price: number;
	emoji: string;
	category: string;
	stock?: number;
	modifiers?: Modificador[];
};

export type Review = {
	id: string;
	storeId: string;
	userName: string;
	avatar: string;
	rating: number;
	text: string;
	date: string;
	helpfulCount: number;
	photo?: string;
	reply?: { date: string; text: string };
};

export const PRODUCTS: Product[] = [
	{ id: 'p1', storeId: 't1', name: 'Bandeja Paisa', description: 'Fríjoles, chicharrón, chorizo, huevo, aguacate y más', price: 28000, emoji: '🍛', category: 'food', stock: 12, modifiers: [
		{ id: 'm1', nombre: 'Proteína extra', tipo: 'single', requerido: true, opciones: [
			{ id: 'op1', nombre: 'Pollo', extra: 0 },
			{ id: 'op2', nombre: 'Carne molida', extra: 0 },
			{ id: 'op3', nombre: 'Mixto (pollo + carne)', extra: 3000 },
		]},
		{ id: 'm2', nombre: 'Acompañamientos extra', tipo: 'multi', requerido: false, max: 2, opciones: [
			{ id: 'op4', nombre: 'Aguacate extra', extra: 2000 },
			{ id: 'op5', nombre: 'Chicharrón adicional', extra: 3000 },
			{ id: 'op6', nombre: 'Huevo adicional', extra: 1500 },
		]},
	]},
	{ id: 'p2', storeId: 't1', name: 'Ajiaco Bogotano', description: 'Sopa tradicional con papas, pollo y crema', price: 22000, emoji: '🥘', category: 'food', stock: 8 },
	{ id: 'p3', storeId: 't1', name: 'Empanadas x6', description: 'Rellenas de carne y papa, crujientes y doradas', price: 12000, emoji: '🥟', category: 'food', stock: 30 },
	{ id: 'p4', storeId: 't1', name: 'Changua con Huevo', description: 'Sopa de leche con cilantro y pan', price: 14000, emoji: '🍲', category: 'food', stock: 3 },
	{ id: 'p5', storeId: 't2', name: 'Aguacate Hass', description: 'Por unidad, maduro y listo para comer', price: 4500, emoji: '🥑', category: 'market', stock: 45 },
	{ id: 'p6', storeId: 't2', name: 'Maracuyá x kg', description: 'Maracuyá fresco de temporada', price: 8000, emoji: '🍊', category: 'market', stock: 20 },
	{ id: 'p7', storeId: 't2', name: 'Canasta Semanal', description: '15 productos esenciales a precio especial', price: 85000, emoji: '🛒', category: 'market', stock: 5 },
	{ id: 'p8', storeId: 't3', name: 'Blusa Margarita', description: 'Tela de algodón orgánico, tallas XS–XL', price: 89000, emoji: '👚', category: 'fashion', stock: 7 },
	{ id: 'p9', storeId: 't3', name: 'Falda Étnica', description: 'Tejido artesanal, colores vibrantes', price: 120000, emoji: '👗', category: 'fashion', stock: 3 },
	{ id: 'p10', storeId: 't4', name: 'Hub USB-C 7en1', description: 'HDMI, USB 3.0 x3, lector SD, PD 100W', price: 95000, emoji: '🔌', category: 'tech', stock: 15 },
	{ id: 'p11', storeId: 't4', name: 'Audífonos Pro', description: 'Cancelación de ruido activa, 30h batería', price: 180000, emoji: '🎧', category: 'tech', stock: 0 },
	{ id: 'p12', storeId: 't5', name: 'Kit Vitamina C', description: 'Sérum + crema hidratante + contorno de ojos', price: 135000, emoji: '💆', category: 'beauty', stock: 9 },
	{ id: 'p13', storeId: 't5', name: 'Labial Matte', description: 'Fórmula larga duración, 12 tonos disponibles', price: 32000, emoji: '💄', category: 'beauty', stock: 25 },
	{ id: 'p14', storeId: 't6', name: 'Mochila Wayuu', description: 'Tejida a mano por artesanas de La Guajira', price: 210000, emoji: '🎒', category: 'crafts', stock: 4 },
	{ id: 'p15', storeId: 't7', name: 'Instalación Eléctrica', description: 'Revisión + 3 puntos de luz', price: 150000, emoji: '💡', category: 'services', stock: 99 },
	{ id: 'p16', storeId: 't8', name: 'Pizza Margherita', description: 'Tomate San Marzano, mozzarella di bufala, albahaca', price: 42000, emoji: '🍕', category: 'food', stock: 20, modifiers: [
		{ id: 'm3', nombre: 'Tamaño', tipo: 'single', requerido: true, opciones: [
			{ id: 'op7', nombre: 'Personal (6 porciones)', extra: 0 },
			{ id: 'op8', nombre: 'Mediana (8 porciones)', extra: 8000 },
			{ id: 'op9', nombre: 'Familiar (12 porciones)', extra: 18000 },
		]},
		{ id: 'm4', nombre: 'Ingredientes extra', tipo: 'multi', requerido: false, max: 3, opciones: [
			{ id: 'op10', nombre: 'Pepperoni', extra: 5000 },
			{ id: 'op11', nombre: 'Champiñones', extra: 3000 },
			{ id: 'op12', nombre: 'Tocineta', extra: 4000 },
			{ id: 'op13', nombre: 'Queso extra', extra: 3500 },
		]},
		{ id: 'm5', nombre: 'Borde', tipo: 'single', requerido: false, opciones: [
			{ id: 'op14', nombre: 'Clásico', extra: 0 },
			{ id: 'op15', nombre: 'Relleno de queso', extra: 6000 },
			{ id: 'op16', nombre: 'Ajo y hierbas', extra: 2000 },
		]},
	]},
	{ id: 'p17', storeId: 't8', name: 'Pizza Funghi', description: 'Mix de hongos, trufa y parmesano', price: 52000, emoji: '🍄', category: 'food', stock: 15 },
	{ id: 'p18', storeId: 't1', name: 'Bandeja paisa completa + bebida', description: 'Fríjoles, chicharrón, chorizo, arroz, huevo, aguacate, arepa y bebida a elección', price: 35000, emoji: '🫕', category: 'food', stock: 10, modifiers: [
		{ id: 'm6', nombre: 'Proteína principal', tipo: 'single', requerido: true, opciones: [
			{ id: 'op17', nombre: 'Chicharrón y chorizo', extra: 0 },
			{ id: 'op18', nombre: 'Carne molida y chorizo', extra: 0 },
			{ id: 'op19', nombre: 'Pollo sudado y chorizo', extra: 0 },
			{ id: 'op20', nombre: 'Todo completo (chicharrón + carne + chorizo)', extra: 5000 },
		]},
		{ id: 'm7', nombre: 'Término del huevo', tipo: 'single', requerido: true, opciones: [
			{ id: 'op21', nombre: 'Frito', extra: 0 },
			{ id: 'op22', nombre: 'Revuelto', extra: 0 },
			{ id: 'op23', nombre: 'Tibio', extra: 0 },
		]},
		{ id: 'm8', nombre: 'Bebida incluida', tipo: 'single', requerido: true, opciones: [
			{ id: 'op24', nombre: 'Jugo de lulo natural', extra: 0 },
			{ id: 'op25', nombre: 'Jugo de maracuyá', extra: 0 },
			{ id: 'op26', nombre: 'Jugo de mango', extra: 0 },
			{ id: 'op27', nombre: 'Gaseosa personal', extra: 0 },
		]},
		{ id: 'm9', nombre: 'Acompañamientos extra', tipo: 'multi', requerido: false, max: 2, opciones: [
			{ id: 'op28', nombre: 'Aguacate extra', extra: 2000 },
			{ id: 'op29', nombre: 'Chicharrón adicional', extra: 3500 },
			{ id: 'op30', nombre: 'Tajadas de maduro', extra: 1500 },
			{ id: 'op31', nombre: 'Arepa adicional', extra: 1000 },
		]},
	]},
];

export type Deal = {
	id: string;
	storeId: string;
	productId: string;
	dealPrice: number;
	originalPrice: number;
	dealStock: number;
	initialStock: number;
	label: string;
	finishAt: number;
};

const now = Date.now();
export const DEALS: Deal[] = [
	{
		id: 'o1', storeId: 't1', productId: 'p1',
		dealPrice: 20000, originalPrice: 28000,
		dealStock: 8, initialStock: 20,
		label: '🔥 Flash 2h',
		finishAt: now + 2 * 3600 * 1000,
	},
	{
		id: 'o2', storeId: 't2', productId: 'p7',
		dealPrice: 65000, originalPrice: 85000,
		dealStock: 3, initialStock: 10,
		label: '🛒 Oferta semana',
		finishAt: now + 5 * 24 * 3600 * 1000,
	},
	{
		id: 'o3', storeId: 't5', productId: 'p12',
		dealPrice: 99000, originalPrice: 135000,
		dealStock: 5, initialStock: 12,
		label: '✨ Lanzamiento',
		finishAt: now + 3 * 24 * 3600 * 1000,
	},
];

export type LoyaltyRewardType = 'product' | 'discount_percent' | 'discount_fixed' | 'free_shipping';
export type LoyaltyCountingMode = 'all' | 'selected_products' | 'minimum_amount';

export type LoyaltyCardConfig = {
	storeId: string;
	active: boolean;
	threshold: number;
	countingMode: LoyaltyCountingMode;
	eligibleProductIds?: string[];
	minimumAmount?: number;
	rewardType: LoyaltyRewardType;
	rewardProductId?: string;
	rewardValue?: number;
};

export const LOYALTY_CARDS: LoyaltyCardConfig[] = [
	{
		storeId: 't1',
		active: true,
		threshold: 5,
		countingMode: 'all',
		rewardType: 'free_shipping',
	},
];

export type FeedItem =
	| { kind: 'deal'; dealId: string }
	| { kind: 'product'; productId: string; extra?: string | null; timeAgo: string }
	| { kind: 'video'; storeId: string; title: string; timeAgo: string; views: number };

export const FEED: FeedItem[] = [
	{ kind: 'deal',    dealId: 'o1' },
	{ kind: 'product', productId: 'p8',  extra: '¡Nuevo color disponible!', timeAgo: 'hace 2h' },
	{ kind: 'video',   storeId: 't2', title: 'Nuestras frutas de temporada 🍊', timeAgo: 'ayer', views: 4321 },
	{ kind: 'deal',    dealId: 'o2' },
	{ kind: 'product', productId: 'p10', extra: null, timeAgo: 'hace 3h' },
	{ kind: 'deal',    dealId: 'o3' },
	{ kind: 'product', productId: 'p16', extra: '🍕 Abiertos este fin de semana', timeAgo: 'hace 1h' },
];

export const USUARIO = {
	nombre: 'Camila Torres',
	iniciales: 'CT',
	color: '#7C3AED',
	email: 'camila.torres@email.com',
	telefono: '+57 320 456 7890',
	miembroDesde: 'enero 2025',
	pedidosTotal: 24,
	recompensas: 340,
	nivel: 'Oro',
};

export type Direccion = {
	id: string;
	label: string;
	direccion: string;
	barrio: string;
	ciudad: string;
	principal: boolean;
};

export const DIRECCIONES: Direccion[] = [
	{ id: 'd1', label: 'Casa 🏠', direccion: 'Cra 10 #45-23', barrio: 'El Poblado', ciudad: 'Medellín', principal: true },
	{ id: 'd2', label: 'Trabajo 💼', direccion: 'Cll 50 #9-20, Piso 4', barrio: 'Centro', ciudad: 'Medellín', principal: false },
	{ id: 'd3', label: 'Mamá 💙', direccion: 'Cra 43A #18-14', barrio: 'Laureles', ciudad: 'Medellín', principal: false },
];

export type Cupon = {
	id: string;
	codigo: string;
	descripcion: string;
	tipo: 'porcentaje' | 'fijo' | 'envio';
	valor: number;
	tiendaId: string | null;
	minimo: number;
	activo: boolean;
};

export const CUPONES: Cupon[] = [
	{ id: 'cu1', codigo: 'BIENVENIDO10', descripcion: '10% de descuento en tu pedido', tipo: 'porcentaje', valor: 10, tiendaId: null, minimo: 20000, activo: true },
	{ id: 'cu2', codigo: 'DESCUENTO5', descripcion: '$5.000 de descuento', tipo: 'fijo', valor: 5000, tiendaId: null, minimo: 30000, activo: true },
	{ id: 'cu3', codigo: 'ENVIOGRATIS', descripcion: 'Envío gratis en tu pedido', tipo: 'envio', valor: 0, tiendaId: null, minimo: 15000, activo: true },
	{ id: 'cu4', codigo: 'CASERO20', descripcion: '20% en El Sabor Casero', tipo: 'porcentaje', valor: 20, tiendaId: 't1', minimo: 25000, activo: true },
];

export const REVIEWS: Review[] = [
	{ id: 'r1', storeId: 't1', userName: 'Valentina Ríos', avatar: '#EA580C', rating: 5, text: '¡La mejor bandeja paisa de la plaza! El chicharrón crocante y los frijoles perfectos. Llevo 3 meses pidiendo y nunca me han fallado.', date: 'hace 2 días', helpfulCount: 12, photo: '🍛', reply: { date: 'ayer', text: 'Muchas gracias Valentina ❤️ Nos alegra mucho ser tu favorita. ¡Aquí siempre te esperamos!' } },
	{ id: 'r2', storeId: 't1', userName: 'Diego Morales', avatar: '#2563EB', rating: 4, text: 'Muy buena comida, porciones generosas. A veces se demora un poco más de lo estimado pero vale la pena esperar.', date: 'hace 5 días', helpfulCount: 7 },
	{ id: 'r3', storeId: 't1', userName: 'Luisa Fernanda Castillo', avatar: '#16A34A', rating: 5, text: 'El ajiaco es una maravilla, me recuerda al de mi abuela. El empaque mantiene todo caliente y llega en perfectas condiciones.', date: 'hace 1 semana', helpfulCount: 21, photo: '🥘' },
	{ id: 'r4', storeId: 't1', userName: 'Andrés Felipe', avatar: '#7C3AED', rating: 3, text: 'Buena sazón pero me llegó una orden incompleta, faltó el aguacate. El servicio al cliente respondió rápido y me devolvieron el dinero.', date: 'hace 2 semanas', helpfulCount: 3 },
	{ id: 'r5', storeId: 't8', userName: 'María Paula Gómez', avatar: '#EC4899', rating: 5, text: 'La masa más auténtica que he probado fuera de Italia. El horno de leña hace toda la diferencia. ¡La familiar la pedimos cada viernes!', date: 'hace 3 días', helpfulCount: 18, photo: '🍕' },
	{ id: 'r6', storeId: 't8', userName: 'Camilo Herrera', avatar: '#F59E0B', rating: 5, text: 'Pedí la pizza funghi con borde de queso y fue una experiencia increíble. El tiempo de entrega fue exacto. 100% recomendado.', date: 'hace 1 semana', helpfulCount: 9 },
	{ id: 'r7', storeId: 't8', userName: 'Natalia Ospina', avatar: '#16A34A', rating: 4, text: 'Rica pizza y buen precio. El pepperoni extra vale la pena. Solo le quitaría una estrella porque la caja llegó un poco aplastada.', date: 'hace 2 semanas', helpfulCount: 4, reply: { date: 'hace 1 semana', text: 'Gracias por contarnos Natalia. Hemos mejorado el embalaje para pizzas grandes. ¡La próxima llegará perfecta!' } },
];

export type Servicio = {
	id: string;
	tiendaId: string;
	nombre: string;
	tagline: string;
	icon: string;
	tone: string;
	categoria: string;
	duracion: string;
	modalidad: string;
	precio: number | null;
	precioDesde: boolean;
	cta: 'agendar' | 'cotizar' | 'llamar' | 'mensaje';
	incluye: string[];
};

export const SERVICIOS: Servicio[] = [
	// Clínica Sonrisa Mayor (t9)
	{ id: 's1', tiendaId: 't9', nombre: 'Valoración integral con radiografía panorámica', tagline: 'Diagnóstico completo y plan de tratamiento.', icon: '🦷', tone: '#0EA5E9', categoria: 'Diagnóstico', duracion: '45 min', modalidad: 'Presencial', precio: 45000, precioDesde: false, cta: 'agendar', incluye: ['Radiografía panorámica 3D', 'Examen clínico completo', 'Plan de tratamiento detallado', 'Cotización por escrito sin compromiso'] },
	{ id: 's2', tiendaId: 't9', nombre: 'Profilaxis + control de placa', tagline: 'Limpieza profunda con ultrasonido y flúor.', icon: '✨', tone: '#0EA5E9', categoria: 'Prevención', duracion: '60 min', modalidad: 'Presencial', precio: 95000, precioDesde: false, cta: 'agendar', incluye: ['Limpieza con ultrasonido', 'Pulido y profilaxis', 'Aplicación de flúor', 'Tips de higiene personalizados'] },
	{ id: 's3', tiendaId: 't9', nombre: 'Blanqueamiento dental LED', tagline: 'Hasta 6 tonos más blanco en una sola sesión.', icon: '🌟', tone: '#0EA5E9', categoria: 'Estética', duracion: '90 min', modalidad: 'Presencial', precio: 480000, precioDesde: true, cta: 'agendar', incluye: ['Sesión en consultorio con luz LED', 'Kit de mantenimiento para casa (7 días)', 'Control a los 15 días', 'Garantía de 6 meses'] },
	{ id: 's4', tiendaId: 't9', nombre: 'Ortodoncia invisible Invisalign', tagline: 'Alinea tus dientes sin brackets, sin que se note.', icon: '😁', tone: '#0EA5E9', categoria: 'Ortodoncia', duracion: '12–18 meses', modalidad: 'Presencial', precio: 9800000, precioDesde: true, cta: 'agendar', incluye: ['Escáner 3D inicial', 'Todos los alineadores del tratamiento', 'Controles mensuales', 'Retenedores finales', 'Financiación hasta 18 meses'] },
	{ id: 's5', tiendaId: 't9', nombre: 'Implante dental unitario', tagline: 'Reemplaza una pieza perdida. Resultado natural.', icon: '🔩', tone: '#0EA5E9', categoria: 'Cirugía', duracion: '3 sesiones · 4 meses', modalidad: 'Presencial', precio: 3200000, precioDesde: true, cta: 'agendar', incluye: ['Implante de titanio', 'Pilar y corona en zirconio', 'Cirugía + anestesia local', 'Controles incluidos', 'Garantía de 5 años'] },
	{ id: 's6', tiendaId: 't9', nombre: 'Endodoncia (tratamiento de conducto)', tagline: 'Salva tu diente y elimina el dolor.', icon: '🦷', tone: '#0EA5E9', categoria: 'Tratamiento', duracion: '1–2 sesiones', modalidad: 'Presencial', precio: 650000, precioDesde: true, cta: 'agendar', incluye: ['Tratamiento con microscopio', 'Anestesia incluida', 'Restauración temporal', 'Radiografía de control'] },
	{ id: 's7', tiendaId: 't9', nombre: 'Urgencia odontológica', tagline: 'Dolor agudo, fractura o trauma. Atención hoy mismo.', icon: '🚨', tone: '#DC2626', categoria: 'Urgencias', duracion: 'Variable', modalidad: 'Presencial', precio: 120000, precioDesde: true, cta: 'llamar', incluye: ['Consulta de urgencia', 'Diagnóstico y manejo del dolor', 'Plan de tratamiento posterior', 'Línea directa 24/7'] },
	// Tejido · Psicología (t10)
	{ id: 's10', tiendaId: 't10', nombre: 'Primera sesión gratuita', tagline: '30 minutos para conocernos. Sin compromiso.', icon: '💬', tone: '#8B5CF6', categoria: 'Inicio', duracion: '30 min', modalidad: 'Presencial o video', precio: 0, precioDesde: false, cta: 'agendar', incluye: ['Encuentro con la psicóloga', 'Espacio para contar qué te trae aquí', 'Recomendación de plan', 'Sin obligación de continuar'] },
	{ id: 's11', tiendaId: 't10', nombre: 'Terapia individual adultos', tagline: 'Ansiedad, duelo, autoestima, relaciones, propósito.', icon: '🌿', tone: '#8B5CF6', categoria: 'Adultos', duracion: '50 min', modalidad: 'Presencial o video', precio: 130000, precioDesde: false, cta: 'agendar', incluye: ['Sesión 1:1 con tu psicóloga', 'Notas de seguimiento privadas', 'Chat de apoyo entre semanas', 'Plan de objetivos personalizado'] },
	{ id: 's12', tiendaId: 't10', nombre: 'Terapia de pareja', tagline: 'Comunicación, conflicto, decisiones. Sistémica.', icon: '💞', tone: '#EC4899', categoria: 'Relaciones', duracion: '75 min', modalidad: 'Presencial o video', precio: 160000, precioDesde: false, cta: 'agendar', incluye: ['Sesión de pareja con Daniela', 'Mapa de la relación', 'Ejercicios para la semana', 'Sesiones individuales opcionales'] },
	{ id: 's13', tiendaId: 't10', nombre: 'Acompañamiento a niños y adolescentes', tagline: 'Terapia de juego y conversación. Edad 6–17.', icon: '🧸', tone: '#0EA5E9', categoria: 'Niños', duracion: '45 min', modalidad: 'Presencial', precio: 120000, precioDesde: false, cta: 'agendar', incluye: ['Sesión con Felipe Cárdenas', 'Reportes mensuales a los padres', 'Recomendaciones para casa y colegio'] },
	{ id: 's14', tiendaId: 't10', nombre: 'Paquete de 4 sesiones', tagline: 'Ahorra 10% comprometiéndote con tu proceso.', icon: '📦', tone: '#16A34A', categoria: 'Paquetes', duracion: '4 sesiones de 50 min', modalidad: 'Presencial o video', precio: 468000, precioDesde: false, cta: 'agendar', incluye: ['4 sesiones individuales', '10% de descuento', 'Vigencia de 3 meses', 'Cambios de horario flexibles'] },
	{ id: 's15', tiendaId: 't10', nombre: 'Consulta con asesor antes de empezar', tagline: 'Pregúntanos cualquier cosa por chat. Gratis.', icon: '✉️', tone: '#8B5CF6', categoria: 'Inicio', duracion: 'A tu ritmo', modalidad: 'Chat', precio: 0, precioDesde: false, cta: 'mensaje', incluye: ['Respondemos en menos de 24 horas', 'Te orientamos sin agenda', 'Sin obligación de agendar'] },
	// Mudanzas del Norte (t11)
	{ id: 's20', tiendaId: 't11', nombre: 'Paquete Express', tagline: 'Solo carga y transporte. Tú embalas.', icon: '🚚', tone: '#EA580C', categoria: 'Local', duracion: 'Hasta 4 horas', modalidad: 'A domicilio', precio: 320000, precioDesde: true, cta: 'cotizar', incluye: ['Cuadrilla de 2 personas', 'Camioneta hasta 8 m³', 'Mantas para muebles', 'Hasta 4 horas de servicio'] },
	{ id: 's21', tiendaId: 't11', nombre: 'Paquete Completo', tagline: 'Embalamos, cargamos, transportamos y montamos.', icon: '📦', tone: '#EA580C', categoria: 'Local', duracion: 'Hasta 8 horas', modalidad: 'A domicilio', precio: 720000, precioDesde: true, cta: 'cotizar', incluye: ['Cuadrilla de 3 personas', 'Embalaje profesional', 'Transporte', 'Montaje de muebles básico', 'Seguro contra daños'] },
	{ id: 's22', tiendaId: 't11', nombre: 'Paquete Premium', tagline: 'Trasteo llave en mano. Tú no haces nada.', icon: '⭐', tone: '#9A3412', categoria: 'Local', duracion: 'Sin límite', modalidad: 'A domicilio', precio: 1450000, precioDesde: true, cta: 'cotizar', incluye: ['Embalaje completo', 'Desembalaje en destino', 'Montaje total de muebles', 'Limpieza final del origen', 'Seguro ampliado hasta $50M'] },
	{ id: 's23', tiendaId: 't11', nombre: 'Trasteo intermunicipal', tagline: 'Cobertura Antioquia, Eje Cafetero, Bogotá.', icon: '🛣️', tone: '#EA580C', categoria: 'Intermunicipal', duracion: '1–2 días', modalidad: 'A domicilio', precio: null, precioDesde: false, cta: 'cotizar', incluye: ['Cuadrilla en origen y destino', 'Camión 350 o turbo', 'Permisos y peajes incluidos', 'Seguro intermunicipal'] },
	{ id: 's24', tiendaId: 't11', nombre: 'Bodegaje · Storage mensual', tagline: 'Guarda tus cosas mientras te organizas.', icon: '🏬', tone: '#EA580C', categoria: 'Bodegaje', duracion: 'Por mes', modalidad: 'En bodega', precio: 280000, precioDesde: true, cta: 'cotizar', incluye: ['Bodega climatizada y vigilada', 'Inventario fotográfico', 'Recogida y entrega disponibles', 'Acceso con cita previa'] },
	// Pórtico Seguros (t12)
	{ id: 's30', tiendaId: 't12', nombre: 'Seguro Todo Riesgo Auto', tagline: 'Compara primas de 6 aseguradoras en 48h.', icon: '🚗', tone: '#1E40AF', categoria: 'Auto', duracion: '1 año renovable', modalidad: 'Asesoría virtual o presencial', precio: 1200000, precioDesde: true, cta: 'cotizar', incluye: ['Cobertura por pérdida total y parcial', 'Responsabilidad civil hasta $1.500M', 'Asistencia 24h, grúa y carro de reemplazo', 'Comparativo de 6 aseguradoras'] },
	{ id: 's31', tiendaId: 't12', nombre: 'Seguro de Vida individual', tagline: 'Tranquilidad para los tuyos cuando ya no estés.', icon: '❤️', tone: '#1E40AF', categoria: 'Vida', duracion: '1 año renovable', modalidad: 'Asesoría', precio: 480000, precioDesde: true, cta: 'cotizar', incluye: ['Suma asegurada hasta $1.000M', 'Cobertura por muerte e invalidez', 'Anticipo por enfermedad grave', 'Asesoría legal para beneficiarios'] },
	{ id: 's32', tiendaId: 't12', nombre: 'Medicina prepagada', tagline: 'Salud sin filas y con red propia.', icon: '🩺', tone: '#1E40AF', categoria: 'Salud', duracion: '1 año renovable', modalidad: 'Asesoría', precio: 1800000, precioDesde: true, cta: 'cotizar', incluye: ['Red de clínicas y especialistas', 'Cobertura nacional', 'Sin períodos de carencia', 'Telemedicina 24h'] },
	{ id: 's33', tiendaId: 't12', nombre: 'Seguro de Hogar', tagline: 'Incendio, hurto, daños eléctricos, terremoto.', icon: '🏠', tone: '#1E40AF', categoria: 'Hogar', duracion: '1 año renovable', modalidad: 'Asesoría', precio: 360000, precioDesde: true, cta: 'cotizar', incluye: ['Estructura y contenidos', 'Hurto con violencia', 'Daños por agua y eléctricos', 'Responsabilidad civil familiar'] },
	{ id: 's34', tiendaId: 't12', nombre: 'Pyme · RC Profesional', tagline: 'Protege tu negocio y a tus clientes.', icon: '🏢', tone: '#1E40AF', categoria: 'Pyme', duracion: '1 año renovable', modalidad: 'Asesoría', precio: 720000, precioDesde: true, cta: 'cotizar', incluye: ['Responsabilidad civil profesional', 'Daños a terceros y bienes', 'Pérdidas por incendio', 'Asesoría jurídica'] },
	{ id: 's35', tiendaId: 't12', nombre: 'Seguro de Mascotas', tagline: 'Veterinaria, urgencias y responsabilidad civil.', icon: '🐾', tone: '#1E40AF', categoria: 'Mascotas', duracion: '1 año renovable', modalidad: 'Asesoría', precio: 240000, precioDesde: true, cta: 'cotizar', incluye: ['Consultas veterinarias', 'Urgencias y hospitalización', 'Vacunas y desparasitación', 'RC por daños de tu mascota'] },
];

// Helpers
export function getStore(id: string): Store {
	return STORES.find((t) => t.id === id) ?? STORES[0];
}
export function getProduct(id: string): Product {
	return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}
export function getDeal(id: string): Deal {
	return DEALS.find((o) => o.id === id) ?? DEALS[0];
}
export function getStoreProducts(storeId: string): Product[] {
	return PRODUCTS.filter((p) => p.storeId === storeId);
}
export function getStoreDeals(storeId: string): Deal[] {
	return DEALS.filter((o) => o.storeId === storeId);
}
export function getCategory(key: string): Category {
	return CATEGORIES[key] ?? CATEGORIES['food'];
}
export function getStoreReviews(storeId: string): Review[] {
	return REVIEWS.filter((r) => r.storeId === storeId);
}
export function getServiciosDe(tiendaId: string): Servicio[] {
	return SERVICIOS.filter((s) => s.tiendaId === tiendaId);
}
export function getServicio(id: string): Servicio | undefined {
	return SERVICIOS.find((s) => s.id === id);
}
export function isServiceStore(store: Store): boolean {
	return store.kind === 'service';
}
