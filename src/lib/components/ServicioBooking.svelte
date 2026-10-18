<script lang="ts">
	import type { Store, Servicio } from '$lib/data/mock';
	import { citas } from '$lib/stores/citas.svelte';
	import { toast } from '$lib/stores/app.svelte';
	import { fmtCOP } from '$lib/utils';
	import Icon from '$lib/components/ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		open: boolean;
		servicio: Servicio | null;
		tienda: Store;
		onclose: () => void;
	};
	let { open, servicio, tienda, onclose }: Props = $props();

	const accent = $derived(tienda.logoColor);

	type Step = 'form' | 'confirm' | 'success';
	let step = $state<Step>('form');

	// Form fields
	let nombre = $state('');
	let telefono = $state('');
	let email = $state('');
	let fecha = $state('');
	let hora = $state('');
	let notas = $state('');
	let modalidad = $state('');

	// Validation
	const formValid = $derived(() => {
		if (!servicio) return false;
		if (!nombre.trim() || !telefono.trim()) return false;
		if (servicio.cta === 'agendar' && !fecha) return false;
		return true;
	});

	$effect(() => {
		if (!open) {
			setTimeout(() => {
				step = 'form';
				nombre = '';
				telefono = '';
				email = '';
				fecha = '';
				hora = '';
				notas = '';
				modalidad = '';
			}, 300);
		}
	});

	function handleSubmit() {
		if (!formValid() || !servicio) return;
		step = 'confirm';
	}

	function handleConfirm() {
		if (!servicio) return;
		citas.add({
			servicio,
			tienda,
			cta: servicio.cta,
			datos: { nombre, telefono, email, fecha, hora, notas, modalidad }
		});
		step = 'success';
	}

	function handleClose() {
		onclose();
	}

	const HORAS = [
		'7:00 am',
		'7:30 am',
		'8:00 am',
		'8:30 am',
		'9:00 am',
		'9:30 am',
		'10:00 am',
		'10:30 am',
		'11:00 am',
		'11:30 am',
		'12:00 pm',
		'2:00 pm',
		'2:30 pm',
		'3:00 pm',
		'3:30 pm',
		'4:00 pm',
		'4:30 pm',
		'5:00 pm',
		'5:30 pm',
		'6:00 pm'
	];

	// Modal cta labels
	const modalTitle: Record<string, string> = {
		agendar: 'Agendar cita',
		cotizar: 'Solicitar cotización',
		mensaje: 'Enviar consulta'
	};
	const submitLabel: Record<string, string> = {
		agendar: 'Confirmar cita',
		cotizar: 'Solicitar cotización',
		mensaje: 'Enviar mensaje'
	};
	const successTitle: Record<string, string> = {
		agendar: '¡Cita solicitada! 🎉',
		cotizar: '¡Cotización enviada! 📋',
		mensaje: '¡Mensaje enviado! ✉️'
	};
	const successMsg: Record<string, string> = {
		agendar:
			'Te confirmamos dentro de las próximas 2 horas hábiles por WhatsApp o al correo que dejaste.',
		cotizar: 'Recibirás la cotización detallada en menos de 24 horas por WhatsApp o correo.',
		mensaje: 'Te respondemos en un máximo de 24 horas hábiles.'
	};
</script>

<Dialog.Root
	open={open && !!servicio}
	onOpenChange={(v) => {
		if (!v) handleClose();
	}}
