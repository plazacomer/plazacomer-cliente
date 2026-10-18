<script lang="ts">
	import type { Store, Servicio } from '#lib/data/mock.js';
	import { fmtCOP } from '#lib/utils.js';
	import TiendaLogo from '#lib/components/TiendaLogo.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import ServicioBooking from '#lib/components/ServicioBooking.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Accordion from '#lib/components/ui/accordion/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';

	type Props = {
		tienda: Store;
		servicios: Servicio[];
		isOpen: boolean;
		onBack?: () => void;
	};
	let { tienda, servicios, isOpen, onBack }: Props = $props();

	const accent = $derived(tienda.logoColor);
	const land = $derived(tienda.landing);

	// Group servicios by categoria
	const serviciosPorCat = $derived(() => {
		// Map temporal: se arma de cero en cada cálculo del $derived y no se muta después.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const map = new Map<string, Servicio[]>();
		for (const s of servicios) {
			const arr = map.get(s.categoria) ?? [];
			arr.push(s);
			map.set(s.categoria, arr);
		}
		return map;
	});

	const hayDetalles = $derived(
		!!(
			land?.paquetes?.length ||
			land?.flota?.length ||
			land?.cobertura?.length ||
			land?.ramos?.length ||
			land?.convenios?.length ||
			land?.aliados?.length
		)
	);

	// Booking modal
	let bookingServicio = $state<Servicio | null>(null);
	let bookingOpen = $state(false);

	function openBooking(s: Servicio) {
		if (s.cta === 'llamar') {
			if (land?.ctaSecundaria?.telefono) {
				window.open('tel:' + land.ctaSecundaria.telefono, '_self');
			} else if (land?.ctaPrincipal?.telefono) {
				window.open('tel:' + land.ctaPrincipal.telefono, '_self');
			}
			return;
		}
		bookingServicio = s;
		bookingOpen = true;
	}

	const ctaLabel: Record<string, string> = {
		agendar: 'Agendar',
		cotizar: 'Cotizar',
		llamar: 'Llamar',
		mensaje: 'Mensaje'
	};

	// El CTA sticky móvil solo aparece cuando el CTA del riel sale de la vista —
	// evita mostrar dos botones idénticos "Agendar" al mismo tiempo en pantalla.
	let headerCtaEl = $state<HTMLElement | null>(null);
	let showStickyCta = $state(false);

	$effect(() => {
		if (!headerCtaEl) return;
		const obs = new IntersectionObserver(
			([entry]) => {
				showStickyCta = !entry.isIntersecting;
			},
			{ threshold: 0 }
		);
		obs.observe(headerCtaEl);
		return () => obs.disconnect();
	});

	// Cuenta hacia arriba los stats cuyo valor empieza en un número ("1.200+", "50 min", "24 h"...).
	// Si el valor no arranca en dígitos, lo deja tal cual — no todos los stats son contables.
	function countUp(node: HTMLElement, valor: string) {
		const match = /^([\d.,]+)(.*)$/.exec(valor.trim());
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!match || reduceMotion) {
			node.textContent = valor;
			return;
		}

		const target = parseInt(match[1].replace(/[.,]/g, ''), 10);
		const suffix = match[2];
		if (!Number.isFinite(target)) {
			node.textContent = valor;
			return;
		}

		node.textContent = '0' + suffix;
		let start: number | null = null;
		const duration = 900;
		function step(ts: number) {
			if (start === null) start = ts;
			const progress = Math.min((ts - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			const value = Math.round(target * eased);
			node.textContent = value.toLocaleString('es-CO') + suffix;
			if (progress < 1) requestAnimationFrame(step);
		}
		const timer = setTimeout(() => requestAnimationFrame(step), 400);
		return {
			destroy() {
				clearTimeout(timer);
			}
		};
	}
</script>

{#snippet sectionHeader(eyebrow: string, title: string)}
	<div class="mb-4">
		<div
			class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
			style="color:{accent}"
		>
			{eyebrow}
		</div>
		<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">{title}</h2>
	</div>
{/snippet}

{#snippet subHeader(label: string)}
	<div
		class="mb-3 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
		style="color:var(--c-text-muted)"
	>
		{label}
	</div>
{/snippet}

<div class="mx-auto max-w-5xl px-5 pt-5 pb-32 md:px-6 md:pb-24">
	<!-- ── BACK / SHARE ── -->
	<div class="mb-4 flex items-center justify-between">
		<Button
			onclick={onBack}
			aria-label="Volver"
			variant="ghost"
			size="icon"
			class="h-10 w-10 rounded-xl hover:opacity-80 active:opacity-70"
			style="background:var(--c-bg-card);color:var(--c-text-primary);box-shadow:var(--shadow-sm)"
		>
			<Icon name="arrowLeft" size={18} />
		</Button>
		<Button
			aria-label="Compartir"
			variant="ghost"
			size="icon"
			class="h-10 w-10 rounded-xl hover:opacity-80 active:opacity-70"
			style="background:var(--c-bg-card);color:var(--c-text-primary);box-shadow:var(--shadow-sm)"
		>
			<Icon name="share" size={18} />
		</Button>
	</div>

	<div class="flex flex-col gap-8 md:grid md:grid-cols-[280px_1fr] md:items-start md:gap-6">
		<!-- ── RIEL DE IDENTIDAD (sticky en tablet/desktop — el CTA nunca se pierde) ── -->
		<Card.Root
			class="animate-slide-in-left gap-0 rounded-xl bg-[var(--c-bg-card)] p-5 ring-1 ring-[var(--c-border-soft)] md:sticky md:top-6"
		>
			<div class="flex items-center gap-3">
				<div class="relative shrink-0">
					<div
						class="absolute -inset-1.5 rounded-full opacity-25 blur-md"
						style="background:{accent}"
					></div>
					<TiendaLogo {tienda} size={56} />
				</div>
				<h1 class="font-display text-lg leading-tight font-extrabold tracking-[-0.2px]">
					{tienda.name}
				</h1>
			</div>

			<div class="mt-4 flex flex-wrap items-center gap-2">
				{#if isOpen}
					<Badge
						class="gap-1.5 px-2.5 py-1 text-[11px] font-bold"
						style="background:var(--c-success-light);color:var(--c-success)"
					>
						<span class="animate-breathe h-[5px] w-[5px] rounded-full bg-current" />Abierto ahora
					</Badge>
				{:else}
					<Badge
						class="px-2.5 py-1 text-[11px] font-bold"
						style="background:var(--c-error-light);color:var(--c-error)">Cerrado</Badge
					>
				{/if}
			</div>

			<p class="mt-4 text-[13.5px] leading-relaxed" style="color:var(--c-text-secondary)">
				{tienda.description}
			</p>

			<div class="mt-4 flex flex-col gap-2 border-t border-[var(--c-border-soft)] pt-4">
				<div class="flex items-center gap-2.5 text-[12.5px]">
					<div
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
						style="background:#f59e0b1a;color:#f59e0b"
					>
						<Icon name="starFill" size={13} />
					</div>
					<div class="flex min-w-0 items-baseline gap-1.5">
						<span class="font-mono font-bold">{tienda.rating}</span>
						{#if tienda.ratingSummary?.total}
							<span class="truncate" style="color:var(--c-text-muted)"
								>({tienda.ratingSummary.total} reseñas)</span
							>
						{/if}
					</div>
				</div>
				<div class="flex items-center gap-2.5 text-[12.5px]">
					<div
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="location" size={13} />
					</div>
					<span class="min-w-0 leading-snug" style="color:var(--c-text-secondary)"
						>{tienda.location}</span
					>
				</div>
				<div class="flex items-center gap-2.5 text-[12.5px]">
					<div
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
						style="background:{accent}18;color:{accent}"
					>
						<Icon name="clock" size={13} />
					</div>
					<span class="min-w-0 leading-snug" style="color:var(--c-text-secondary)"
						>{tienda.hours}</span
					>
				</div>
			</div>

			<!-- CTAs -->
			<div class="mt-5 flex flex-col gap-2" bind:this={headerCtaEl}>
				{#if land?.ctaPrincipal}
					<Button
						onclick={() => {
							const s0 = servicios[0];
							if (s0)
								openBooking({
									...s0,
									cta: (land?.ctaPrincipal?.tipo as Servicio['cta']) ?? s0.cta
								});
						}}
						size="lg"
						class="h-auto rounded-xl px-5 py-3 text-sm font-bold text-white hover:opacity-90 active:opacity-80"
						style="background:{accent};box-shadow:0 4px 18px {accent}55"
					>
						<Icon name={land.ctaPrincipal.tipo === 'llamar' ? 'phone' : 'calendar'} size={16} />
						{land.ctaPrincipal.texto}
					</Button>
				{/if}
				{#if land?.ctaSecundaria}
					<Button
						onclick={() => {
							if (land?.ctaSecundaria?.tipo === 'llamar' && land?.ctaSecundaria?.telefono) {
								window.open('tel:' + land.ctaSecundaria.telefono, '_self');
							}
						}}
						variant="outline"
						size="lg"
						class="h-auto rounded-xl px-4 py-3 text-sm font-semibold hover:opacity-80 active:opacity-70"
						style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
					>
						<Icon name={land.ctaSecundaria.tipo === 'llamar' ? 'phone' : 'chat'} size={16} />
						{land.ctaSecundaria.texto}
					</Button>
				{/if}
			</div>
		</Card.Root>

		<!-- ── CONTENIDO ── -->
		<div class="flex min-w-0 flex-col">
			<!-- ── HERO EDITORIAL: la frase de la tienda es el titular ── -->
			<div
				class="animate-slide-up relative overflow-hidden rounded-xl bg-[var(--c-bg-card)] p-7 ring-1 ring-[var(--c-border-soft)] md:p-9"
			>
				<div
					class="pointer-events-none absolute rounded-full blur-[60px]"
					style="width:260px;height:260px;background:{accent};opacity:.16;top:-110px;right:-70px"
				/>
				<div
					class="pointer-events-none absolute rounded-full blur-[50px]"
					style="width:180px;height:180px;background:{accent};opacity:.10;bottom:-80px;right:90px"
				/>
				<div
					class="pointer-events-none absolute grayscale select-none"
					style="right:6px;bottom:-18px;font-size:150px;line-height:1;opacity:.05"
				>
					{tienda.emoji}
				</div>

				<div class="relative max-w-[560px]">
					{#if land?.eyebrow}
						<div
							class="mb-3 font-mono text-[10.5px] font-bold tracking-[1.5px] uppercase"
							style="color:{accent}"
						>
							{land.eyebrow}
						</div>
					{/if}
					<h2
						class="font-display leading-[1.12] font-extrabold tracking-[-0.6px] text-balance"
						style="font-size:clamp(24px,4vw,36px)"
					>
						{land?.tagline ?? tienda.name}
					</h2>
					{#if land?.heroLabel}
						<div
							class="mt-4 flex items-center gap-2 text-[12.5px]"
							style="color:var(--c-text-secondary)"
						>
							<span class="h-1 w-1 shrink-0 rounded-full" style="background:{accent}" />
							{land.heroLabel}
						</div>
					{/if}
				</div>
			</div>

			<!-- ── STATS ── -->
			{#if land?.stats}
				<div class="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4">
					{#each land.stats as s, i (i)}
						<Card.Root
							class="animate-slide-up gap-0 rounded-lg bg-[var(--c-bg-card)] p-3.5 ring-1 ring-[var(--c-border-soft)] transition-shadow hover:shadow-[var(--shadow-md)]"
							style="animation-delay:{80 + i * 60}ms"
						>
							<div
								class="mb-1.5 font-display leading-none font-extrabold tracking-[-0.5px]"
								style="font-size:26px;color:{accent}"
								use:countUp={s.valor}
							>
								{s.valor}
							</div>
							<div class="text-[11.5px] leading-snug" style="color:var(--c-text-secondary)">
								{s.label}
							</div>
						</Card.Root>
					{/each}
				</div>
			{/if}

			<!-- ── PILLARS ── -->
			{#if land?.pillars?.length}
				<section class="mt-11">
					{@render sectionHeader('Por qué con nosotros', 'Lo que nos define')}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
						{#each land.pillars as pillar, idx (idx)}
							<Card.Root
								class="gap-0 rounded-lg bg-[var(--c-bg-card)] p-4 ring-1 ring-[var(--c-border-soft)]"
							>
								<div
									class="mb-3 flex h-9 w-9 items-center justify-center rounded-md"
									style="background:{accent}18;color:{accent}"
								>
									<Icon name={pillar.icon} size={18} />
								</div>
								<h4 class="mb-1 font-display text-[14px] leading-snug font-bold">
									{pillar.titulo}
								</h4>
								<p class="text-[12.5px] leading-relaxed" style="color:var(--c-text-secondary)">
									{pillar.desc}
								</p>
							</Card.Root>
						{/each}
					</div>
				</section>
			{/if}

			<!-- ── CATÁLOGO DE SERVICIOS ── -->
			{#if servicios.length > 0}
				<section class="mt-11">
					{@render sectionHeader('Catálogo', 'Nuestros servicios')}

					{#each serviciosPorCat().entries() as [cat, items] (cat)}
						<div class="mb-6">
							<div
								class="mb-3 flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[1.5px] uppercase"
								style="color:var(--c-text-muted)"
							>
								<span class="inline-block h-[1px] w-5" style="background:var(--c-border)"></span>
								{cat}
							</div>
							<div class="flex flex-col gap-2.5">
								{#each items as s (s.id)}
									<Card.Root
										class="gap-0 rounded-lg bg-[var(--c-bg-card)] p-0 ring-1 ring-[var(--c-border-soft)]"
									>
										<div class="flex items-start gap-4 p-4">
											<!-- Icon -->
											<div
												class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
												style="background:{s.tone ?? accent}15"
											>
												{s.icon}
											</div>
											<!-- Info -->
											<div class="min-w-0 flex-1">
												<div class="flex flex-wrap items-start gap-2">
													<h4 class="flex-1 font-display text-[14.5px] leading-snug font-bold">
														{s.nombre}
													</h4>
												</div>
												<p
													class="mt-0.5 mb-2 text-[12.5px] leading-snug"
													style="color:var(--c-text-secondary)"
												>
													{s.tagline}
												</p>
												<!-- Meta pills -->
												<div class="flex flex-wrap gap-1.5">
													{#if s.duracion}
														<Badge
															class="gap-1 px-2 py-0.5 text-[11px] font-medium"
															style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
														>
															<Icon name="timer" size={10} />
															{s.duracion}
														</Badge>
													{/if}
													{#if s.modalidad}
														<Badge
															class="gap-1 px-2 py-0.5 text-[11px] font-medium"
															style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
														>
															<Icon name="location" size={10} />
															{s.modalidad}
														</Badge>
													{/if}
												</div>
											</div>
											<!-- Price + CTA -->
											<div class="flex shrink-0 flex-col items-end gap-2">
												<div class="text-right">
													{#if s.precio === 0}
														<div
															class="font-mono text-[13px] font-bold"
															style="color:var(--c-success)"
														>
															Gratis
														</div>
													{:else if s.precio != null}
														<div class="font-mono text-[13px] leading-none font-bold">
															{#if s.precioDesde}<span
																	class="text-[10px] font-normal"
																	style="color:var(--c-text-muted)"
																	>desde
																</span>{/if}{fmtCOP(s.precio)}
														</div>
													{:else}
														<div class="font-mono text-[13px] font-bold">A cotizar</div>
													{/if}
												</div>
												<Button
													onclick={() => openBooking(s)}
													size="sm"
													class="h-auto rounded-md px-3.5 py-2 text-[12px] font-bold whitespace-nowrap text-white hover:opacity-90 active:opacity-80"
													style="background:{accent};box-shadow:0 3px 12px {accent}44"
												>
													{ctaLabel[s.cta] ?? 'Ir'}
												</Button>
											</div>
										</div>
										<!-- Incluye (collapsed detail) -->
										{#if s.incluye?.length}
											<div class="px-4 pt-0 pb-4">
												<div
													class="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-[var(--c-border-soft)] pt-3"
												>
													{#each s.incluye as item, idx (idx)}
														<div
															class="flex items-start gap-1.5 text-[11.5px] leading-snug"
															style="color:var(--c-text-secondary)"
														>
															<span class="mt-[3px] shrink-0 font-bold" style="color:{accent}"
																>✓</span
															>
															{item}
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</Card.Root>
								{/each}
							</div>
						</div>
					{/each}
				</section>
			{/if}

			<!-- ── PROCESO ── -->
			{#if land?.proceso?.length}
				<section class="mt-11">
					{@render sectionHeader('Cómo funciona', 'Paso a paso')}
					<div class="flex flex-col gap-3">
						{#each land.proceso as p, idx (idx)}
							<Card.Root
								class="flex-row gap-4 rounded-lg bg-[var(--c-bg-card)] p-4 ring-1 ring-[var(--c-border-soft)]"
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md font-display text-[16px] font-extrabold text-white"
									style="background:{accent}"
								>
									{p.paso}
								</div>
								<div>
									<h4 class="mb-1 font-display text-[14px] leading-snug font-bold">{p.titulo}</h4>
									<p class="text-[13px] leading-relaxed" style="color:var(--c-text-secondary)">
										{p.desc}
									</p>
								</div>
							</Card.Root>
						{/each}
					</div>
				</section>
			{/if}

			<!-- ── EQUIPO ── -->
			{#if land?.equipo?.length}
				<section class="mt-11">
					{@render sectionHeader('Quiénes somos', 'El equipo')}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each land.equipo as m, idx (idx)}
							<Card.Root
								class="flex-row gap-3.5 rounded-lg bg-[var(--c-bg-card)] p-3.5 ring-1 ring-[var(--c-border-soft)]"
							>
								<div
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white"
									style="background:{m.avatar}"
								>
									{m.iniciales}
								</div>
								<div>
									<h4 class="font-display text-[14px] leading-snug font-bold">{m.nombre}</h4>
									<p class="mt-0.5 text-[12px] leading-snug" style="color:var(--c-text-secondary)">
										{m.rol}
									</p>
									<Badge
										class="mt-1.5 px-2 py-0.5 text-[11px] font-semibold"
										style="background:{accent}18;color:{accent}">{m.exp}</Badge
									>
								</div>
							</Card.Root>
						{/each}
					</div>
				</section>
			{/if}

			<!-- ── DETALLES ADICIONALES (paquetes/flota/cobertura de mudanzas, ramos/convenios/aliados de seguros...) ── -->
			{#if hayDetalles}
				<section class="mt-11">
					{@render sectionHeader('Detalles', 'Lo que necesitas saber')}

					{#if land?.paquetes?.length}
						<div class="mb-6">
							{@render subHeader('¿Qué paquete necesitas?')}
							<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
								{#each land.paquetes as pk, idx (idx)}
									<div
										class="flex flex-col gap-3 rounded-lg border-l-4 p-4 ring-1 ring-[var(--c-border-soft)]"
										style="background:var(--c-bg-card);border-left-color:{pk.color}"
									>
										<div class="font-display text-base font-extrabold" style="color:{pk.color}">
											{pk.nombre}
										</div>
										<ul class="flex flex-1 flex-col gap-1.5">
											{#each pk.incluido as item, idx (idx)}
												<li
													class="flex items-start gap-2 text-[12.5px] leading-snug"
													style="color:var(--c-text-secondary)"
												>
													<span class="mt-[2px] font-bold" style="color:{pk.color}">✓</span>{item}
												</li>
											{/each}
										</ul>
										<Button
											onclick={() => {
												const s = servicios.find((s) =>
													s.nombre.toLowerCase().includes(pk.nombre.toLowerCase())
												);
												if (s) openBooking(s);
											}}
											class="h-auto w-full rounded-md py-2.5 text-sm font-bold text-white hover:opacity-90 active:opacity-80"
											style="background:{pk.color}"
										>
											Cotizar {pk.nombre}
										</Button>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if land?.flota?.length}
						<div class="mb-6">
							{@render subHeader('Nuestra flota')}
							<div class="grid grid-cols-1 gap-2.5 md:grid-cols-3">
								{#each land.flota as v, idx (idx)}
									<Card.Root
										class="flex-row items-start gap-3 rounded-lg bg-[var(--c-bg-card)] p-3.5 ring-1 ring-[var(--c-border-soft)]"
									>
										<div
											class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl"
											style="background:{accent}18"
										>
											🚛
										</div>
										<div>
											<div class="mb-0.5 text-[13px] font-bold">{v.tipo}</div>
											<div class="font-mono text-[12px]" style="color:{accent}">{v.capacidad}</div>
											<div class="mt-0.5 text-[11.5px]" style="color:var(--c-text-muted)">
												{v.uso}
											</div>
										</div>
									</Card.Root>
								{/each}
							</div>
						</div>
					{/if}

					{#if land?.cobertura?.length}
						<div class="mb-6">
							{@render subHeader('Cobertura')}
							<div class="flex flex-wrap gap-2">
								{#each land.cobertura as zona, idx (idx)}
									<Badge
										variant="outline"
										class="gap-1.5 rounded-xl border-[var(--c-border-soft)] px-3 py-2 text-[12.5px] font-medium"
										style="background:var(--c-bg-card)"
									>
										<Icon name="location" size={12} color={accent} />{zona}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					{#if land?.ramos?.length}
						<div class="mb-6">
							{@render subHeader('Ramos disponibles')}
							<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
								{#each land.ramos as r (r.id)}
									<Card.Root
										class="gap-2 rounded-lg bg-[var(--c-bg-card)] p-4 ring-1 ring-[var(--c-border-soft)]"
									>
										<div class="text-2xl">{r.icon}</div>
										<h4 class="font-display text-[13.5px] leading-snug font-bold">{r.titulo}</h4>
										<p
											class="flex-1 text-[12px] leading-snug"
											style="color:var(--c-text-secondary)"
										>
											{r.desc}
										</p>
										<div class="mt-1 font-mono text-[12px] font-bold" style="color:{accent}">
											Desde {fmtCOP(r.desde)}/año
										</div>
									</Card.Root>
								{/each}
							</div>
						</div>
					{/if}

					{#if land?.convenios?.length}
						<div class="mb-6">
							{@render subHeader('Aceptamos tu seguro')}
							<div class="flex flex-wrap gap-2">
								{#each land.convenios as c, idx (idx)}
									<Badge
										variant="outline"
										class="rounded-xl border-[var(--c-border-soft)] px-4 py-2.5 text-[13px] font-bold"
										style="background:var(--c-bg-card);color:{c.color}"
									>
										{c.nombre}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					{#if land?.aliados?.length}
						<div>
							{@render subHeader('Aliados estratégicos')}
							<div class="flex flex-wrap gap-2">
								{#each land.aliados as a, idx (idx)}
									<Badge
										variant="outline"
										class="rounded-xl border-[var(--c-border-soft)] px-4 py-2.5 text-[13px] font-semibold"
										style="background:var(--c-bg-card);color:{a.color}"
									>
										{a.nombre}
									</Badge>
								{/each}
							</div>
						</div>
					{/if}
				</section>
			{/if}

			<!-- ── GALERÍA ── -->
			{#if land?.galeria?.length}
				<section class="mt-11">
					{@render sectionHeader('Nuestras instalaciones', 'Conoce el espacio')}
					<div class="grid grid-cols-2 gap-2.5 md:grid-cols-3">
						{#each land.galeria as g, idx (idx)}
							<div
								class="relative flex items-end overflow-hidden rounded-lg border"
								style="height:140px;background:{g.tono};border-color:rgba(0,0,0,.08);background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 14px)"
							>
								<div
									class="m-2 rounded-lg px-2 py-1 font-mono text-[11px] font-semibold"
									style="background:rgba(255,255,255,.92);color:{accent}"
								>
									<span style="opacity:.5">img · </span>{g.label}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- ── FAQ ── -->
			{#if land?.faqs?.length}
				<section class="mt-11">
					{@render sectionHeader('Preguntas frecuentes', 'Lo que más nos preguntan')}
					<Accordion.Root type="single" class="flex flex-col gap-2">
						{#each land.faqs as faq, i (i)}
							<Card.Root
								class="gap-0 rounded-lg bg-[var(--c-bg-card)] p-0 ring-1 ring-[var(--c-border-soft)]"
							>
								<Accordion.Item value={String(i)} class="border-b-0">
									<Accordion.Trigger class="rounded-none px-4 py-4 hover:no-underline">
										<span class="flex-1 font-display text-[14px] leading-snug font-bold"
											>{faq.q}</span
										>
									</Accordion.Trigger>
									<Accordion.Content class="px-4 pb-4">
										<p class="text-[13.5px] leading-relaxed" style="color:var(--c-text-secondary)">
											{faq.a}
										</p>
									</Accordion.Content>
								</Accordion.Item>
							</Card.Root>
						{/each}
					</Accordion.Root>
				</section>
			{/if}

			<!-- ── UBICACIÓN / HORARIO / PAGOS ── -->
			<section class="mt-11">
				{@render sectionHeader('Encuéntranos', 'Ubicación, horario y pagos')}
				<div class="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
					<div
						class="relative overflow-hidden rounded-lg border border-[var(--c-border-soft)]"
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
					<div class="flex flex-col gap-2.5">
						{#each [{ icon: 'location', label: 'Ubicación', value: tienda.location }, { icon: 'clock', label: 'Horario', value: tienda.hours }, { icon: 'credit', label: 'Pagos', value: tienda.paymentMethods.join(' · ') }] as row, idx (idx)}
							<Card.Root
								class="flex-row gap-3 rounded-lg bg-[var(--c-bg-card)] p-3.5 ring-1 ring-[var(--c-border-soft)]"
							>
								<div
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
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
							</Card.Root>
						{/each}
					</div>
				</div>
			</section>

			<!-- ── CTA FINAL ── -->
			<section class="mt-11">
				<div
					class="overflow-hidden rounded-xl text-white"
					style="padding:clamp(24px,4vw,40px);background:linear-gradient(135deg,{accent} 0%,{accent}cc 100%)"
				>
					<div class="md:flex md:items-center md:justify-between md:gap-6">
						<div class="flex-1">
							<div
								class="mb-1.5 font-mono text-[11px] font-bold tracking-[1.5px] uppercase opacity-85"
							>
								¿Listo para comenzar?
							</div>
							<h3
								class="font-display leading-[1.2] font-extrabold tracking-[-0.4px] text-balance"
								style="font-size:clamp(20px,3vw,26px)"
							>
								{land?.tagline ?? tienda.name}
							</h3>
							<p class="mt-2 max-w-md text-[13.5px] leading-relaxed opacity-90">
								Agendamos en menos de 24 horas. Sin compromiso.
							</p>
						</div>
						<div class="mt-4 flex flex-wrap gap-2.5 md:mt-0">
							{#if land?.ctaPrincipal}
								<Button
									onclick={() => {
										const s = servicios[0];
										if (s) openBooking(s);
									}}
									size="lg"
									class="h-auto rounded-xl px-6 py-3.5 text-[15px] font-bold shadow-[0_8px_24px_rgba(0,0,0,.18)] hover:opacity-90 active:opacity-80"
									style="background:#fff;color:{accent}"
								>
									{land.ctaPrincipal.texto}
									<Icon name="arrowRight" size={18} />
								</Button>
							{/if}
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>

<!-- ── STICKY MOBILE CTA — solo cuando el CTA del riel ya no está visible ── -->
{#if showStickyCta}
	<div
		class="fixed right-0 left-0 z-modal flex gap-2 border-t border-[var(--c-border-soft)] px-4 py-2.5 md:hidden"
		style="bottom:70px;background:var(--c-bg-card);box-shadow:0 -4px 20px rgba(0,0,0,.06)"
	>
		{#if land?.ctaSecundaria?.tipo === 'llamar' && land?.ctaSecundaria?.telefono}
			<Button
				href="tel:{land.ctaSecundaria.telefono}"
				aria-label="Llamar"
				variant="secondary"
				size="icon"
				class="h-12 w-12 shrink-0 rounded-xl hover:opacity-80 active:opacity-70"
				style="background:var(--c-bg-secondary)"
			>
				<Icon name="phone" size={20} />
			</Button>
		{/if}
		{#if land?.ctaPrincipal}
			<Button
				onclick={() => {
					const s = servicios[0];
					if (s) openBooking(s);
				}}
				class="h-12 flex-1 rounded-xl text-[14px] font-bold text-white hover:opacity-90 active:opacity-80"
				style="background:{accent};box-shadow:0 4px 18px {accent}55"
			>
				<Icon name="calendar" size={16} />
				{land.ctaPrincipal.texto}
			</Button>
		{/if}
	</div>
{/if}

<ServicioBooking
	open={bookingOpen}
	servicio={bookingServicio}
	{tienda}
	onclose={() => (bookingOpen = false)}
/>
