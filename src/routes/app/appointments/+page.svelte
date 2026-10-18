<script lang="ts">
	import { citas, ESTADOS_CITA, fmtFechaCita, type Cita } from '$lib/stores/citas.svelte';
	import { getStore } from '$lib/data/mock';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Tab = 'proximas' | 'historial';
	let tab = $state<Tab>('proximas');

	const proximas = $derived(citas.proximas);
	const historial = $derived(citas.historial);
	const lista = $derived(tab === 'proximas' ? proximas : historial);

	function cancelar(id: string) {
		if (confirm('¿Cancelar esta cita?')) citas.cancel(id);
	}

	function ctaIcon(cita: Cita) {
		if (cita.cta === 'agendar') return 'calendar';
		if (cita.cta === 'cotizar') return 'receipt';
		return 'chat';
	}
</script>

<div class="mx-auto max-w-2xl px-4 pt-6 pb-28 md:pb-6">
	<!-- Header -->
	<div class="mb-6">
		<div
			class="mb-1 font-mono text-[11px] font-semibold tracking-[1.5px] uppercase"
			style="color:var(--c-brand)"
		>
			Gestiona tus servicios
		</div>
		<h1 class="font-display text-[26px] font-extrabold tracking-[-0.4px]">Mis citas</h1>
		<p class="mt-1 text-sm" style="color:var(--c-text-secondary)">
			{proximas.length} próxima{proximas.length !== 1 ? 's' : ''} · {historial.length} en historial
		</p>
	</div>

	<!-- Tabs -->
	<div class="mb-6 flex rounded-xl p-1" style="background:var(--c-bg-secondary)">
		{#each [['proximas', 'Próximas'], ['historial', 'Historial']] as [Tab, string][] as [id, label] (id)}
			<button
				onclick={() => (tab = id)}
				class="flex-1 rounded-[10px] py-2.5 text-[13.5px] font-bold transition-all"
				style="background:{tab === id ? 'var(--c-bg-card)' : 'transparent'};
					color:{tab === id ? 'var(--c-text-primary)' : 'var(--c-text-muted)'};
					box-shadow:{tab === id ? 'var(--shadow-sm)' : 'none'}"
			>
				{label}
				{#if id === 'proximas' && proximas.length > 0}
					<span
						class="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
						style="background:var(--c-brand)">{proximas.length}</span
					>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Empty state -->
	{#if lista.length === 0}
		<div class="py-20 text-center" style="color:var(--c-text-muted)">
			<div class="mb-4 text-5xl">{tab === 'proximas' ? '📅' : '📋'}</div>
			<h3 class="mb-2 font-display text-xl font-bold">
				{tab === 'proximas' ? 'Sin citas próximas' : 'Sin historial'}
			</h3>
			<p class="mx-auto max-w-[260px] text-sm leading-relaxed">
				{tab === 'proximas'
					? 'Visita una tienda de servicios y agenda directamente desde ahí.'
					: 'Las citas completadas y canceladas aparecerán acá.'}
			</p>
			{#if tab === 'proximas'}
				<a
					href="/app/explore"
					class="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
					style="background:var(--c-brand)"
				>
					<Icon name="search" size={16} /> Explorar servicios
				</a>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			{#each lista as cita (cita.id)}
				{@const tienda = getStore(cita.tiendaId)}
				{@const estado = ESTADOS_CITA[cita.estado]}

				<div
					class="overflow-hidden rounded-[16px] border border-[var(--c-border-soft)]"
					style="background:var(--c-bg-card)"
				>
					<!-- Top bar with status -->
					<div
						class="flex items-center gap-2 border-b border-[var(--c-border-soft)] px-4 pt-3 pb-2"
						style="background:var(--c-bg-secondary)"
					>
						<span class="h-2 w-2 shrink-0 rounded-full" style="background:{estado.color}"></span>
						<span class="text-[12px] font-bold" style="color:{estado.color}">{estado.label}</span>
						<span class="ml-auto font-mono text-[11.5px]" style="color:var(--c-text-muted)">
							#{cita.id.slice(-6).toUpperCase()}
						</span>
					</div>

					<!-- Main content -->
					<div class="p-4">
						<div class="flex items-start gap-3">
							<!-- Icon -->
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
								style="background:{tienda.logoColor}15"
							>
								{tienda.emoji}
							</div>

							<!-- Info -->
							<div class="min-w-0 flex-1">
								<div class="mb-0.5 font-display text-[15px] leading-snug font-bold">
									{cita.servicioNombre}
								</div>
								<div class="mb-2 text-[12.5px]" style="color:var(--c-text-secondary)">
									{tienda.name}
								</div>

								<!-- Date / Time row -->
								<div class="flex flex-wrap gap-3">
									{#if cita.fecha}
										<span
											class="flex items-center gap-1.5 text-[12px] font-semibold"
											style="color:var(--c-text-primary)"
										>
											<Icon name="calendar" size={13} color="var(--c-brand)" />
											{fmtFechaCita(cita.fecha)}
											{#if cita.hora}· {cita.hora}{/if}
										</span>
									{:else}
										<span class="text-[12px]" style="color:var(--c-text-muted)"
											>Fecha por confirmar</span
										>
									{/if}

									{#if cita.precio != null}
										<span
											class="ml-auto flex items-center gap-1.5 font-mono text-[12px] font-bold"
											style="color:{cita.precio === 0
												? 'var(--c-success)'
												: 'var(--c-text-primary)'}"
										>
											{cita.precio === 0 ? 'Gratis' : fmtCOP(cita.precio)}
										</span>
									{/if}
								</div>

								<!-- Tipo chip -->
								<div class="mt-2 flex items-center gap-1.5">
									<span
										class="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
										style="background:var(--c-bg-secondary);color:var(--c-text-muted)"
									>
										<Icon name={ctaIcon(cita)} size={10} />
										{cita.tipo === 'cita'
											? 'Cita médica'
											: cita.tipo === 'cotizacion'
												? 'Cotización'
												: 'Consulta'}
									</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						{#if estado.grupo === 'activa' && cita.propio}
							<div class="mt-4 flex gap-2 border-t border-[var(--c-border-soft)] pt-4">
								<a
									href="/app/store/{cita.tiendaId}"
									class="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-center text-[13px] font-bold"
									style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
								>
									<Icon name="store" size={14} /> Ver tienda
								</a>
								<button
									onclick={() => cancelar(cita.id)}
									class="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold"
									style="background:var(--c-error-light);color:var(--c-error)"
								>
									<Icon name="close" size={14} /> Cancelar
								</button>
							</div>
						{:else if estado.grupo === 'cerrada'}
							<div class="mt-4 flex gap-2 border-t border-[var(--c-border-soft)] pt-4">
								<a
									href="/app/store/{cita.tiendaId}"
									class="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-center text-[13px] font-bold"
									style="background:var(--c-brand);color:#fff"
								>
									<Icon name="calendar" size={14} /> Volver a agendar
								</a>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