>
	<Dialog.Content
		showCloseButton={false}
		class="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 md:max-w-[480px]"
	>
		{#if servicio}
			<!-- Header -->
			<div
				class="flex shrink-0 items-center gap-3 border-b border-[var(--c-border-soft)] px-5 py-4"
			>
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
					style="background:{servicio.tone ?? accent}15"
				>
					{servicio.icon}
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate font-display text-[15px] leading-snug font-bold">
						{servicio.nombre}
					</div>
					<div class="truncate text-[12px]" style="color:var(--c-text-muted)">{tienda.name}</div>
				</div>
				<Button
					onclick={handleClose}
					aria-label="Cerrar"
					variant="ghost"
					size="icon"
					class="h-9 w-9 rounded-xl hover:opacity-80 active:opacity-70"
					style="background:var(--c-bg-secondary)"
				>
					<Icon name="close" size={16} />
				</Button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto">
				{#if step === 'form'}
					<div class="flex flex-col gap-4 p-5">
						<!-- Servicio summary -->
						<div
							class="rounded-[14px] border border-[var(--c-border-soft)] p-3.5"
							style="background:var(--c-bg-secondary)"
						>
							<div class="mb-1 text-[12.5px] font-semibold">{servicio.tagline}</div>
							<div class="flex gap-3 text-[11.5px]" style="color:var(--c-text-muted)">
								{#if servicio.duracion}
									<span class="flex items-center gap-1"
										><Icon name="timer" size={10} />{servicio.duracion}</span
									>
								{/if}
								{#if servicio.modalidad}
									<span class="flex items-center gap-1"
										><Icon name="location" size={10} />{servicio.modalidad}</span
									>
								{/if}
								{#if servicio.precio != null}
									<span class="ml-auto flex items-center gap-1 font-bold" style="color:{accent}">
										{servicio.precio === 0
											? 'Gratis'
											: (servicio.precioDesde ? 'Desde ' : '') + fmtCOP(servicio.precio)}
									</span>
								{/if}
							</div>
						</div>

						<!-- Title -->
						<h3 class="font-display text-[18px] font-extrabold">
							{modalTitle[servicio.cta] ?? 'Contactar'}
						</h3>

						<!-- Modalidad (si el servicio tiene opciones) -->
						{#if servicio.modalidad?.includes('o')}
							<div>
								<label
									class="mb-2 block text-[12px] font-bold tracking-[0.8px] uppercase"
									style="color:var(--c-text-muted)">Modalidad</label
								>
								<div class="flex gap-2">
									{#each servicio.modalidad.split(' o ') as opt}
										<Button
											onclick={() => (modalidad = opt)}
											class="h-auto flex-1 rounded-xl border py-2.5 text-[13px] font-semibold hover:opacity-90 active:opacity-80"
											style="background:{modalidad === opt
												? accent
												: 'var(--c-bg-secondary)'};color:{modalidad === opt
												? '#fff'
												: 'var(--c-text-primary)'};border-color:{modalidad === opt
												? accent
												: 'var(--c-border)'}"
										>
											{opt}
										</Button>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Nombre -->
						<div>
							<label
								class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
								style="color:var(--c-text-muted)"
							>
								Nombre completo <span style="color:var(--c-error)">*</span>
							</label>
							<Input
								bind:value={nombre}
								type="text"
								placeholder="Juan García"
								class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
								style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- Teléfono -->
						<div>
							<label
								class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
								style="color:var(--c-text-muted)"
							>
								WhatsApp / Teléfono <span style="color:var(--c-error)">*</span>
							</label>
							<Input
								bind:value={telefono}
								type="tel"
								placeholder="+57 300 000 0000"
								class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
								style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- Email -->
						<div>
							<label
								class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
								style="color:var(--c-text-muted)">Correo electrónico</label
							>
							<Input
								bind:value={email}
								type="email"
								placeholder="tu@correo.com"
								class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
								style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- Fecha + hora (solo para citas) -->
						{#if servicio.cta === 'agendar'}
							<div class="grid grid-cols-[1.2fr_1fr] gap-3">
								<div>
									<label
										class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
										style="color:var(--c-text-muted)"
									>
										Fecha <span style="color:var(--c-error)">*</span>
									</label>
									<Input
										bind:value={fecha}
										type="date"
										class="h-11 w-full rounded-xl border px-3.5 text-[14px]"
										style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
									/>
								</div>
								<div>
									<label
										class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
										style="color:var(--c-text-muted)">Hora preferida</label
									>
									<Select.Root type="single" bind:value={hora}>
										<Select.Trigger
											class="w-full rounded-xl border px-3.5 text-[14px] data-[size=default]:h-11"
											style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
										>
											{hora || 'Cualquiera'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="" label="Cualquiera">Cualquiera</Select.Item>
											{#each HORAS as h}
												<Select.Item value={h} label={h}>{h}</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</div>
							</div>
						{/if}

						<!-- Notas / mensaje -->
						<div>
							<label
								class="mb-1.5 block text-[12px] font-bold tracking-[0.8px] uppercase"
								style="color:var(--c-text-muted)"
							>
								{servicio.cta === 'cotizar'
									? 'Cuéntanos qué necesitas'
									: servicio.cta === 'mensaje'
										? 'Tu pregunta o mensaje'
										: 'Notas adicionales (opcional)'}
							</label>
							<Textarea
								bind:value={notas}
								rows={3}
								placeholder={servicio.cta === 'cotizar'
									? 'Ej: Mudanza de apartamento 2 hab en El Poblado a Envigado...'
									: servicio.cta === 'mensaje'
										? '¿En qué te podemos ayudar?'
										: 'Ej: tengo sensibilidad, alergias, preferencias...'}
								class="w-full resize-none rounded-xl border p-3.5 text-[14px] leading-relaxed"
								style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- Submit -->
						<Button
							onclick={handleSubmit}
							disabled={!formValid()}
							class="mt-1 h-12 w-full rounded-xl text-[15px] font-bold text-white hover:opacity-90 active:opacity-80 disabled:opacity-40"
							style="background:{accent};box-shadow:0 4px 18px {accent}55"
						>
							{submitLabel[servicio.cta] ?? 'Enviar'}
						</Button>

						<p class="text-center text-[11.5px]" style="color:var(--c-text-muted)">
							Sin cargos adicionales por solicitar · Confirmamos en &lt;24 horas
						</p>
					</div>
				{:else if step === 'confirm'}
					<div class="flex flex-col gap-4 p-5">
						<h3 class="font-display text-[18px] font-extrabold">Confirma los datos</h3>

						<div
							class="flex flex-col gap-2.5 rounded-[14px] border border-[var(--c-border-soft)] p-4"
							style="background:var(--c-bg-secondary)"
						>
							{#each [{ label: 'Nombre', value: nombre }, { label: 'Teléfono', value: telefono }, ...(email ? [{ label: 'Email', value: email }] : []), ...(fecha ? [{ label: 'Fecha', value: fecha }] : []), ...(hora ? [{ label: 'Hora', value: hora }] : []), ...(modalidad ? [{ label: 'Modalidad', value: modalidad }] : []), ...(notas ? [{ label: 'Notas', value: notas }] : [])] as row}
								<div class="flex gap-3 text-[13px]">
									<span class="w-20 shrink-0 font-semibold" style="color:var(--c-text-muted)"
										>{row.label}</span
									>
									<span class="flex-1">{row.value}</span>
								</div>
							{/each}
						</div>

						<div class="flex gap-2.5">
							<Button
								onclick={() => (step = 'form')}
								variant="outline"
								class="h-12 flex-1 rounded-xl text-[14px] font-bold hover:opacity-80 active:opacity-70"
								style="background:var(--c-bg-secondary);border-color:var(--c-border);color:var(--c-text-primary)"
							>
								Editar
							</Button>
							<Button
								onclick={handleConfirm}
								class="h-12 flex-1 rounded-xl text-[14px] font-bold text-white hover:opacity-90 active:opacity-80"
								style="background:{accent};box-shadow:0 4px 18px {accent}55"
							>
								Confirmar
							</Button>
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center gap-4 p-8 text-center">
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
							style="background:{accent}18"
						>
							{servicio.icon}
						</div>
						<h3 class="font-display text-[22px] font-extrabold">
							{successTitle[servicio.cta] ?? '¡Enviado!'}
						</h3>
						<p
							class="max-w-[300px] text-[14px] leading-relaxed"
							style="color:var(--c-text-secondary)"
						>
							{successMsg[servicio.cta] ?? 'Te contactaremos pronto.'}
						</p>
						<div class="mt-2 flex w-full gap-2.5">
							<Button
								onclick={handleClose}
								class="h-12 flex-1 rounded-xl text-[14px] font-bold text-white hover:opacity-90 active:opacity-80"
								style="background:{accent}"
							>
								Cerrar
							</Button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
