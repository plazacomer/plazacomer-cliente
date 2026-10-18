<script lang="ts">
	import { fmtCOP } from '$lib/utils';
	import type { Product, Modificador, Deal } from '$lib/data/mock';
	import Icon from './ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Checkbox } from '$lib/components/ui/checkbox';

	export type CartLineItem = {
		productId: string;
		storeId: string;
		quantity: number;
		price: number;
		selections: Record<string, string | string[]>;
		notes: string;
		lineId?: string;
	};

	type Props = {
		open: boolean;
		producto: Product | null;
		oferta?: Deal | null;
		initial?: CartLineItem | null;
		onclose: () => void;
		onconfirm: (item: CartLineItem) => void;
	};
	let { open, producto, oferta = null, initial = null, onclose, onconfirm }: Props = $props();

	let selections = $state<Record<string, string | string[]>>({});
	let quantity = $state(1);
	let notes = $state('');

	$effect(() => {
		if (open && producto) {
			if (initial) {
				selections = { ...initial.selections };
				quantity = initial.quantity;
				notes = initial.notes;
			} else {
				const init: Record<string, string | string[]> = {};
				(producto.modifiers ?? []).forEach((m) => {
					init[m.id] = m.tipo === 'single' ? '' : [];
				});
				selections = init;
				quantity = 1;
				notes = '';
			}
		}
	});

	function calcExtras(): number {
		if (!producto?.modifiers) return 0;
		return producto.modifiers.reduce((sum, m) => {
			const sel = selections[m.id];
			if (!sel) return sum;
			if (typeof sel === 'string') {
				const op = m.opciones.find((o) => o.id === sel);
				return sum + (op?.extra ?? 0);
			}
			return (
				sum +
				(sel as string[]).reduce((s, oid) => {
					const op = m.opciones.find((o) => o.id === oid);
					return s + (op?.extra ?? 0);
				}, 0)
			);
		}, 0);
	}

	const basePrice = $derived(oferta ? oferta.dealPrice : (producto?.price ?? 0));
	const extras = $derived(calcExtras());
	const total = $derived((basePrice + extras) * quantity);

	const errores = $derived.by(() => {
		const errs: string[] = [];
		if (!producto?.modifiers) return errs;
		for (const m of producto.modifiers) {
			const sel = selections[m.id];
			if (m.requerido) {
				if (m.tipo === 'single' && !sel) errs.push(m.nombre);
				else if (Array.isArray(sel) && sel.length < (m.min ?? 0)) errs.push(m.nombre);
			}
			if (Array.isArray(sel) && m.max && sel.length > m.max) {
				errs.push(`Máx ${m.max} en ${m.nombre}`);
			}
		}
		return errs;
	});
	const isValid = $derived(errores.length === 0);

	function setSingle(mod: Modificador, optId: string) {
		selections = { ...selections, [mod.id]: optId };
	}

	function toggleMulti(mod: Modificador, optId: string, checked: boolean) {
		const cur = selections[mod.id];
		const arr = Array.isArray(cur) ? cur : [];
		if (checked) {
			if (mod.max && arr.length >= mod.max) return;
			selections = { ...selections, [mod.id]: [...arr, optId] };
		} else {
			selections = { ...selections, [mod.id]: arr.filter((x) => x !== optId) };
		}
	}

	function isChecked(mod: Modificador, optId: string): boolean {
		const sel = selections[mod.id];
		return Array.isArray(sel) ? sel.includes(optId) : false;
	}

	function isSelected(mod: Modificador, optId: string): boolean {
		return selections[mod.id] === optId;
	}

	function confirm() {
		if (!isValid || !producto) return;
		onconfirm({
			productId: producto.id,
			storeId: producto.storeId,
			quantity,
			price: basePrice + extras,
			selections: { ...selections },
			notes: notes.trim(),
			lineId: initial?.lineId
		});
		onclose();
	}
</script>

<Dialog.Root
	open={open && !!producto}
	onOpenChange={(v) => {
		if (!v) onclose();
	}}
