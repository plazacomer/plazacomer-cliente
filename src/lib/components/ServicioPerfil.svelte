<script lang="ts">
	import type { Store, Servicio } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import TiendaLogo from '$lib/components/TiendaLogo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import ServicioBooking from '$lib/components/ServicioBooking.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';

	type Props = {
		tienda: Store;
		servicios: Servicio[];
		onBack?: () => void;
	};
	let { tienda, servicios, onBack }: Props = $props();

	const accent = $derived(tienda.logoColor);
	const land = $derived(tienda.landing);

	// Group servicios by categoria
	const serviciosPorCat = $derived(() => {
		const map = new Map<string, Servicio[]>();
		for (const s of servicios) {
			const arr = map.get(s.categoria) ?? [];
			arr.push(s);
			map.set(s.categoria, arr);
		}
		return map;
	});

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
		mensaje: 'Mensaje',
	};
</script>

{#snippet sectionHeader(eyebrow: string, title: string)}
	<div class="mb-4">
		<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">{eyebrow}</div>
		<h2 class="font-display text-[22px] font-extrabold tracking-[-0.3px]">{title}</h2>
	</div>
{/snippet}

<div class="max-w-5xl mx-auto pb-32 md:pb-24">

	<!-- ── HERO ── -->
	<div class="relative overflow-hidden rounded-b-xl"
		style="min-height:280px;height:clamp(280px,32vw,380px);background:{tienda.bannerGradient}">
		<div class="absolute inset-0"
			style="background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 14px)"/>
		<div class="absolute rounded-full" style="width:300px;height:300px;background:rgba(255,255,255,.07);right:-60px;top:-60px;"/>

		<!-- Emoji -->
		<div class="absolute right-5 md:right-14 bottom-4 md:bottom-8 select-none drop-shadow-[0_12px_30px_rgba(0,0,0,.25)]"
			style="font-size:clamp(90px,14vw,150px);line-height:1">{tienda.emoji}</div>

		<!-- Tagline block -->
		<div class="absolute left-6 md:left-14 bottom-9 md:bottom-12 right-[140px] md:right-[50%]">
			{#if land?.eyebrow}
				<div class="inline-block mb-3 px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-[1.2px]"
					style="background:rgba(255,255,255,.92);color:{accent}">
					{land.eyebrow}
				</div>
			{/if}
			<h1 class="font-display text-white font-extrabold leading-[1.1] tracking-[-0.5px] text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,.25)]"
				style="font-size:clamp(22px,3.8vw,40px)">
				{land?.tagline ?? tienda.name}
			</h1>
		</div>

		<!-- Back -->
		<button onclick={onBack}
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

		<!-- ── HEADER CARD ── -->
		<Card.Root class="-mt-10 p-5 gap-0 rounded-xl ring-1 ring-[var(--c-border-soft)] shadow-[var(--shadow-md)] bg-[var(--c-bg-card)] overflow-visible">
			<div class="flex gap-3.5 items-start flex-wrap">
				<div class="-mt-10">
					<div class="p-0.5 rounded-full shadow-[var(--shadow-sm)]" style="background:var(--c-bg-card)">
						<TiendaLogo tienda={tienda} size={72}/>
					</div>
				</div>
				<div class="flex-1 min-w-[200px]">
					<div class="flex gap-2 mb-1.5 flex-wrap">
						<span class="px-2.5 py-1 rounded-full text-[11px] font-bold" style="background:{accent}18;color:{accent}">
							Servicio profesional
						</span>
						<span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
							style="background:var(--c-success-light);color:var(--c-success)">
							<span class="w-[6px] h-[6px] rounded-full bg-current"/>Abierto ahora
						</span>
					</div>
					<h2 class="font-display text-2xl font-extrabold mb-1 tracking-[-0.3px]">{tienda.name}</h2>
					<p class="text-[13.5px] leading-relaxed mb-2.5" style="color:var(--c-text-secondary)">{tienda.description}</p>
					<div class="flex gap-4 flex-wrap text-xs" style="color:var(--c-text-secondary)">
						<span class="flex items-center gap-1">
							<Icon name="starFill" size={13} color="var(--c-accent)"/>
							<strong>{tienda.rating}</strong>
						</span>
						<span class="flex items-center gap-1"><Icon name="location" size={12}/>{tienda.location}</span>
						<span class="flex items-center gap-1"><Icon name="clock" size={12}/>{tienda.hours}</span>
					</div>
				</div>
			</div>

			{#if land?.heroLabel}
				<div class="mt-4 p-3 rounded-xl border text-[12.5px] font-semibold leading-relaxed"
					style="background:{accent}0e;border-color:{accent}33;color:var(--c-text-primary)">
					📍 {land.heroLabel}
				</div>
			{/if}

			<!-- CTAs -->
			<div class="flex gap-2 mt-5 flex-wrap">
				{#if land?.ctaPrincipal}
					<button onclick={() => {
						const s0 = servicios[0];
						if (s0) openBooking({ ...s0, cta: land?.ctaPrincipal?.tipo as Servicio['cta'] ?? s0.cta });
					}}
						class="flex-1 md:flex-none px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
						style="background:{accent};box-shadow:0 4px 18px {accent}55;min-width:180px">
						<Icon name={land.ctaPrincipal.tipo === 'llamar' ? 'phone' : 'calendar'} size={16}/>
						{land.ctaPrincipal.texto}
					</button>
				{/if}
				{#if land?.ctaSecundaria}
					<button onclick={() => {
						if (land?.ctaSecundaria?.tipo === 'llamar' && land?.ctaSecundaria?.telefono) {
							window.open('tel:' + land.ctaSecundaria.telefono, '_self');
						}
					}}
						class="px-4 py-3 rounded-xl font-semibold text-sm border flex items-center gap-2"
						style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)">
						<Icon name={land.ctaSecundaria.tipo === 'llamar' ? 'phone' : 'chat'} size={16}/>
						{land.ctaSecundaria.texto}
					</button>
				{/if}
			</div>
		</Card.Root>

		<!-- ── STATS ── -->
		{#if land?.stats}
			<div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-2.5">
				{#each land.stats as s}
					<Card.Root class="p-3.5 gap-0 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
						<div class="font-display font-extrabold leading-none tracking-[-0.5px] mb-1.5" style="font-size:26px;color:{accent}">{s.valor}</div>
						<div class="text-[11.5px] leading-snug" style="color:var(--c-text-secondary)">{s.label}</div>
					</Card.Root>
				{/each}
			</div>
		{/if}

		<!-- ── PILLARS ── -->
		{#if land?.pillars?.length}
			<section class="mt-11">
				{@render sectionHeader('Por qué con nosotros', 'Lo que nos define')}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					{#each land.pillars as pillar}
						<Card.Root class="p-4 gap-0 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="w-9 h-9 rounded-md flex items-center justify-center mb-3"
								style="background:{accent}18;color:{accent}">
								<Icon name={pillar.icon} size={18}/>
							</div>
							<h4 class="font-display text-[14px] font-bold mb-1 leading-snug">{pillar.titulo}</h4>
							<p class="text-[12.5px] leading-relaxed" style="color:var(--c-text-secondary)">{pillar.desc}</p>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── CATÁLOGO DE SERVICIOS ── -->
		{#if servicios.length > 0}
			<section class="mt-11">
				{@render sectionHeader('Catálogo', 'Nuestros servicios')}

				{#each serviciosPorCat().entries() as [cat, items]}
					<div class="mb-6">
						<div class="font-mono text-[10.5px] font-bold uppercase tracking-[1.5px] mb-3 flex items-center gap-2"
							style="color:var(--c-text-muted)">
							<span class="inline-block w-5 h-[1px]" style="background:var(--c-border)"></span>
							{cat}
						</div>
						<div class="flex flex-col gap-2.5">
							{#each items as s}
								<Card.Root class="p-0 gap-0 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
									<div class="p-4 flex gap-4 items-start">
										<!-- Icon -->
										<div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
											style="background:{s.tone ?? accent}15">{s.icon}</div>
										<!-- Info -->
										<div class="flex-1 min-w-0">
											<div class="flex items-start gap-2 flex-wrap">
												<h4 class="font-display text-[14.5px] font-bold leading-snug flex-1">{s.nombre}</h4>
											</div>
											<p class="text-[12.5px] leading-snug mt-0.5 mb-2" style="color:var(--c-text-secondary)">{s.tagline}</p>
											<!-- Meta pills -->
											<div class="flex gap-1.5 flex-wrap">
												{#if s.duracion}
													<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
														style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
														<Icon name="timer" size={10}/>
														{s.duracion}
													</span>
												{/if}
												{#if s.modalidad}
													<span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
														style="background:var(--c-bg-secondary);color:var(--c-text-muted)">
														<Icon name="location" size={10}/>
														{s.modalidad}
													</span>
												{/if}
											</div>
										</div>
										<!-- Price + CTA -->
										<div class="flex flex-col items-end gap-2 shrink-0">
											<div class="text-right">
												{#if s.precio === 0}
													<div class="font-mono text-[13px] font-bold" style="color:var(--c-success)">Gratis</div>
												{:else if s.precio != null}
													<div class="font-mono text-[13px] font-bold leading-none">
														{#if s.precioDesde}<span class="text-[10px] font-normal" style="color:var(--c-text-muted)">desde </span>{/if}{fmtCOP(s.precio)}
													</div>
												{:else}
													<div class="font-mono text-[13px] font-bold">A cotizar</div>
												{/if}
											</div>
											<button onclick={() => openBooking(s)}
												class="px-3.5 py-2 rounded-md text-white text-[12px] font-bold whitespace-nowrap"
												style="background:{accent};box-shadow:0 3px 12px {accent}44">
												{ctaLabel[s.cta] ?? 'Ir'}
											</button>
										</div>
									</div>
									<!-- Incluye (collapsed detail) -->
									{#if s.incluye?.length}
										<div class="px-4 pb-4 pt-0">
											<div class="pt-3 border-t border-[var(--c-border-soft)] grid grid-cols-2 gap-x-4 gap-y-1">
												{#each s.incluye as item}
													<div class="flex items-start gap-1.5 text-[11.5px] leading-snug" style="color:var(--c-text-secondary)">
														<span class="mt-[3px] shrink-0 font-bold" style="color:{accent}">✓</span>
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
					{#each land.proceso as p, i}
						<Card.Root class="flex-row gap-4 p-4 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="w-10 h-10 rounded-md flex items-center justify-center font-display font-extrabold text-white text-[16px] shrink-0"
								style="background:{accent}">{p.paso}</div>
							<div>
								<h4 class="font-display text-[14px] font-bold leading-snug mb-1">{p.titulo}</h4>
								<p class="text-[13px] leading-relaxed" style="color:var(--c-text-secondary)">{p.desc}</p>
							</div>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── PAQUETES (mudanzas) ── -->
		{#if land?.paquetes?.length}
			<section class="mt-11">
				{@render sectionHeader('Opciones', '¿Qué paquete necesitas?')}
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					{#each land.paquetes as pk}
						<div class="p-4 rounded-lg border-2 flex flex-col gap-3"
							style="background:var(--c-bg-card);border-color:{pk.color}40">
							<div class="font-display text-base font-extrabold" style="color:{pk.color}">{pk.nombre}</div>
							<ul class="flex flex-col gap-1.5 flex-1">
								{#each pk.incluido as item}
									<li class="flex items-start gap-2 text-[12.5px] leading-snug" style="color:var(--c-text-secondary)">
										<span class="font-bold mt-[2px]" style="color:{pk.color}">✓</span>{item}
									</li>
								{/each}
							</ul>
							<button onclick={() => { const s = servicios.find(s => s.nombre.toLowerCase().includes(pk.nombre.toLowerCase())); if (s) openBooking(s); }}
								class="w-full py-2.5 rounded-md font-bold text-sm text-white"
								style="background:{pk.color}">
								Cotizar {pk.nombre}
							</button>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── FLOTA (mudanzas) ── -->
		{#if land?.flota?.length}
			<section class="mt-8">
				<div class="mb-3">
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Nuestra flota</div>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
					{#each land.flota as v}
						<Card.Root class="flex-row p-3.5 gap-3 items-start rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="w-9 h-9 rounded-md flex items-center justify-center text-xl shrink-0"
								style="background:{accent}18">🚛</div>
							<div>
								<div class="font-bold text-[13px] mb-0.5">{v.tipo}</div>
								<div class="text-[12px] font-mono" style="color:{accent}">{v.capacidad}</div>
								<div class="text-[11.5px] mt-0.5" style="color:var(--c-text-muted)">{v.uso}</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── COBERTURA (mudanzas) ── -->
		{#if land?.cobertura?.length}
			<section class="mt-8">
				<div class="mb-3">
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Cobertura</div>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each land.cobertura as zona}
						<div class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--c-border-soft)] text-[12.5px] font-medium"
							style="background:var(--c-bg-card)">
							<Icon name="location" size={12} color={accent}/>{zona}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── RAMOS (seguros) ── -->
		{#if land?.ramos?.length}
			<section class="mt-11">
				{@render sectionHeader('Qué aseguramos', 'Ramos disponibles')}
				<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
					{#each land.ramos as r}
						<Card.Root class="p-4 gap-2 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="text-2xl">{r.icon}</div>
							<h4 class="font-display text-[13.5px] font-bold leading-snug">{r.titulo}</h4>
							<p class="text-[12px] leading-snug flex-1" style="color:var(--c-text-secondary)">{r.desc}</p>
							<div class="font-mono text-[12px] font-bold mt-1" style="color:{accent}">
								Desde {fmtCOP(r.desde)}/año
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
				<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
					{#each land.equipo as m}
						<Card.Root class="flex-row gap-3.5 p-3.5 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
								style="background:{m.avatar}">{m.iniciales}</div>
							<div>
								<h4 class="font-display text-[14px] font-bold leading-snug">{m.nombre}</h4>
								<p class="text-[12px] leading-snug mt-0.5" style="color:var(--c-text-secondary)">{m.rol}</p>
								<span class="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
									style="background:{accent}18;color:{accent}">{m.exp}</span>
							</div>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── CONVENIOS ── -->
		{#if land?.convenios?.length}
			<section class="mt-11">
				{@render sectionHeader('Convenios', 'Aceptamos tu seguro')}
				<div class="flex flex-wrap gap-2">
					{#each land.convenios as c}
						<div class="px-4 py-2.5 rounded-xl border border-[var(--c-border-soft)] font-bold text-[13px]"
							style="background:var(--c-bg-card);color:{c.color}">
							{c.nombre}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── ALIADOS ── -->
		{#if land?.aliados?.length}
			<section class="mt-8">
				<div class="mb-3">
					<div class="font-mono text-[11px] font-semibold uppercase tracking-[1.5px] mb-1" style="color:{accent}">Aliados estratégicos</div>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each land.aliados as a}
						<div class="px-4 py-2.5 rounded-xl border border-[var(--c-border-soft)] font-semibold text-[13px]"
							style="background:var(--c-bg-card);color:{a.color}">
							{a.nombre}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- ── GALERÍA ── -->
		{#if land?.galeria?.length}
			<section class="mt-11">
				{@render sectionHeader('Nuestras instalaciones', 'Conoce el espacio')}
				<div class="grid grid-cols-2 md:grid-cols-3 gap-2.5">
					{#each land.galeria as g}
						<div class="rounded-lg flex items-end overflow-hidden relative border"
							style="height:140px;background:{g.tono};border-color:rgba(0,0,0,.08);background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 14px)">
							<div class="m-2 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold"
								style="background:rgba(255,255,255,.92);color:{accent}">
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
					{#each land.faqs as faq, i}
						<Card.Root class="p-0 gap-0 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<Accordion.Item value={String(i)} class="border-b-0">
								<Accordion.Trigger class="px-4 py-4 rounded-none hover:no-underline">
									<span class="flex-1 text-[14px] font-bold font-display leading-snug">{faq.q}</span>
								</Accordion.Trigger>
								<Accordion.Content class="px-4 pb-4">
									<p class="text-[13.5px] leading-relaxed" style="color:var(--c-text-secondary)">{faq.a}</p>
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
			<div class="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-3">
				<div class="rounded-lg border border-[var(--c-border-soft)] relative overflow-hidden"
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
				<div class="flex flex-col gap-2.5">
					{#each [
						{ icon: 'location', label: 'Ubicación', value: tienda.location },
						{ icon: 'clock',    label: 'Horario',   value: tienda.hours },
						{ icon: 'credit',   label: 'Pagos',     value: tienda.paymentMethods.join(' · ') },
					] as row}
						<Card.Root class="flex-row gap-3 p-3.5 rounded-lg ring-1 ring-[var(--c-border-soft)] bg-[var(--c-bg-card)]">
							<div class="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
								style="background:{accent}18;color:{accent}">
								<Icon name={row.icon} size={16}/>
							</div>
							<div>
								<div class="text-[11px] font-bold uppercase tracking-[1px] mb-0.5" style="color:var(--c-text-muted)">{row.label}</div>
								<div class="text-[13px] font-medium leading-snug">{row.value}</div>
							</div>
						</Card.Root>
					{/each}
				</div>
			</div>
		</section>

		<!-- ── CTA FINAL ── -->
		<section class="mt-11">
			<div class="rounded-xl text-white overflow-hidden"
				style="padding:clamp(24px,4vw,40px);background:linear-gradient(135deg,{accent} 0%,{accent}cc 100%)">
				<div class="md:flex md:items-center md:justify-between md:gap-6">
					<div class="flex-1">
						<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] opacity-85 mb-1.5">¿Listo para comenzar?</div>
						<h3 class="font-display font-extrabold leading-[1.2] tracking-[-0.4px] text-balance" style="font-size:clamp(20px,3vw,26px)">
							{land?.tagline ?? tienda.name}
						</h3>
						<p class="text-[13.5px] opacity-90 mt-2 leading-relaxed max-w-md">
							Agendamos en menos de 24 horas. Sin compromiso.
						</p>
					</div>
					<div class="flex gap-2.5 flex-wrap mt-4 md:mt-0">
						{#if land?.ctaPrincipal}
							<button onclick={() => { const s = servicios[0]; if (s) openBooking(s); }}
								class="flex items-center gap-2 font-bold text-[15px] px-6 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,.18)]"
								style="background:#fff;color:{accent}">
								{land.ctaPrincipal.texto} <Icon name="arrowRight" size={18}/>
							</button>
						{/if}
					</div>
				</div>
			</div>
		</section>

	</div>

	<!-- ── STICKY MOBILE CTA ── -->
	<div class="fixed left-0 right-0 flex gap-2 px-4 py-2.5 border-t border-[var(--c-border-soft)] z-50 md:hidden"
		style="bottom:70px;background:var(--c-bg-card);box-shadow:0 -4px 20px rgba(0,0,0,.06)">
		{#if land?.ctaSecundaria?.tipo === 'llamar' && land?.ctaSecundaria?.telefono}
			<a href="tel:{land.ctaSecundaria.telefono}"
				class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
				style="background:var(--c-bg-secondary)">
				<Icon name="phone" size={20}/>
			</a>
		{/if}
		{#if land?.ctaPrincipal}
			<button onclick={() => { const s = servicios[0]; if (s) openBooking(s); }}
				class="flex-1 h-12 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2"
				style="background:{accent};box-shadow:0 4px 18px {accent}55">
				<Icon name="calendar" size={16}/>
				{land.ctaPrincipal.texto}
			</button>
		{/if}
	</div>

</div>

<ServicioBooking
	open={bookingOpen}
	servicio={bookingServicio}
	{tienda}
	onclose={() => (bookingOpen = false)}
/>
