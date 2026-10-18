<script lang="ts">
	import { favoritos } from '#lib/stores/favoritos.svelte.js';
	import { fmtCOP } from '#lib/utils.js';
	import { getCategory, type Product, type Store, type Deal, type Review } from '#lib/data/mock.js';
	import TiendaLogo from '#lib/components/TiendaLogo.svelte';
	import CategoryBadge from '#lib/components/CategoryBadge.svelte';
	import CountdownPill from '#lib/components/CountdownPill.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Icon from '#lib/components/ui/Icon.svelte';

	type Props = {
		tienda: Store;
		productos: Product[];
		ofertas: Deal[];
		resenas: Review[];
		accent: string;
		isOpen: boolean;
		onOpenProduct: (p: Product) => void;
	};
	let { tienda, productos, ofertas, resenas, accent, isOpen, onOpenProduct }: Props = $props();

	// Arranca en tienda.following y se reinicia al cambiar de tienda; el botón lo sobrescribe localmente.
	let siguiendo = $derived(tienda.following);

	// Landing helpers
	type Pillar = { icon: string; titulo: string; desc: string };
	type FaqItem = { q: string; a: string };
	type GaleriaItem = { label: string; tono: string };

	const CATEGORY_PILLARS: Record<string, Pillar[]> = {
		food: [
			{
				icon: 'fire',
				titulo: 'Cocinamos al instante',
				desc: 'Cada pedido se prepara fresco, nunca recalentado. Salimos en menos de 25 min.'
			},
			{
				icon: 'heart',
				titulo: 'Recetas de casa',
				desc: 'Sin saborizantes industriales. Ingredientes que reconocerías en la despensa de tu abuela.'
			},
			{
				icon: 'truck',
				titulo: 'Entrega caliente',
				desc: 'Bolsa térmica + ruta optimizada. Llega a la temperatura justa.'
			}
		],
		market: [
			{
				icon: 'sparkle',
				titulo: 'Cosechado del día',
				desc: 'Llega a la plaza temprano y sale a tu casa antes del mediodía.'
			},
			{
				icon: 'heart',
				titulo: 'Pagamos justo al productor',
				desc: 'Trabajamos directo con campesinos. Menos intermediarios, mejor precio.'
			},
			{
				icon: 'check',
				titulo: 'Garantía de frescura',
				desc: 'Si algo no llega en óptimas condiciones, reponemos o reembolsamos sin discusión.'
			}
		],
		fashion: [
			{
				icon: 'sparkle',
				titulo: 'Producción limitada',
				desc: 'Cada drop se hace en lotes pequeños. Si te lo perdiste, no vuelve.'
			},
			{
				icon: 'heart',
				titulo: 'Hecho con propósito',
				desc: 'Confeccionado por talleres locales con condiciones justas.'
			},
			{
				icon: 'check',
				titulo: 'Cambios gratis 30 días',
				desc: 'Si la talla no es la tuya, cambio sin costo. Devolvemos el envío.'
			}
		],
		tech: [
			{
				icon: 'shield',
				titulo: 'Garantía de 60 días',
				desc: 'Cualquier falla relacionada con la reparación, la cubrimos sin costo.'
			},
			{
				icon: 'check',
				titulo: 'Repuestos originales',
				desc: 'Trabajamos con repuestos OEM o de calidad equivalente.'
			},
			{
				icon: 'timer',
				titulo: 'Diagnóstico en 15 min',
				desc: 'Llega, te diagnosticamos en vivo y te decimos qué tiene y cuánto cuesta.'
			}
		],
		beauty: [
			{
				icon: 'heart',
				titulo: 'Sin parabenos ni sulfatos',
				desc: 'Formulaciones limpias, sin ingredientes controvertidos.'
			},
			{
				icon: 'sparkle',
				titulo: 'Probado dermatológicamente',
				desc: 'Cada producto pasa por pruebas en dermatólogos colombianos antes de salir.'
			},
			{
				icon: 'check',
				titulo: 'Cruelty-free certificado',
				desc: 'No probamos en animales y nuestros proveedores tampoco.'
			}
		],
		crafts: [
			{
				icon: 'sparkle',
				titulo: 'Pieza única',
				desc: 'Cada artesanía es irrepetible. Tu mochila no será igual a ninguna otra.'
			},
			{
				icon: 'heart',
				titulo: 'Comercio justo',
				desc: 'El 70% del precio va directo a la artesana.'
			},
			{
				icon: 'check',
				titulo: 'Tradición ancestral',
				desc: 'Técnicas transmitidas por generaciones, certificadas por el Ministerio de Cultura.'
			}
		],
		services: [
			{
				icon: 'phone',
				titulo: 'Atención 24/7',
				desc: 'Estamos disponibles cuando lo necesites, no solo en horario de oficina.'
			},
			{
				icon: 'check',
				titulo: 'Sin cobros sorpresa',
				desc: 'Te decimos el precio antes de hacer cualquier cosa. Si cambia, te avisamos.'
			},
			{
				icon: 'shield',
				titulo: 'Trabajo garantizado',
				desc: 'Si algo falla por nuestra reparación, volvemos sin costo durante 30 días.'
			}
		]
	};

	const CATEGORY_FAQS: Record<string, FaqItem[]> = {
		food: [
			{
				q: '¿Cuánto se demora el pedido?',
				a: 'Entre 30 y 45 minutos según tu zona. Los tiempos se actualizan en vivo cuando confirmas el pedido.'
			},
			{
				q: '¿Hacen pedidos por anticipado?',
				a: 'Sí, puedes programar tu pedido hasta con 48 horas de anticipación desde el carrito.'
			},
			{
				q: '¿Atienden eventos o pedidos grandes?',
				a: 'Sí, escríbenos por mensaje directo y coordinamos con un día de anticipación.'
			}
		],
		market: [
			{
				q: '¿Cómo seleccionan los productos?',
				a: 'Tenemos un equipo que escoge cada pieza a mano antes de empacarla.'
			},
			{
				q: '¿Manejan productos orgánicos?',
				a: 'Sí, marcados con etiqueta. Vienen certificados directamente de fincas en Antioquia.'
			},
			{
				q: '¿Hacen domicilios a oficinas?',
				a: 'Sí. También tenemos suscripción semanal de canastas a domicilio.'
			}
		],
		fashion: [
			{
				q: '¿Cómo sé qué talla pedir?',
				a: 'En cada producto tienes guía de medidas. Si dudas, escríbenos por chat.'
			},
			{
				q: '¿Puedo devolver una prenda?',
				a: 'Sí, hasta 30 días después de recibirla, sin estrenar y con etiquetas.'
			},
			{
				q: '¿Hacen prendas a la medida?',
				a: 'Algunos productos sí, escríbenos para confirmar y agendamos toma de medidas.'
			}
		],
		tech: [
			{
				q: '¿Cuánto se demora una reparación?',
				a: 'La mayoría queda el mismo día. Cambios de pantalla en 1 hora.'
			},
			{
				q: '¿Si pierdo mis datos durante la reparación?',
				a: 'Antes de reparar te pedimos respaldo. También hacemos backup gratuito si lo solicitas.'
			},
			{
				q: '¿Atienden a domicilio?',
				a: 'Sí, para limpiezas, instalaciones y diagnósticos. La reparación física se hace en taller.'
			}
		],
		beauty: [
			{
				q: '¿Tienen muestras antes de comprar?',
				a: 'Sí, en pedidos sobre $80.000 incluimos muestras gratuitas.'
			},
			{
				q: '¿Cómo sé qué producto necesito?',
				a: 'Escríbenos por chat y te recomendamos sin presión de venta.'
			},
			{
				q: '¿Manejan piel sensible o problemas específicos?',
				a: 'Sí, tenemos línea específica para piel sensible, acné y manchas. Filtros disponibles en catálogo.'
			}
		],
		crafts: [
			{
				q: '¿Por qué cuesta más que las del mercado?',
				a: 'Porque cada pieza toma entre 15 y 30 días de tejido a mano por una artesana.'
			},
			{
				q: '¿Puedo pedir una a la medida?',
				a: 'Sí, escríbenos. Las piezas a la medida toman 6-8 semanas.'
			},
			{
				q: '¿Llevan certificado de origen?',
				a: 'Sí, cada pieza viene con tarjeta firmada por la artesana y certificado de origen.'
			}
		],
		services: [
			{
				q: '¿Atienden emergencias en fin de semana?',
				a: 'Sí, con un recargo del 20% en horario no laboral.'
			},
			{
				q: '¿Cuánto cuesta una visita técnica?',
				a: 'Visita y diagnóstico gratis. Solo cobramos si autorizas la reparación.'
			}
		]
	};

	const CATEGORY_EYEBROW: Record<string, string> = {
		food: 'Cocina con sabor',
		market: 'Del campo a tu casa',
		fashion: 'Diseñado en Colombia',
		tech: 'Tecnología que se repara',
		beauty: 'Cuidado consciente',
		crafts: 'Tejido a mano',
		services: 'Servicio profesional'
	};

	const CATEGORY_GALERIA: Record<string, GaleriaItem[]> = {
		food: [
			{ label: 'Plato del día emplatado', tono: '#FED7AA' },
			{ label: 'Cocina abierta · al wok', tono: '#FEF3C7' },
			{ label: 'Mesa del equipo · domingo', tono: '#FFEDD5' },
			{ label: 'Empaque ecológico para domicilio', tono: '#FFE4E6' }
		],
		market: [
			{ label: 'Frutas seleccionadas del día', tono: '#DCFCE7' },
			{ label: 'Canasta semanal lista', tono: '#F0FDF4' },
			{ label: 'Café tostado en Quindío', tono: '#FEF3C7' },
			{ label: 'Pan recién horneado', tono: '#FED7AA' }
		],
		fashion: [
			{ label: 'Taller de confección', tono: '#F3E8FF' },
			{ label: 'Drop temporada otoño', tono: '#EDE9FE' },
			{ label: 'Estampado a mano', tono: '#FCE7F3' },
			{ label: 'Modelos locales · campaña', tono: '#E0E7FF' }
		],
		tech: [
			{ label: 'Mesa de reparación · microscopio', tono: '#DBEAFE' },
			{ label: 'Antes / después · pantalla', tono: '#E0E7FF' },
			{ label: 'Limpieza profunda laptop', tono: '#DCFCE7' },
			{ label: 'Stock de repuestos OEM', tono: '#FEF3C7' }
		],
		beauty: [
			{ label: 'Producto en piel · campaña', tono: '#FCE7F3' },
			{ label: 'Línea skincare desplegada', tono: '#FDF2F8' },
			{ label: 'Laboratorio · formulación', tono: '#F3E8FF' },
			{ label: 'Tonos del labial mate', tono: '#FFE4E6' }
		],
		crafts: [
			{ label: 'Manos tejiendo mochila', tono: '#FED7AA' },
			{ label: 'Detalle del nudo Wayúu', tono: '#FEF3C7' },
			{ label: 'Comunidad · La Guajira', tono: '#FCE7F3' },
			{ label: 'Pieza terminada en exhibición', tono: '#E0E7FF' }
		],
		services: [
			{ label: 'Equipo en uniforme', tono: '#FEF3C7' },
			{ label: 'Herramientas certificadas', tono: '#FED7AA' },
			{ label: 'Servicio en domicilio', tono: '#DBEAFE' }
		]
	};

	const pillars = $derived(
		tienda.landing?.pillars ?? CATEGORY_PILLARS[tienda.category] ?? CATEGORY_PILLARS.food
	);
	const faqs = $derived(tienda.landing?.faqs ?? CATEGORY_FAQS[tienda.category] ?? []);
	const galeria = $derived(
		tienda.landing?.galeria ?? CATEGORY_GALERIA[tienda.category] ?? CATEGORY_GALERIA.food
	);
	const eyebrow = $derived(
		tienda.landing?.eyebrow ?? CATEGORY_EYEBROW[tienda.category] ?? CATEGORY_EYEBROW.food
	);
	const tagline = $derived(
		tienda.landing?.tagline ??
			(() => {
				const map: Record<string, string> = {
					food: `${tienda.name} — Sabores que se sienten en casa`,
					market: 'Lo más fresco, del campo a tu casa',
					fashion: 'Diseño local, piezas que cuentan algo',
					tech: 'Reparamos lo que otros desechan',
					beauty: 'Belleza honesta, sin compromisos',
					crafts: 'Manos que tejen historia',
					services: '24/7 cuando lo necesitas'
				};
				return map[tienda.category] ?? tienda.description;
			})()
	);
	const heroLabel = $derived(
		tienda.landing?.heroLabel ??
			(ofertas.length > 0
				? `🔥 ${ofertas.length} oferta${ofertas.length > 1 ? 's' : ''} activa${ofertas.length > 1 ? 's' : ''} hoy · Aprovecha antes de que se agoten`
				: `Sigue a ${tienda.name} y entérate primero de cada novedad`)
	);
	const is24 = $derived((tienda.hours ?? '').includes('24'));
	const stats = $derived([
		{
			valor: String(productos.length),
			label:
				tienda.category === 'food'
					? 'platos en menú'
					: tienda.category === 'tech'
						? 'servicios'
						: 'productos'
		},
		{ valor: tienda.rating.toFixed(1), label: 'calificación' },
		{
			valor: ((tienda.ratingSummary?.total ?? 0) + 50).toLocaleString('es-CO'),
			label: 'pedidos entregados'
		},
		{
			valor: is24
				? '24/7'
				: tienda.category === 'food'
					? '30 min'
					: tienda.category === 'market'
						? '2 horas'
						: tienda.category === 'tech'
							? '1 día'
							: '1-3 días',
			label: tienda.category === 'tech' ? 'tiempo de reparación' : 'tiempo de entrega'
		}
	]);

	// Destacados: productos con oferta primero, luego los demás
	const destacados = $derived(() => {
		const conOferta = productos.filter((p) => ofertas.some((o) => o.productId === p.id));
		const resto = productos.filter((p) => !conOferta.find((x) => x.id === p.id));
		return [...conOferta, ...resto].slice(0, 4);
	});

	// FAQ accordion
	let faqOpen = $state<number | null>(null);

	// Scroll to catalog
	function scrollToCatalogo() {
		document.getElementById('tl-catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function goBack() {
		history.back();
	}
</script>

<div class="mx-auto max-w-5xl pb-32 md:pb-24">
	<!-- ── HERO ── -->
	<div
		class="relative overflow-hidden rounded-b-[22px] md:rounded-b-[28px]"
		style="background:{tienda.bannerGradient}; min-height:260px; height:clamp(260px,30vw,360px)"
	>
		<div
			class="absolute inset-0"
			style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 14px)"
		/>
		<!-- Decorative circle -->
		<div
			class="absolute rounded-full"
			style="width:300px;height:300px;background:rgba(255,255,255,.08);right:-60px;top:-60px;"
		/>
		<!-- Emoji -->
		<div
			class="absolute right-5 bottom-4 drop-shadow-[0_12px_30px_rgba(0,0,0,.25)] select-none md:right-14 md:bottom-8"
			style="font-size:clamp(90px,14vw,150px);line-height:1"
		>
			{tienda.emoji}
		</div>

		<!-- Tagline block -->
		<div class="absolute right-[140px] bottom-9 left-6 md:right-[50%] md:bottom-12 md:left-14">
			<div
				class="mb-3 inline-block rounded-full px-3 py-1 font-mono text-[11px] font-bold tracking-[1.2px] uppercase"
				style="background:rgba(255,255,255,.92);color:{accent}"
			>
				{getCategory(tienda.category).label} · {eyebrow}
			</div>
			<h1
				class="font-display leading-[1.1] font-extrabold tracking-[-0.5px] text-balance text-white drop-shadow-[0_4px_24px_rgba(0,0,0,.25)]"
				style="font-size:clamp(20px,3.5vw,36px);text-shadow:0 4px 24px rgba(0,0,0,.25)"
			>
				{tagline}
			</h1>
		</div>

		<!-- Back -->
		<button
			onclick={goBack}
			class="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)"
		>
			<Icon name="arrowLeft" size={18} />
		</button>
		<!-- Share -->
		<button
			class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)"
		>
			<Icon name="share" size={18} />
		</button>
	</div>

	<div class="px-5 md:px-6">
		<!-- ── HEADER CARD (overlapping) ── -->
		<div
			class="relative -mt-10 rounded-[20px] border border-[var(--c-border-soft)] p-5 shadow-[var(--shadow-md)]"
			style="background:var(--c-bg-card)"
		>
			<div class="flex flex-wrap items-start gap-3.5">
				<!-- Logo (pulled up) -->
				<div class="-mt-10">
					<div
						class="rounded-full p-0.5 shadow-[var(--shadow-sm)]"
						style="background:var(--c-bg-card)"
					>
						<TiendaLogo {tienda} size={72} />
					</div>
				</div>
				<!-- Info -->
				<div class="min-w-[200px] flex-1">
					<div class="mb-1.5 flex flex-wrap gap-2">
						<CategoryBadge catKey={tienda.category} />
						{#if isOpen}
							<span
								class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
								style="background:var(--c-success-light);color:var(--c-success)"
							>
								<span class="h-[6px] w-[6px] rounded-full bg-current" />
								Abierto ahora
							</span>
						{:else}
							<span
								class="rounded-full px-2.5 py-1 text-[11px] font-bold"
								style="background:var(--c-error-light);color:var(--c-error)">Cerrado</span
							>
						{/if}
					</div>
					<h2 class="mb-1 font-display text-2xl font-extrabold tracking-[-0.3px]">{tienda.name}</h2>
					<p class="mb-2.5 text-[13.5px] leading-relaxed" style="color:var(--c-text-secondary)">
						{tienda.description}
					</p>
					<div class="flex flex-wrap gap-4 text-xs" style="color:var(--c-text-secondary)">
						<span class="flex items-center gap-1">
							<Icon name="starFill" size={13} color="var(--c-accent)" />
							<strong>{tienda.rating}</strong>
							{#if tienda.ratingSummary}<span style="color:var(--c-text-muted)"
									>({tienda.ratingSummary.total})</span
								>{/if}
						</span>
						<span class="flex items-center gap-1"
							><Icon name="user" size={12} />{tienda.followers.toLocaleString()} siguiendo</span
						>
						<span class="flex items-center gap-1"
							><Icon name="location" size={12} />{tienda.location}</span
						>
					</div>
				</div>
			</div>

			<!-- Hero label -->
			{#if heroLabel}
				<div
					class="mt-4 flex items-center gap-2.5 rounded-xl border p-3 text-[12.5px] leading-relaxed font-semibold"
					style="background:{ofertas.length > 0
						? 'var(--c-error-light)'
						: accent + '0e'};border-color:{ofertas.length > 0
						? 'var(--c-error)'
						: accent}55;color:{ofertas.length > 0 ? 'var(--c-error)' : 'var(--c-text-primary)'}"
				>
					{#if ofertas.length === 0}<Icon name="sparkle" size={16} color={accent} />{/if}
					<span>{heroLabel}</span>
				</div>
			{/if}

			<!-- Actions -->
			<div class="mt-5 flex flex-wrap gap-2">
				<button
					onclick={scrollToCatalogo}
					class="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white md:flex-none"
					style="background:{accent};box-shadow:0 4px 18px {accent}55;min-width:160px"
				>
					<Icon name="store" size={16} />
					Ver catálogo
				</button>
				<button
					class="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
					style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
				>
					<Icon name="chat" size={16} />
					Mensaje
				</button>
				<button
					onclick={() => (siguiendo = !siguiendo)}
					class="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
					style="background:{siguiendo
						? 'var(--c-bg-secondary)'
						: 'var(--c-bg-card)'};border-color:var(--c-border);color:var(--c-text-primary)"
				>
					<Icon name={siguiendo ? 'check' : 'heart'} size={16} />
					{siguiendo ? 'Siguiendo' : 'Seguir'}
				</button>
			</div>
		</div>

		<!-- ── STATS ── -->
		<div class="mt-8 grid grid-cols-2 gap-2.5 md:grid-cols-4">
			{#each stats as s, idx (idx)}
				<div
					class="rounded-[14px] border border-[var(--c-border-soft)] p-3.5"
					style="background:var(--c-bg-card)"
				>
					<div
						class="mb-1.5 font-display leading-none font-extrabold tracking-[-0.5px]"
						style="font-size:26px;color:{accent}"
					>
						{s.valor}
					</div>
					<div class="text-[11.5px] leading-snug" style="color:var(--c-text-secondary)">
						{s.label}
					</div>
				</div>
			{/each}
		</div>

		<!-- ── DESTACADOS ── -->
		{#if destacados().length > 0}
			<section class="mt-10">
				<div class="mb-4">
					<div
						class="mb-1.5 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Lo más pedido
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						Empieza por aquí
					</h2>
					<p class="mt-1.5 text-sm leading-relaxed" style="color:var(--c-text-secondary)">
						Lo que nuestros clientes vuelven a pedir. Tap para agregar al carrito.
					</p>
				</div>
				<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
					{#each destacados() as p, i (p.id)}
						{@const oferta = ofertas.find((o) => o.productId === p.id)}
						{@const precio = oferta ? oferta.dealPrice : p.price}
						{@const isFav = favoritos.isFavorito(p.id)}
						<div
							class="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--c-border-soft)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
							style="background:var(--c-bg-card)"
						>
							<!-- Image zone -->
							<div
								class="relative flex items-center justify-center"
								style="height:120px;background:{tienda.bannerGradient}"
							>
								<div class="text-[56px] drop-shadow">{p.emoji}</div>
								{#if i === 0}
									<div
										class="absolute top-2 left-2 rounded-lg px-2 py-1 font-mono text-[10.5px] font-extrabold tracking-wide text-white uppercase shadow"
										style="background:{accent}"
									>
										★ Top
									</div>
								{:else if oferta}
									<div
										class="absolute top-2 left-2 rounded-lg bg-[var(--c-error)] px-2 py-1 text-[10.5px] font-bold text-white"
									>
										-{Math.round((1 - oferta.dealPrice / oferta.originalPrice) * 100)}%
									</div>
								{/if}
								<!-- Heart -->
								<button
									onclick={(e) => {
										e.stopPropagation();
										favoritos.toggle(p.id);
									}}
									class="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md"
									style="background:rgba(255,255,255,.92);color:{isFav
										? '#DC2626'
										: 'var(--c-text-muted)'}"
								>
									<Icon name={isFav ? 'heartFill' : 'heart'} size={14} />
								</button>
							</div>
							<!-- Content -->
							<div class="flex flex-1 flex-col gap-1.5 p-3">
								<h4 class="font-display text-[13.5px] leading-tight font-bold">{p.name}</h4>
								{#if p.description}
									<p class="truncate text-[11px] leading-snug" style="color:var(--c-text-muted)">
										{p.description}
									</p>
								{/if}
								<div class="flex-1" />
								<div class="mt-1.5 flex items-center justify-between">
									<div>
										{#if oferta}
											<div
												class="font-mono text-[11px] line-through"
												style="color:var(--c-text-muted)"
											>
												{fmtCOP(oferta.originalPrice)}
											</div>
										{/if}
										<div
											class="font-display font-extrabold"
											style="font-size:17px;color:{oferta
												? 'var(--c-error)'
												: 'var(--c-text-primary)'}"
										>
											{fmtCOP(precio)}
										</div>
									</div>
									{#if p.stock === 0}
										<span
											class="rounded-lg px-2.5 py-1 text-[11px] font-bold"
											style="background:var(--c-error-light);color:var(--c-error)">Agotado</span
										>
									{:else}
										<button
											onclick={() => onOpenProduct(p)}
											class="flex items-center gap-1 rounded-[10px] px-3 py-2 text-[12px] font-bold text-white shadow"
											style="background:{accent};box-shadow:0 4px 14px {accent}55"
											disabled={!isOpen}
										>
											<Icon name="plus" size={14} strokeWidth={2.5} />
											Agregar
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── OFERTAS ── -->
		{#if ofertas.length > 0}
			<section class="mt-11">
				<div class="mb-4">
					<div
						class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Aprovecha ya
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						Ofertas que terminan pronto
					</h2>
				</div>
				<div class="flex flex-col gap-3">
					{#each ofertas as o (o.id)}
						{@const p = productos.find((pr) => pr.id === o.productId)}
						{#if p}
							{@const disc = Math.round((1 - o.dealPrice / o.originalPrice) * 100)}
							<div
								class="flex flex-wrap items-center gap-3.5 rounded-[14px] border border-[var(--c-border-soft)] p-3.5"
								style="background:var(--c-bg-card);border-left:4px solid var(--c-error)"
							>
								<div
									class="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-xl text-[36px]"
									style="background:{tienda.bannerGradient}"
								>
									{p.emoji}
								</div>
								<div class="min-w-[160px] flex-1">
									<div class="mb-1.5 flex flex-wrap items-center gap-2">
										<Badge variant="error"><Icon name="fire" size={11} /> -{disc}%</Badge>
										<CountdownPill finishAt={o.finishAt} />
										<span
											class="font-mono text-[10.5px] font-semibold tracking-[1px] uppercase"
											style="color:var(--c-text-muted)">{o.label}</span
										>
									</div>
									<div class="mb-1 font-display text-[15px] font-bold">{p.name}</div>
									<div class="flex items-baseline gap-2">
										<span class="font-mono text-[17px] font-extrabold" style="color:var(--c-error)"
											>{fmtCOP(o.dealPrice)}</span
										>
										<span
											class="font-mono text-[12px] line-through"
											style="color:var(--c-text-muted)">{fmtCOP(o.originalPrice)}</span
										>
										{#if o.dealStock <= 5}
											<span class="text-[11px] font-bold" style="color:var(--c-error)"
												>· solo {o.dealStock} disponibles</span
											>
										{/if}
									</div>
								</div>
								<Button variant="brand" size="sm" onclick={() => onOpenProduct(p)}>Agregar</Button>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── PILLARS ── -->
		{#if pillars.length > 0}
			<section class="mt-11">
				<div class="mb-4">
					<div
						class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Por qué con nosotros
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						Lo que nos define
					</h2>
				</div>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
					{#each pillars as pillar, idx (idx)}
						<div
							class="rounded-[14px] border border-[var(--c-border-soft)] p-4"
							style="background:var(--c-bg-card)"
						>
							<div
								class="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px]"
								style="background:{accent}18;color:{accent}"
							>
								<Icon name={pillar.icon} size={18} />
							</div>
							<h4 class="mb-1 font-display text-[14px] leading-snug font-bold">{pillar.titulo}</h4>
							<p class="text-[12.5px] leading-relaxed" style="color:var(--c-text-secondary)">
								{pillar.desc}
							</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── CATÁLOGO COMPLETO ── -->
		<section class="mt-11" id="tl-catalogo">
			<div class="mb-4">
				<div
					class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
					style="color:{accent}"
				>
					Catálogo completo
				</div>
				<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
					{tienda.category === 'food' ? 'Nuestro menú' : 'Todo lo que tenemos'}
				</h2>
				<p class="mt-1 text-sm" style="color:var(--c-text-secondary)">
					{productos.length} productos · Actualizado al día
				</p>
			</div>
			{#if productos.length === 0}
				<div class="py-14 text-center" style="color:var(--c-text-muted)">
					<div class="mb-3 text-4xl">📦</div>
					<h3 class="font-display text-lg font-bold">Aún no hay productos</h3>
					<p class="mt-1 text-sm">Esta tienda está armando su catálogo.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-4">
					{#each productos as p (p.id)}
						{@const isFav = favoritos.isFavorito(p.id)}
						<div
							class="cursor-pointer overflow-hidden rounded-[14px] border border-[var(--c-border-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
							style="background:var(--c-bg-card)"
						>
							<div
								class="relative flex items-center justify-center"
								style="height:100px;background:{tienda.bannerGradient}"
							>
								<div class="text-[50px] drop-shadow">{p.emoji}</div>
								<button
									onclick={(e) => {
										e.stopPropagation();
										favoritos.toggle(p.id);
									}}
									class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full"
									style="background:rgba(255,255,255,.9);color:{isFav
										? '#DC2626'
										: 'var(--c-text-muted)'}"
								>
									<Icon name={isFav ? 'heartFill' : 'heart'} size={12} />
								</button>
							</div>
							<div class="p-3">
								<h4 class="mb-1 font-display text-[13px] leading-tight font-bold">{p.name}</h4>
								{#if p.description}
									<p
										class="mb-2 truncate text-[11px] leading-snug"
										style="color:var(--c-text-muted)"
									>
										{p.description}
									</p>
								{/if}
								<div class="mt-2 flex items-center justify-between">
									<span class="font-mono text-[13.5px] font-bold">{fmtCOP(p.price)}</span>
									{#if p.stock === 0}
										<span
											class="rounded-lg px-2.5 py-1 text-[11px] font-bold"
											style="background:var(--c-error-light);color:var(--c-error)">Agotado</span
										>
									{:else}
										<button
											onclick={() => onOpenProduct(p)}
											class="flex h-8 w-8 items-center justify-center rounded-[8px] text-white shadow"
											style="background:{accent};box-shadow:0 4px 14px {accent}55"
											disabled={!isOpen}
										>
											<Icon name="plus" size={16} strokeWidth={2.5} />
										</button>
									{/if}
								</div>
								{#if p.stock !== undefined && p.stock > 0 && p.stock <= 3}
									<div class="mt-1.5 text-[11px] font-semibold" style="color:var(--c-warning)">
										⚠️ Solo {p.stock}
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- ── GALERÍA ── -->
		{#if galeria.length > 0}
			<section class="mt-11">
				<div class="mb-4">
					<div
						class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Detrás de cámaras
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Así trabajamos</h2>
				</div>
				<div class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
					{#each galeria as g, idx (idx)}
						<div
							class="relative flex items-end overflow-hidden rounded-[14px] border"
							style="height:140px;background:{g.tono};border-color:rgba(0,0,0,.1);background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 14px)"
						>
							<div
								class="m-2 rounded-lg px-2 py-1 font-mono text-[11px] font-semibold"
								style="background:rgba(255,255,255,.9);color:{accent}"
							>
								<span style="opacity:.5">img · </span>{g.label}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── RESEÑAS ── -->
		{#if resenas.length > 0}
			<section class="mt-11">
				<div class="mb-4">
					<div
						class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Lo que dicen quienes ya compraron
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						{tienda.rating} de 5
						{#if tienda.ratingSummary}· {tienda.ratingSummary.total.toLocaleString('es-CO')} reseñas{/if}
					</h2>
				</div>
				{#if tienda.ratingSummary}
					{@const rs = tienda.ratingSummary}
					<div
						class="mb-5 rounded-2xl border border-[var(--c-border-soft)] p-4"
						style="background:var(--c-bg-card)"
					>
						<div class="grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr]">
							<div class="py-2 text-center">
								<div class="font-display text-5xl font-extrabold">{rs.average.toFixed(1)}</div>
								<div class="mt-2 flex justify-center gap-0.5">
									{#each [1, 2, 3, 4, 5] as s (s)}
										<span
											style="font-size:18px;color:{s <= Math.round(rs.average)
												? '#F59E0B'
												: 'var(--c-border)'}">★</span
										>
									{/each}
								</div>
								<div class="mt-1.5 text-[12px]" style="color:var(--c-text-muted)">
									Basado en {rs.total.toLocaleString('es-CO')} reseñas
								</div>
							</div>
							<div class="flex flex-col gap-1.5">
								{#each [5, 4, 3, 2, 1] as stars (stars)}
									{@const n = rs.distribution[stars] ?? 0}
									{@const pct = rs.total ? (n / rs.total) * 100 : 0}
									<div class="flex items-center gap-2.5 text-[12px]">
										<span class="w-4" style="color:var(--c-text-muted)">{stars}★</span>
										<div
											class="h-[7px] flex-1 overflow-hidden rounded-full"
											style="background:var(--c-bg-secondary)"
										>
											<div
												class="h-full rounded-full"
												style="width:{pct}%;background:#F59E0B"
											></div>
										</div>
										<span class="w-8 text-right" style="color:var(--c-text-muted)">{n}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					{#each resenas.slice(0, 4) as r (r.id)}
						<div
							class="rounded-2xl border border-[var(--c-border-soft)] p-3.5"
							style="background:var(--c-bg-card)"
						>
							<div class="mb-2 flex items-start gap-2.5">
								<div
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
									style="background:{r.avatar}"
								>
									{r.userName
										.split(' ')
										.map((p: string) => p[0])
										.slice(0, 2)
										.join('')}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex flex-wrap items-center gap-2">
										<span class="text-[13px] font-bold">{r.userName}</span>
										<span class="text-[11px]" style="color:var(--c-text-muted)">· {r.date}</span>
									</div>
									<div class="mt-0.5 flex gap-0.5">
										{#each [1, 2, 3, 4, 5] as s (s)}
											<span
												style="font-size:12px;color:{s <= r.rating ? '#F59E0B' : 'var(--c-border)'}"
												>★</span
											>
										{/each}
									</div>
								</div>
								{#if r.photo}
									<div
										class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-2xl"
										style="background:var(--c-bg-secondary)"
									>
										{r.photo}
									</div>
								{/if}
							</div>
							<p class="mb-2.5 text-[13px] leading-relaxed">{r.text}</p>
							{#if r.reply}
								<div
									class="mb-2 rounded-[10px] border-l-[3px] p-2.5"
									style="background:var(--c-bg-secondary);border-color:{accent}"
								>
									<div
										class="mb-1 text-[11px] font-bold tracking-wider uppercase"
										style="color:{accent}"
									>
										↩ Respuesta · {r.reply.date}
									</div>
									<div class="text-[12.5px] leading-relaxed">{r.reply.text}</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── FAQ ── -->
		{#if faqs.length > 0}
			<section class="mt-11">
				<div class="mb-4">
					<div
						class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
						style="color:{accent}"
					>
						Preguntas frecuentes
					</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						Lo que más nos preguntan
					</h2>
				</div>
				<div class="flex flex-col gap-2">
					{#each faqs as faq, i (i)}
						<div
							class="overflow-hidden rounded-[14px] border border-[var(--c-border-soft)]"
							style="background:var(--c-bg-card)"
						>
							<button
								onclick={() => (faqOpen = faqOpen === i ? null : i)}
								class="flex w-full items-center gap-3 p-4 text-left"
							>
								<span class="flex-1 font-display text-[14px] leading-snug font-bold">{faq.q}</span>
								<span
									class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
									style="background:{faqOpen === i
										? accent
										: 'var(--c-bg-secondary)'};color:{faqOpen === i
										? '#fff'
										: accent};transform:{faqOpen === i ? 'rotate(180deg)' : 'none'}"
								>
									<Icon name="chevronDown" size={14} />
								</span>
							</button>
							{#if faqOpen === i}
								<div
									class="px-4 pb-4 text-[13.5px] leading-relaxed"
									style="color:var(--c-text-secondary)"
								>
									{faq.a}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── UBICACIÓN / HORARIO / PAGOS ── -->
		<section class="mt-11">
			<div class="mb-4">
				<div
					class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
					style="color:{accent}"
				>
					Encuéntranos
				</div>
				<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
					Ubicación, horario y pagos
				</h2>
			</div>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
				<!-- Map placeholder -->
				<div
					class="relative overflow-hidden rounded-[14px] border border-[var(--c-border-soft)]"
					style="min-height:180px;background:var(--c-bg-card);background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.025) 0,rgba(0,0,0,.025) 1px,transparent 1px,transparent 24px),repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0,rgba(0,0,0,.025) 1px,transparent 1px,transparent 24px)"
				>
					<div
						class="absolute top-3 left-3 rounded-lg border border-[var(--c-border-soft)] px-3 py-1.5 font-mono text-[11px] font-semibold"
						style="background:var(--c-bg-card);color:var(--c-text-muted)"
					>
						map · {tienda.location}
					</div>
					<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-[50%_50%_50%_0]"
							style="background:{accent};transform:rotate(-45deg)"
						>
							<span style="transform:rotate(45deg);font-size:16px">{tienda.emoji}</span>
						</div>
					</div>
				</div>
				<!-- Info rows -->
				<div class="flex flex-col gap-2.5">
					{#each [{ icon: 'location', label: 'Ubicación', value: tienda.location }, { icon: 'clock', label: 'Horario', value: tienda.hours }, { icon: 'credit', label: 'Pagos', value: tienda.paymentMethods.join(' · ') }] as row, idx (idx)}
						<div
							class="flex gap-3 rounded-[14px] border border-[var(--c-border-soft)] p-3.5"
							style="background:var(--c-bg-card)"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
								style="background:{accent}18;color:{accent}"
							>
								<Icon name={row.icon} size={16} />
							</div>
							<div>
								<div
									class="mb-0.5 text-[11px] font-bold tracking-[1px] uppercase"
									style="color:var(--c-text-muted)"
								>
									{row.label}
								</div>
								<div class="text-[13px] leading-snug font-medium">{row.value}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- ── CTA FINAL ── -->
		<section class="mt-11">
			<div
				class="overflow-hidden rounded-[22px] text-white"
				style="padding:clamp(24px,4vw,40px);background:linear-gradient(135deg,{accent} 0%,{accent}cc 100%);display:flex;flex-direction:column;gap:16px"
			>
				<div class="md:flex md:items-center md:justify-between md:gap-6">
					<div class="flex-1">
						<div
							class="mb-1.5 font-mono text-[11px] font-bold tracking-[1.5px] uppercase opacity-85"
						>
							¿Listo para pedir?
						</div>
						<h3
							class="font-display leading-[1.2] font-extrabold tracking-[-0.4px] text-balance"
							style="font-size:clamp(20px,3vw,26px)"
						>
							{tagline}
						</h3>
						<p class="mt-2 max-w-md text-[13.5px] leading-relaxed opacity-90">
							Sigue la tienda para enterarte primero cuando lancemos algo nuevo.
						</p>
					</div>
					<div class="mt-4 flex flex-wrap gap-2.5 md:mt-0">
						<button
							onclick={scrollToCatalogo}
							class="flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold shadow-[0_8px_24px_rgba(0,0,0,.18)]"
							style="background:#fff;color:{accent}"
						>
							Ver catálogo <Icon name="arrowRight" size={18} />
						</button>
						<button
							onclick={() => (siguiendo = true)}
							class="flex items-center gap-2 rounded-xl border border-white/50 px-5 py-3.5 text-[14px] font-bold"
							style="background:rgba(255,255,255,.2);color:#fff"
						>
							<Icon name="heart" size={16} /> Seguir
						</button>
					</div>
				</div>
			</div>
		</section>
	</div>

	<!-- ── STICKY MOBILE CTA ── -->
	<div
		class="fixed right-0 left-0 z-50 flex gap-2 border-t border-[var(--c-border-soft)] px-4 py-2.5 md:hidden"
		style="bottom:70px;background:var(--c-bg-card);box-shadow:0 -4px 20px rgba(0,0,0,.06)"
	>
		<button
			class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
			style="background:var(--c-bg-secondary)"
		>
			<Icon name="chat" size={20} />
		</button>
		<button
			onclick={scrollToCatalogo}
			class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white"
			style="background:{accent};box-shadow:0 4px 18px {accent}55"
		>
			<Icon name="store" size={16} />
			Ver catálogo
		</button>
	</div>
</div>