>
	<Dialog.Content
		showCloseButton={false}
		class="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 md:max-w-lg"
	>
		{#if producto}
			<!-- Header -->
			<div class="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
				<h2 class="font-display text-lg font-extrabold">
					{initial ? 'Editar producto' : 'Personaliza tu pedido'}
				</h2>
				<Button onclick={onclose} variant="ghost" size="icon-sm" class="rounded-full">
					<Icon name="close" size={16} />
				</Button>
			</div>

			<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
				<!-- Product header -->
				<div
					class="flex items-center gap-3 rounded-2xl p-3.5"
					style="background:var(--c-bg-secondary)"
				>
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
						style="background:var(--c-bg-card)"
					>
						{producto.emoji}
					</div>
					<div class="min-w-0 flex-1">
						<div class="font-display text-[15px] leading-tight font-bold">{producto.name}</div>
						<div class="mt-0.5 text-[12px] leading-snug" style="color:var(--c-text-muted)">
							{producto.description}
						</div>
						<div class="mt-1 font-mono text-[13px] font-bold" style="color:var(--c-brand)">
							{fmtCOP(basePrice)}
							{#if oferta}
								<span
									class="ml-2 text-[11px] font-normal line-through"
									style="color:var(--c-text-muted)">{fmtCOP(oferta.originalPrice)}</span
								>
							{/if}
						</div>
					</div>
				</div>

				<!-- Modificadores -->
				{#each producto.modifiers ?? [] as mod (mod.id)}
					<div>
						<div class="mb-2.5 flex items-center gap-2">
							<span class="font-display text-[13px] font-bold">{mod.nombre}</span>
							{#if mod.requerido}
								<span
									class="rounded-full px-2 py-0.5 text-[10px] font-bold"
									style="background:var(--c-error-light);color:var(--c-error)">Requerido</span
								>
							{:else}
								<span
									class="rounded-full px-2 py-0.5 text-[10px] font-bold"
									style="background:var(--c-bg-secondary);color:var(--c-text-muted)">Opcional</span
								>
							{/if}
							{#if mod.max && mod.tipo !== 'single'}
								<span class="ml-auto text-[11px]" style="color:var(--c-text-muted)"
									>máx {mod.max}</span
								>
							{/if}
						</div>

						{#if mod.tipo === 'single'}
							<RadioGroup.Root
								value={(selections[mod.id] as string) ?? ''}
								onValueChange={(v) => setSingle(mod, v)}
								class="flex flex-col gap-1.5"
							>
								{#each mod.opciones as op (op.id)}
									{@const sel = isSelected(mod, op.id)}
									{@const rowId = `${mod.id}-${op.id}`}
									<Label
										for={rowId}
										class="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] px-3 py-2.5 transition-all"
										style="background:{sel
											? 'var(--c-brand-light)'
											: 'var(--c-bg-secondary)'};border-color:{sel
											? 'var(--c-brand)'
											: 'transparent'}"
									>
										<RadioGroup.Item value={op.id} id={rowId} />
										<span class="flex-1 text-[14px]" style="font-weight:{sel ? 600 : 500}"
											>{op.nombre}</span
										>
										{#if op.extra > 0}
											<span
												class="font-mono text-[12px] font-bold"
												style="color:{sel ? 'var(--c-brand)' : 'var(--c-text-muted)'}"
												>+{fmtCOP(op.extra)}</span
											>
										{/if}
									</Label>
								{/each}
							</RadioGroup.Root>
						{:else}
							<div class="flex flex-col gap-1.5">
								{#each mod.opciones as op (op.id)}
									{@const sel = isChecked(mod, op.id)}
									{@const rowId = `${mod.id}-${op.id}`}
									<Label
										for={rowId}
										class="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border-[1.5px] px-3 py-2.5 transition-all"
										style="background:{sel
											? 'var(--c-brand-light)'
											: 'var(--c-bg-secondary)'};border-color:{sel
											? 'var(--c-brand)'
											: 'transparent'}"
									>
										<Checkbox
											checked={sel}
											onCheckedChange={(v) => toggleMulti(mod, op.id, !!v)}
											id={rowId}
										/>
										<span class="flex-1 text-[14px]" style="font-weight:{sel ? 600 : 500}"
											>{op.nombre}</span
										>
										{#if op.extra > 0}
											<span
												class="font-mono text-[12px] font-bold"
												style="color:{sel ? 'var(--c-brand)' : 'var(--c-text-muted)'}"
												>+{fmtCOP(op.extra)}</span
											>
										{/if}
									</Label>
								{/each}
							</div>
						{/if}
					</div>
				{/each}

				<!-- Notas -->
				<div>
					<div class="mb-1.5 text-[12px] font-bold" style="color:var(--c-text-muted)">
						Notas para la cocina (opcional)
					</div>
					<Textarea
						aria-label="Notas para la cocina"
						bind:value={notes}
						placeholder="Ej: bien picante, sin sal, etc."
						rows={2}
						class="w-full resize-none"
					/>
				</div>

				<!-- Cantidad + total -->
				<div
					class="flex items-center gap-3 rounded-xl p-3.5"
					style="background:var(--c-bg-secondary)"
				>
					<span class="text-[13px] font-bold">Cantidad</span>
					<div class="flex items-center gap-2">
						<Button
							onclick={() => (quantity = Math.max(1, quantity - 1))}
							variant="outline"
							size="icon-sm"
							class="rounded-full"
						>
							<Icon name="minus" size={16} />
						</Button>
						<span class="min-w-6 text-center font-mono text-[17px] font-bold">{quantity}</span>
						<Button
							onclick={() => (quantity += 1)}
							variant="brand"
							size="icon-sm"
							class="rounded-full"
						>
							<Icon name="plus" size={16} />
						</Button>
					</div>
					<div class="ml-auto text-right">
						<div class="text-[11px]" style="color:var(--c-text-muted)">Total</div>
						<div class="font-display text-[18px] font-extrabold" style="color:var(--c-brand)">
							{fmtCOP(total)}
						</div>
					</div>
				</div>

				<!-- Errores -->
				{#if !isValid}
					<div
						class="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-semibold"
						style="background:var(--c-error-light);color:var(--c-error)"
					>
						<Icon name="alert" size={14} />
						Faltan: {errores.join(', ')}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex shrink-0 gap-3 border-t border-[var(--c-border-soft)] px-5 py-4">
				<Button onclick={onclose} variant="outline">Cancelar</Button>
				<Button onclick={confirm} disabled={!isValid} variant="brand" fullWidth>
					<Icon name={initial ? 'check' : 'cart'} size={15} />
					{initial ? 'Guardar cambios' : 'Agregar'} · {fmtCOP(total)}
				</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
