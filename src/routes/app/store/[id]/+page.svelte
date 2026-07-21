<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		getStore, getStoreProducts, getStoreDeals, getStoreReviews, getCategory,
		getServiciosDe, isServiceStore,
		type Product, type Store,
	} from '$lib/data/mock';
	import { cart, toast } from '$lib/stores/app.svelte';
	import { favoritos } from '$lib/stores/favoritos.svelte';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import CategoryBadge from '$lib/components/CategoryBadge.svelte';
	import CountdownPill from '$lib/components/CountdownPill.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import CustomizeModal, { type CartLineItem } from '$lib/components/CustomizeModal.svelte';
	import ServicioPerfil from '$lib/components/ServicioPerfil.svelte';

	const tiendaId = $derived($page.params.id ?? '');
	const tienda = $derived(getStore(tiendaId));
	const esServicio = $derived(isServiceStore(tienda));
	const productos = $derived(getStoreProducts(tiendaId));
	const ofertas = $derived(getStoreDeals(tiendaId));
	const resenas = $derived(getStoreReviews(tiendaId));
	const servicios = $derived(getServiciosDe(tiendaId));
	const accent = $derived(tienda.logoColor);
	const isOpen = $derived((tienda.status ?? 'abierto') === 'abierto');

	let siguiendo = $state(false);
	$effect(() => { siguiendo = tienda.following; });

	// Customize modal
	let customizeProduct = $state<Product | null>(null);
	let customizeOpen = $state(false);

	function openProducto(p: Product) {
		if (!isOpen) return;
		if (p.modifiers && p.modifiers.length > 0) {
			customizeProduct = p;
			customizeOpen = true;
		} else {
			cart.add({ productoId: p.id, tiendaId: tienda.id, precio: p.price });
			toast.show(`✓ ${p.name} agregado al carrito`);
		}
	}

	function onCustomizeConfirm(item: CartLineItem) {
		cart.add({ productoId: item.productoId, tiendaId: item.tiendaId, precio: item.precio, cantidad: item.cantidad, selecciones: item.selecciones, notas: item.notas });
		toast.show(`✓ ${customizeProduct?.name} agregado al carrito`);
	}

	// Landing helpers
	type Pillar = { icon: string; titulo: string; desc: string };
	type FaqItem = { q: string; a: string };
	type GaleriaItem = { label: string; tono: string };

	const CATEGORY_PILLARS: Record<string, Pillar[]> = {
		food:     [
			{ icon: 'fire',    titulo: 'Cocinamos al instante',     desc: 'Cada pedido se prepara fresco, nunca recalentado. Salimos en menos de 25 min.' },
			{ icon: 'heart',   titulo: 'Recetas de casa',           desc: 'Sin saborizantes industriales. Ingredientes que reconocerías en la despensa de tu abuela.' },
			{ icon: 'truck',   titulo: 'Entrega caliente',          desc: 'Bolsa térmica + ruta optimizada. Llega a la temperatura justa.' },
		],
		market:   [
			{ icon: 'sparkle', titulo: 'Cosechado del día',          desc: 'Llega a la plaza temprano y sale a tu casa antes del mediodía.' },
			{ icon: 'heart',   titulo: 'Pagamos justo al productor', desc: 'Trabajamos directo con campesinos. Menos intermediarios, mejor precio.' },
			{ icon: 'check',   titulo: 'Garantía de frescura',       desc: 'Si algo no llega en óptimas condiciones, reponemos o reembolsamos sin discusión.' },
		],
		fashion:  [
			{ icon: 'sparkle', titulo: 'Producción limitada',        desc: 'Cada drop se hace en lotes pequeños. Si te lo perdiste, no vuelve.' },
			{ icon: 'heart',   titulo: 'Hecho con propósito',        desc: 'Confeccionado por talleres locales con condiciones justas.' },
			{ icon: 'check',   titulo: 'Cambios gratis 30 días',     desc: 'Si la talla no es la tuya, cambio sin costo. Devolvemos el envío.' },
		],
		tech:     [
			{ icon: 'shield',  titulo: 'Garantía de 60 días',        desc: 'Cualquier falla relacionada con la reparación, la cubrimos sin costo.' },
			{ icon: 'check',   titulo: 'Repuestos originales',        desc: 'Trabajamos con repuestos OEM o de calidad equivalente.' },
			{ icon: 'timer',   titulo: 'Diagnóstico en 15 min',      desc: 'Llega, te diagnosticamos en vivo y te decimos qué tiene y cuánto cuesta.' },
		],
		beauty:   [
			{ icon: 'heart',   titulo: 'Sin parabenos ni sulfatos',  desc: 'Formulaciones limpias, sin ingredientes controvertidos.' },
			{ icon: 'sparkle', titulo: 'Probado dermatológicamente', desc: 'Cada producto pasa por pruebas en dermatólogos colombianos antes de salir.' },
			{ icon: 'check',   titulo: 'Cruelty-free certificado',   desc: 'No probamos en animales y nuestros proveedores tampoco.' },
		],
		crafts:   [
			{ icon: 'sparkle', titulo: 'Pieza única',                desc: 'Cada artesanía es irrepetible. Tu mochila no será igual a ninguna otra.' },
			{ icon: 'heart',   titulo: 'Comercio justo',             desc: 'El 70% del precio va directo a la artesana.' },
			{ icon: 'check',   titulo: 'Tradición ancestral',        desc: 'Técnicas transmitidas por generaciones, certificadas por el Ministerio de Cultura.' },
		],
		services: [
			{ icon: 'phone',   titulo: 'Atención 24/7',              desc: 'Estamos disponibles cuando lo necesites, no solo en horario de oficina.' },
			{ icon: 'check',   titulo: 'Sin cobros sorpresa',         desc: 'Te decimos el precio antes de hacer cualquier cosa. Si cambia, te avisamos.' },
			{ icon: 'shield',  titulo: 'Trabajo garantizado',         desc: 'Si algo falla por nuestra reparación, volvemos sin costo durante 30 días.' },
		],
	};

	const CATEGORY_FAQS: Record<string, FaqItem[]> = {
		food:    [
			{ q: '¿Cuánto se demora el pedido?', a: 'Entre 30 y 45 minutos según tu zona. Los tiempos se actualizan en vivo cuando confirmas el pedido.' },
			{ q: '¿Hacen pedidos por anticipado?', a: 'Sí, puedes programar tu pedido hasta con 48 horas de anticipación desde el carrito.' },
			{ q: '¿Atienden eventos o pedidos grandes?', a: 'Sí, escríbenos por mensaje directo y coordinamos con un día de anticipación.' },
		],
		market:  [
			{ q: '¿Cómo seleccionan los productos?', a: 'Tenemos un equipo que escoge cada pieza a mano antes de empacarla.' },
			{ q: '¿Manejan productos orgánicos?', a: 'Sí, marcados con etiqueta. Vienen certificados directamente de fincas en Antioquia.' },
			{ q: '¿Hacen domicilios a oficinas?', a: 'Sí. También tenemos suscripción semanal de canastas a domicilio.' },
		],
		fashion: [
			{ q: '¿Cómo sé qué talla pedir?', a: 'En cada producto tienes guía de medidas. Si dudas, escríbenos por chat.' },
			{ q: '¿Puedo devolver una prenda?', a: 'Sí, hasta 30 días después de recibirla, sin estrenar y con etiquetas.' },
		],
		tech:    [
			{ q: '¿Cuánto se demora una reparación?', a: 'La mayoría queda el mismo día. Cambios de pantalla en 1 hora.' },
			{ q: '¿Si pierdo mis datos durante la reparación?', a: 'Antes de reparar te pedimos respaldo. También hacemos backup gratuito si lo solicitas.' },
		],
		beauty:  [
			{ q: '¿Tienen muestras antes de comprar?', a: 'Sí, en pedidos sobre $80.000 incluimos muestras gratuitas.' },
			{ q: '¿Cómo sé qué producto necesito?', a: 'Escríbenos por chat y te recomendamos sin presión de venta.' },
		],
		crafts:  [
			{ q: '¿Por qué cuesta más que las del mercado?', a: 'Porque cada pieza toma entre 15 y 30 días de tejido a mano por una artesana.' },
			{ q: '¿Puedo pedir una a la medida?', a: 'Sí, escríbenos. Las piezas a la medida toman 6-8 semanas.' },
		],
		services: [
			{ q: '¿Atienden emergencias en fin de semana?', a: 'Sí, con un recargo del 20% en horario no laboral.' },
			{ q: '¿Cuánto cuesta una visita técnica?', a: 'Visita y diagnóstico gratis. Solo cobramos si autorizas la reparación.' },
		],
	};

	const CATEGORY_GALERIA: Record<string, GaleriaItem[]> = {
		food:    [
			{ label: 'Plato del día emplatado',      tono: '#FED7AA' },
			{ label: 'Cocina abierta · al wok',      tono: '#FEF3C7' },
			{ label: 'Mesa del equipo · domingo',    tono: '#FFEDD5' },
			{ label: 'Empaque ecológico domicilio',  tono: '#FFE4E6' },
		],
		market:  [
			{ label: 'Frutas seleccionadas del día', tono: '#DCFCE7' },
			{ label: 'Canasta semanal lista',        tono: '#F0FDF4' },
			{ label: 'Café tostado en Quindío',      tono: '#FEF3C7' },
			{ label: 'Pan recién horneado',          tono: '#FED7AA' },
		],
		fashion: [
			{ label: 'Taller de confección',         tono: '#F3E8FF' },
			{ label: 'Drop temporada',               tono: '#EDE9FE' },
			{ label: 'Estampado a mano',             tono: '#FCE7F3' },
			{ label: 'Modelos locales · campaña',    tono: '#E0E7FF' },
		],
		tech:    [
			{ label: 'Mesa de reparación',           tono: '#DBEAFE' },
			{ label: 'Antes / después · pantalla',   tono: '#E0E7FF' },
			{ label: 'Limpieza profunda laptop',     tono: '#DCFCE7' },
			{ label: 'Stock de repuestos OEM',       tono: '#FEF3C7' },
		],
		beauty:  [
			{ label: 'Producto en piel · campaña',   tono: '#FCE7F3' },
			{ label: 'Línea skincare desplegada',    tono: '#FDF2F8' },
			{ label: 'Laboratorio · formulación',    tono: '#F3E8FF' },
			{ label: 'Tonos del labial mate',        tono: '#FFE4E6' },
		],
		crafts:  [
			{ label: 'Manos tejiendo mochila',       tono: '#FED7AA' },
			{ label: 'Detalle del nudo Wayúu',       tono: '#FEF3C7' },
			{ label: 'Comunidad · La Guajira',       tono: '#FCE7F3' },
			{ label: 'Pieza terminada en exhibición',tono: '#E0E7FF' },
		],
		services:[
			{ label: 'Equipo en uniforme',           tono: '#FEF3C7' },
			{ label: 'Herramientas certificadas',    tono: '#FED7AA' },
			{ label: 'Servicio en domicilio',        tono: '#DBEAFE' },
		],
	};

	const pillars = $derived(
		tienda.landing?.pillars ?? CATEGORY_PILLARS[tienda.category] ?? CATEGORY_PILLARS.food
	);
	const faqs = $derived(
		tienda.landing?.faqs ?? CATEGORY_FAQS[tienda.category] ?? []
	);
	const galeria = $derived(
		tienda.landing?.galeria ?? CATEGORY_GALERIA[tienda.category] ?? CATEGORY_GALERIA.food
	);
	const tagline = $derived(
		tienda.landing?.tagline ?? (() => {
			const map: Record<string, string> = {
				food: `${tienda.name} — Sabores que se sienten en casa`,
				market: 'Lo más fresco, del campo a tu casa',
				fashion: 'Diseño local, piezas que cuentan algo',
				tech: 'Reparamos lo que otros desechan',
				beauty: 'Belleza honesta, sin compromisos',
				crafts: 'Manos que tejen historia',
				services: '24/7 cuando lo necesitas',
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
	const stats = $derived([
		{ valor: String(productos.length), label: tienda.category === 'food' ? 'platos en menú' : 'productos' },
		{ valor: tienda.rating.toFixed(1), label: 'calificación' },
		{ valor: ((tienda.ratingSummary?.total ?? 0) + 50).toLocaleString('es-CO'), label: 'pedidos entregados' },
		{ valor: tienda.category === 'food' ? '30 min' : tienda.category === 'market' ? '2 horas' : '1-3 días', label: 'tiempo de entrega' },
	]);

	// Destacados: productos con oferta primero, luego los demás
	const destacados = $derived(() => {
		const conOferta = productos.filter(p => ofertas.some(o => o.productId === p.id));
		const resto = productos.filter(p => !conOferta.find(x => x.id === p.id));
		return [...conOferta, ...resto].slice(0, 4);
	});

	// FAQ accordion
	let faqOpen = $state<number | null>(null);

	// Scroll to catalog
	function scrollToCatalogo() {
		document.getElementById('tl-catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	function goBack() { history.back(); }
</script>

{#if esServicio}
	<ServicioPerfil {tienda} {servicios} onBack={goBack}/>
{:else}
<div class="max-w-5xl mx-auto pb-32 md:pb-24">

	<!-- ── HERO ── -->
	<div class="relative overflow-hidden rounded-b-[22px] md:rounded-b-[28px]"
		style="height:{undefined}; background:{tienda.bannerGradient}; min-height:260px; height:clamp(260px,30vw,360px)">
		<div class="absolute inset-0"
			style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 14px)"/>
		<!-- Decorative circle -->
		<div class="absolute rounded-full"
			style="width:300px;height:300px;background:rgba(255,255,255,.08);right:-60px;top:-60px;"/>
		<!-- Emoji -->
		<div class="absolute right-5 md:right-14 bottom-4 md:bottom-8 select-none drop-shadow-[0_12px_30px_rgba(0,0,0,.25)]"
			style="font-size:clamp(90px,14vw,150px);line-height:1">{tienda.emoji}</div>

		<!-- Tagline block -->
		<div class="absolute left-6 md:left-14 bottom-9 md:bottom-12 right-[140px] md:right-[50%]">
			<div class="inline-block mb-3 px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-[1.2px]"
				style="background:rgba(255,255,255,.92);color:{accent}">
				{getCategory(tienda.category).label}
			</div>
			<h1 class="font-display text-white font-extrabold leading-[1.1] tracking-[-0.5px] text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,.25)]"
				style="font-size:clamp(20px,3.5vw,36px);text-shadow:0 4px 24px rgba(0,0,0,.25)">
				{tagline}
			</h1>
		</div>

		<!-- Back -->
		<button onclick={goBack}
			class="absolute top-4 left-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)">
			<Icon name="arrowLeft" size={18}/>
		</button>
		<!-- Share -->
		<button class="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
			style="background:rgba(255,255,255,.95);color:var(--c-text-primary)">
			<Icon name="share" size={18}/>
		</button>
	</div>

	<div class="px-5 md:px-6">

		<!-- ── HEADER CARD (overlapping) ── -->
		<div class="-mt-10 rounded-[20px] p-5 border border-[var(--c-border-soft)] shadow-[var(--shadow-md)] relative"
			style="background:var(--c-bg-card)">
			<div class="flex gap-3.5 items-start flex-wrap">
				<!-- Logo (pulled up) -->
				<div class="-mt-10">
					<div class="p-0.5 rounded-full shadow-[var(--shadow-sm)]" style="background:var(--c-bg-card)">
						<TiendaLogo tienda={tienda} size={72}/>
					</div>
				</div>
				<!-- Info -->
				<div class="flex-1 min-w-[200px]">
					<div class="flex gap-2 mb-1.5 flex-wrap">
						<CategoryBadge catKey={tienda.category}/>
						{#if isOpen}
							<span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
								style="background:var(--c-success-light);color:var(--c-success)">
								<span class="w-[6px] h-[6px] rounded-full bg-current"/>
								Abierto ahora
							</span>
						{:else}
							<span class="px-2.5 py-1 rounded-full text-[11px] font-bold"
								style="background:var(--c-error-light);color:var(--c-error)">Cerrado</span>
						{/if}
					</div>
					<h2 class="font-display text-2xl font-extrabold mb-1 tracking-[-0.3px]">{tienda.name}</h2>
					<p class="text-[13.5px] leading-relaxed mb-2.5" style="color:var(--c-text-secondary)">{tienda.description}</p>
					<div class="flex gap-4 flex-wrap text-xs" style="color:var(--c-text-secondary)">
						<span class="flex items-center gap-1">
							<Icon name="starFill" size={13} color="var(--c-accent)"/>
							<strong>{tienda.rating}</strong>
							{#if tienda.ratingSummary}<span style="color:var(--c-text-muted)">({tienda.ratingSummary.total})</span>{/if}
						</span>
						<span class="flex items-center gap-1"><Icon name="user" size={12}/>{tienda.followers.toLocaleString()} siguiendo</span>
						<span class="flex items-center gap-1"><Icon name="location" size={12}/>{tienda.location}</span>
					</div>
				</div>
			</div>

			<!-- Hero label -->
			{#if heroLabel}
				<div class="mt-4 p-3 rounded-xl border flex gap-2.5 items-center text-[12.5px] font-semibold leading-relaxed"
					style="background:{ofertas.length > 0 ? 'var(--c-error-light)' : accent + '0e'};border-color:{ofertas.length > 0 ? 'var(--c-error)' : accent}55;color:{ofertas.length > 0 ? 'var(--c-error)' : 'var(--c-text-primary)'}">
					{#if ofertas.length === 0}<Icon name="sparkle" size={16} color={accent}/>{/if}
					<span>{heroLabel}</span>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex gap-2 mt-5 flex-wrap">
				<button onclick={scrollToCatalogo}
					class="flex-1 md:flex-none px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
					style="background:{accent};box-shadow:0 4px 18px {accent}55;min-width:160px">
					<Icon name="store" size={16}/>
					Ver catálogo
				</button>
				<button class="px-4 py-3 rounded-xl font-semibold text-sm border flex items-center gap-2"
					style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)">
					<Icon name="chat" size={16}/>
					Mensaje
				</button>
				<button onclick={() => (siguiendo = !siguiendo)}
					class="px-4 py-3 rounded-xl font-semibold text-sm border flex items-center gap-2"
					style="background:{siguiendo ? 'var(--c-bg-secondary)' : 'var(--c-bg-card)'};border-color:var(--c-border);color:var(--c-text-primary)">
					<Icon name={siguiendo ? 'check' : 'heart'} size={16}/>
					{siguiendo ? 'Siguiendo' : 'Seguir'}
				</button>
			</div>
		</div>

		<!-- ── STATS ── -->
		<div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5">
			{#each stats as s}
				<div class="p-3.5 rounded-[14px] border border-[var(--c-border-soft)]" style="background:var(--c-bg-card)">
					<div class="font-display font-extrabold leading-none tracking-[-0.5px] mb-1.5" style="font-size:26px;color:{accent}">{s.valor}</div>
					<div class="text-[11.5px] leading-snug" style="color:var(--c-text-secondary)">{s.label}</div>
				</div>
			{/each}
		</div>

		<!-- ── DESTACADOS ── -->
		{#if destacados().length > 0}
			<section class="mt-10">
				<div class="mb-4">
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style="color:{accent}">Lo más pedido</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Empieza por aquí</h2>
					<p class="text-sm mt-1.5 leading-relaxed" style="color:var(--c-text-secondary)">Lo que nuestros clientes vuelven a pedir. Tap para agregar al carrito.</p>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
					{#each destacados() as p, i}
						{@const oferta = ofertas.find(o => o.productId === p.id)}
						{@const precio = oferta ? oferta.dealPrice : p.price}
						{@const isFav = favoritos.isFavorito(p.id)}
						<div class="rounded-2xl border border-[var(--c-border-soft)] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-md)] cursor-pointer"
							style="background:var(--c-bg-card)">
							<!-- Image zone -->
							<div class="relative flex items-center justify-center" style="height:120px;background:{tienda.bannerGradient}">
								<div class="text-[56px] drop-shadow">{p.emoji}</div>
								{#if i === 0}
									<div class="absolute top-2 left-2 px-2 py-1 rounded-lg text-white text-[10.5px] font-extrabold font-mono uppercase tracking-wide shadow"
										style="background:{accent}">★ Top</div>
								{:else if oferta}
									<div class="absolute top-2 left-2 px-2 py-1 rounded-lg bg-[var(--c-error)] text-white text-[10.5px] font-bold">
										-{Math.round((1 - oferta.dealPrice/oferta.originalPrice)*100)}%
									</div>
								{/if}
								<!-- Heart -->
								<button
									onclick={(e) => { e.stopPropagation(); favoritos.toggle(p.id); }}
									class="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
									style="background:rgba(255,255,255,.92);color:{isFav ? '#DC2626' : 'var(--c-text-muted)'}">
									<Icon name={isFav ? 'heartFill' : 'heart'} size={14}/>
								</button>
							</div>
							<!-- Content -->
							<div class="p-3 flex flex-col gap-1.5 flex-1">
								<h4 class="font-display text-[13.5px] font-bold leading-tight">{p.name}</h4>
								{#if p.description}
									<p class="text-[11px] leading-snug truncate" style="color:var(--c-text-muted)">{p.description}</p>
								{/if}
								<div class="flex-1"/>
								<div class="flex items-center justify-between mt-1.5">
									<div>
										{#if oferta}
											<div class="font-mono text-[11px] line-through" style="color:var(--c-text-muted)">{fmtCOP(oferta.originalPrice)}</div>
										{/if}
										<div class="font-display font-extrabold" style="font-size:17px;color:{oferta ? 'var(--c-error)' : 'var(--c-text-primary)'}">
											{fmtCOP(precio)}
										</div>
									</div>
									{#if p.stock === 0}
										<span class="text-[11px] font-bold px-2.5 py-1 rounded-lg"
											style="background:var(--c-error-light);color:var(--c-error)">Agotado</span>
									{:else}
										<button onclick={() => openProducto(p)}
											class="px-3 py-2 rounded-[10px] text-white text-[12px] font-bold flex items-center gap-1 shadow"
											style="background:{accent};box-shadow:0 4px 14px {accent}55"
											disabled={!isOpen}>
											<Icon name="plus" size={14} strokeWidth={2.5}/>
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
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Aprovecha ya</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Ofertas que terminan pronto</h2>
				</div>
				<div class="flex flex-col gap-3">
					{#each ofertas as o}
						{@const p = productos.find(pr => pr.id === o.productId)}
						{#if p}
							{@const disc = Math.round((1 - o.dealPrice / o.originalPrice) * 100)}
							<div class="flex items-center gap-3.5 p-3.5 rounded-[14px] border border-[var(--c-border-soft)] flex-wrap"
								style="background:var(--c-bg-card);border-left:4px solid var(--c-error)">
								<div class="w-[70px] h-[70px] rounded-xl flex items-center justify-center text-[36px] shrink-0"
									style="background:{tienda.bannerGradient}">{p.emoji}</div>
								<div class="flex-1 min-w-[160px]">
									<div class="flex items-center gap-2 mb-1.5 flex-wrap">
										<Badge variant="error"><Icon name="fire" size={11}/> -{disc}%</Badge>
										<CountdownPill finishAt={o.finishAt}/>
										<span class="font-mono text-[10.5px] font-semibold uppercase tracking-[1px]" style="color:var(--c-text-muted)">{o.label}</span>
									</div>
									<div class="font-display text-[15px] font-bold mb-1">{p.name}</div>
									<div class="flex items-baseline gap-2">
										<span class="font-mono text-[17px] font-extrabold" style="color:var(--c-error)">{fmtCOP(o.dealPrice)}</span>
										<span class="font-mono text-[12px] line-through" style="color:var(--c-text-muted)">{fmtCOP(o.originalPrice)}</span>
										{#if o.dealStock <= 5}
											<span class="text-[11px] font-bold" style="color:var(--c-error)">· solo {o.dealStock} disponibles</span>
										{/if}
									</div>
								</div>
								<Button variant="brand" size="sm" onclick={() => openProducto(p)}>Agregar</Button>
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
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Por qué con nosotros</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Lo que nos define</h2>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					{#each pillars as pillar}
						<div class="p-4 rounded-[14px] border border-[var(--c-border-soft)]" style="background:var(--c-bg-card)">
							<div class="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
								style="background:{accent}18;color:{accent}">
								<Icon name={pillar.icon} size={18}/>
							</div>
							<h4 class="font-display text-[14px] font-bold mb-1 leading-snug">{pillar.titulo}</h4>
							<p class="text-[12.5px] leading-relaxed" style="color:var(--c-text-secondary)">{pillar.desc}</p>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── CATÁLOGO COMPLETO ── -->
		<section class="mt-11" id="tl-catalogo">
			<div class="mb-4">
				<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Catálogo completo</div>
				<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
					{tienda.category === 'food' ? 'Nuestro menú' : 'Todo lo que tenemos'}
				</h2>
				<p class="text-sm mt-1" style="color:var(--c-text-secondary)">{productos.length} productos · Actualizado al día</p>
			</div>
			{#if productos.length === 0}
				<div class="text-center py-14" style="color:var(--c-text-muted)">
					<div class="text-4xl mb-3">📦</div>
					<h3 class="font-display font-bold text-lg">Aún no hay productos</h3>
					<p class="text-sm mt-1">Esta tienda está armando su catálogo.</p>
				</div>
			{:else}
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
					{#each productos as p}
						{@const isFav = favoritos.isFavorito(p.id)}
						<div class="rounded-[14px] border border-[var(--c-border-soft)] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] cursor-pointer"
							style="background:var(--c-bg-card)">
							<div class="relative flex items-center justify-center" style="height:100px;background:{tienda.bannerGradient}">
								<div class="text-[50px] drop-shadow">{p.emoji}</div>
								<button
									onclick={(e) => { e.stopPropagation(); favoritos.toggle(p.id); }}
									class="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
									style="background:rgba(255,255,255,.9);color:{isFav ? '#DC2626' : 'var(--c-text-muted)'}">
									<Icon name={isFav ? 'heartFill' : 'heart'} size={12}/>
								</button>
							</div>
							<div class="p-3">
								<h4 class="font-display text-[13px] font-bold mb-1 leading-tight">{p.name}</h4>
								{#if p.description}
									<p class="text-[11px] leading-snug mb-2 truncate" style="color:var(--c-text-muted)">{p.description}</p>
								{/if}
								<div class="flex items-center justify-between mt-2">
									<span class="font-mono text-[13.5px] font-bold">{fmtCOP(p.price)}</span>
									{#if p.stock === 0}
										<span class="text-[11px] font-bold px-2.5 py-1 rounded-lg"
											style="background:var(--c-error-light);color:var(--c-error)">Agotado</span>
									{:else}
										<button onclick={() => openProducto(p)}
											class="w-8 h-8 rounded-[8px] flex items-center justify-center text-white shadow"
											style="background:{accent};box-shadow:0 4px 14px {accent}55"
											disabled={!isOpen}>
											<Icon name="plus" size={16} strokeWidth={2.5}/>
										</button>
									{/if}
								</div>
								{#if p.stock !== undefined && p.stock > 0 && p.stock <= 3}
									<div class="text-[11px] font-semibold mt-1.5" style="color:var(--c-warning)">⚠️ Solo {p.stock}</div>
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
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Detrás de cámaras</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Así trabajamos</h2>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-2.5">
					{#each galeria as g}
						<div class="rounded-[14px] flex items-end overflow-hidden relative border"
							style="height:140px;background:{g.tono};border-color:rgba(0,0,0,.1);background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 14px)">
							<div class="m-2 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold"
								style="background:rgba(255,255,255,.9);color:{accent}">
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
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Lo que dicen quienes ya compraron</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">
						{tienda.rating} de 5
						{#if tienda.ratingSummary}· {tienda.ratingSummary.total.toLocaleString('es-CO')} reseñas{/if}
					</h2>
				</div>
				{#if tienda.ratingSummary}
					{@const rs = tienda.ratingSummary}
					<div class="p-4 rounded-2xl border border-[var(--c-border-soft)] mb-5" style="background:var(--c-bg-card)">
						<div class="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-5">
							<div class="text-center py-2">
								<div class="font-display text-5xl font-extrabold">{rs.average.toFixed(1)}</div>
								<div class="flex justify-center gap-0.5 mt-2">
									{#each [1,2,3,4,5] as s}
										<span style="font-size:18px;color:{s <= Math.round(rs.average) ? '#F59E0B' : 'var(--c-border)'}">★</span>
									{/each}
								</div>
								<div class="text-[12px] mt-1.5" style="color:var(--c-text-muted)">Basado en {rs.total.toLocaleString('es-CO')} reseñas</div>
							</div>
							<div class="flex flex-col gap-1.5">
								{#each [5,4,3,2,1] as stars}
									{@const n = rs.distribution[stars] ?? 0}
									{@const pct = rs.total ? (n / rs.total) * 100 : 0}
									<div class="flex items-center gap-2.5 text-[12px]">
										<span class="w-4" style="color:var(--c-text-muted)">{stars}★</span>
										<div class="flex-1 h-[7px] rounded-full overflow-hidden" style="background:var(--c-bg-secondary)">
											<div class="h-full rounded-full" style="width:{pct}%;background:#F59E0B"></div>
										</div>
										<span class="w-8 text-right" style="color:var(--c-text-muted)">{n}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					{#each resenas.slice(0, 4) as r}
						<div class="p-3.5 rounded-2xl border border-[var(--c-border-soft)]" style="background:var(--c-bg-card)">
							<div class="flex items-start gap-2.5 mb-2">
								<div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
									style="background:{r.avatar}">
									{r.userName.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 flex-wrap">
										<span class="text-[13px] font-bold">{r.userName}</span>
										<span class="text-[11px]" style="color:var(--c-text-muted)">· {r.date}</span>
									</div>
									<div class="flex gap-0.5 mt-0.5">
										{#each [1,2,3,4,5] as s}
											<span style="font-size:12px;color:{s <= r.rating ? '#F59E0B' : 'var(--c-border)'}">★</span>
										{/each}
									</div>
								</div>
								{#if r.photo}
									<div class="w-11 h-11 rounded-[10px] flex items-center justify-center text-2xl shrink-0"
										style="background:var(--c-bg-secondary)">{r.photo}</div>
								{/if}
							</div>
							<p class="text-[13px] leading-relaxed mb-2.5">{r.text}</p>
							{#if r.reply}
								<div class="p-2.5 rounded-[10px] border-l-[3px] mb-2"
									style="background:var(--c-bg-secondary);border-color:{accent}">
									<div class="text-[11px] font-bold uppercase tracking-wider mb-1" style="color:{accent}">
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
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Preguntas frecuentes</div>
					<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Lo que más nos preguntan</h2>
				</div>
				<div class="flex flex-col gap-2">
					{#each faqs as faq, i}
						<div class="rounded-[14px] border border-[var(--c-border-soft)] overflow-hidden" style="background:var(--c-bg-card)">
							<button onclick={() => faqOpen = faqOpen === i ? null : i}
								class="w-full text-left p-4 flex items-center gap-3">
								<span class="flex-1 text-[14px] font-bold font-display leading-snug">{faq.q}</span>
								<span class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all"
									style="background:{faqOpen === i ? accent : 'var(--c-bg-secondary)'};color:{faqOpen === i ? '#fff' : accent};transform:{faqOpen === i ? 'rotate(180deg)' : 'none'}">
									<Icon name="chevronDown" size={14}/>
								</span>
							</button>
							{#if faqOpen === i}
								<div class="px-4 pb-4 text-[13.5px] leading-relaxed" style="color:var(--c-text-secondary)">{faq.a}</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── UBICACIÓN / HORARIO / PAGOS ── -->
		<section class="mt-11">
			<div class="mb-4">
				<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Encuéntranos</div>
				<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">Ubicación, horario y pagos</h2>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3">
				<!-- Map placeholder -->
				<div class="rounded-[14px] border border-[var(--c-border-soft)] relative overflow-hidden"
					style="min-height:180px;background:var(--c-bg-card);background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.025) 0,rgba(0,0,0,.025) 1px,transparent 1px,transparent 24px),repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0,rgba(0,0,0,.025) 1px,transparent 1px,transparent 24px)">
					<div class="absolute top-3 left-3 px-3 py-1.5 rounded-lg border border-[var(--c-border-soft)] font-mono text-[11px] font-semibold"
						style="background:var(--c-bg-card);color:var(--c-text-muted)">
						map · {tienda.location}
					</div>
					<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<div class="w-10 h-10 rounded-[50%_50%_50%_0] flex items-center justify-center"
							style="background:{accent};transform:rotate(-45deg)">
							<span style="transform:rotate(45deg);font-size:16px">{tienda.emoji}</span>
						</div>
					</div>
				</div>
				<!-- Info rows -->
				<div class="flex flex-col gap-2.5">
					{#each [
						{ icon: 'location', label: 'Ubicación', value: tienda.location },
						{ icon: 'clock',    label: 'Horario',   value: tienda.hours },
						{ icon: 'credit',   label: 'Pagos',     value: tienda.paymentMethods.join(' · ') },
					] as row}
						<div class="flex gap-3 p-3.5 rounded-[14px] border border-[var(--c-border-soft)]" style="background:var(--c-bg-card)">
							<div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
								style="background:{accent}18;color:{accent}">
								<Icon name={row.icon} size={16}/>
							</div>
							<div>
								<div class="text-[11px] font-bold uppercase tracking-[1px] mb-0.5" style="color:var(--c-text-muted)">{row.label}</div>
								<div class="text-[13px] font-medium leading-snug">{row.value}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- ── CTA FINAL ── -->
		<section class="mt-11">
			<div class="rounded-[22px] text-white overflow-hidden"
				style="padding:clamp(24px,4vw,40px);background:linear-gradient(135deg,{accent} 0%,{accent}cc 100%);display:flex;flex-direction:column;gap:16px">
				<div class="md:flex md:items-center md:justify-between md:gap-6">
					<div class="flex-1">
						<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] opacity-85 mb-1.5">¿Listo para pedir?</div>
						<h3 class="font-display font-extrabold leading-[1.2] tracking-[-0.4px] text-balance" style="font-size:clamp(20px,3vw,26px)">{tagline}</h3>
						<p class="text-[13.5px] opacity-90 mt-2 leading-relaxed max-w-md">Sigue la tienda para enterarte primero cuando lancemos algo nuevo.</p>
					</div>
					<div class="flex gap-2.5 flex-wrap mt-4 md:mt-0">
						<button onclick={scrollToCatalogo}
							class="flex items-center gap-2 font-bold text-[15px] px-6 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.18)]"
							style="background:#fff;color:{accent}">
							Ver catálogo <Icon name="arrowRight" size={18}/>
						</button>
						<button onclick={() => (siguiendo = true)}
							class="flex items-center gap-2 font-bold text-[14px] px-5 py-3.5 rounded-xl border border-white/50"
							style="background:rgba(255,255,255,.2);color:#fff">
							<Icon name="heart" size={16}/> Seguir
						</button>
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- ── STICKY MOBILE CTA ── -->
	<div class="fixed left-0 right-0 flex gap-2 px-4 py-2.5 border-t border-[var(--c-border-soft)] z-50 md:hidden"
		style="bottom:70px;background:var(--c-bg-card);box-shadow:0 -4px 20px rgba(0,0,0,.06)">
		<button class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
			style="background:var(--c-bg-secondary)">
			<Icon name="chat" size={20}/>
		</button>
		<button onclick={scrollToCatalogo}
			class="flex-1 h-12 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2"
			style="background:{accent};box-shadow:0 4px 18px {accent}55">
			<Icon name="store" size={16}/>
			Ver catálogo
		</button>
	</div>

</div>
{/if}

<CustomizeModal
	open={customizeOpen}
	producto={customizeProduct}
	onclose={() => (customizeOpen = false)}
	onconfirm={onCustomizeConfirm}
/>
