<script lang="ts">
	import { fmtCOP } from '$lib/utils';
	import type { Product, Modificador, Deal } from '$lib/data/mock';
	import Icon from './ui/Icon.svelte';
	import * as Dialog from '$lib/components/ui/dialog';

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
			return sum + (sel as string[]).reduce((s, oid) => {
				const op = m.opciones.find((o) => o.id === oid);
				return s + (op?.extra ?? 0);
			}, 0);
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

	function toggle(mod: Modificador, optId: string) {
		const cur = selections[mod.id];
		if (mod.tipo === 'single') {
			selections = { ...selections, [mod.id]: optId };
		} else {
			const arr = Array.isArray(cur) ? cur : [];
			if (arr.includes(optId)) {
				selections = { ...selections, [mod.id]: arr.filter((x) => x !== optId) };
			} else {
				if (mod.max && arr.length >= mod.max) return;
				selections = { ...selections, [mod.id]: [...arr, optId] };
			}
		}
	}

	function isSelected(mod: Modificador, optId: string): boolean {
		const sel = selections[mod.id];
		if (!sel) return false;
		if (typeof sel === 'string') return sel === optId;
		return (sel as string[]).includes(optId);
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
			lineId: initial?.lineId,
		});
		onclose();
	}


</script>

<Dialog.Root open={open && !!producto} onOpenChange={(v) => { if (!v) onclose(); }}>
	<Dialog.Content showCloseButton={false} class="relative md:max-w-lg p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
	{#if producto}
		<!-- Header -->
		<div class="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
			<h2 class="font-display text-lg font-extrabold">
				{initial ? 'Editar producto' : 'Personaliza tu pedido'}
			</h2>
			<button onclick={onclose} class="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style="background:var(--c-bg-secondary);color:var(--c-text-muted)">✕</button>
		</div>

		<div class="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-4">
			<!-- Product header -->
			<div class="flex items-center gap-3 p-3.5 rounded-2xl" style="background:var(--c-bg-secondary)">
				<div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
					style="background:var(--c-bg-card)">{producto.emoji}</div>
				<div class="flex-1 min-w-0">
					<div class="font-display text-[15px] font-bold leading-tight">{producto.name}</div>
					<div class="text-[12px] leading-snug mt-0.5" style="color:var(--c-text-muted)">{producto.description}</div>
					<div class="font-mono text-[13px] font-bold mt-1" style="color:var(--c-brand)">
						{fmtCOP(basePrice)}
						{#if oferta}
							<span class="font-normal line-through ml-2 text-[11px]" style="color:var(--c-text-muted)">{fmtCOP(oferta.originalPrice)}</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Modificadores -->
			{#each (producto.modifiers ?? []) as mod}
				<div>
					<div class="flex items-center gap-2 mb-2.5">
						<span class="font-display text-[13px] font-bold">{mod.nombre}</span>
						{#if mod.requerido}
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:var(--c-error-light);color:var(--c-error)">Requerido</span>
						{:else}
							<span class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:var(--c-bg-secondary);color:var(--c-text-muted)">Opcional</span>
						{/if}
						{#if mod.max && mod.tipo !== 'single'}
							<span class="ml-auto text-[11px]" style="color:var(--c-text-muted)">máx {mod.max}</span>
						{/if}
					</div>
					<div class="flex flex-col gap-1.5">
						{#each mod.opciones as op}
							{@const sel = isSelected(mod, op.id)}
							<button
								onclick={() => toggle(mod, op.id)}
								class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all text-left w-full border-[1.5px]"
								style="background:{sel ? 'var(--c-brand-light)' : 'var(--c-bg-secondary)'};border-color:{sel ? 'var(--c-brand)' : 'transparent'}"
							>
								<!-- Radio/checkbox visual -->
								<div class="w-5 h-5 shrink-0 flex items-center justify-center border-2 transition-colors"
									style="border-radius:{mod.tipo === 'single' ? '50%' : '5px'};
									       border-color:{sel ? 'var(--c-brand)' : 'var(--c-border)'};
									       background:{sel ? 'var(--c-brand)' : 'transparent'}">
									{#if sel}
										{#if mod.tipo === 'single'}
											<div class="w-2 h-2 rounded-full bg-white"></div>
										{:else}
											<Icon name="check" size={11} color="#fff" strokeWidth={3}/>
										{/if}
									{/if}
								</div>
								<span class="flex-1 text-[14px]" style="font-weight:{sel ? 600 : 500}">{op.nombre}</span>
								{#if op.extra > 0}
									<span class="font-mono text-[12px] font-bold" style="color:{sel ? 'var(--c-brand)' : 'var(--c-text-muted)'}">+{fmtCOP(op.extra)}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Notas -->
			<div>
				<div class="text-[12px] font-bold mb-1.5" style="color:var(--c-text-muted)">Notas para la cocina (opcional)</div>
				<textarea
					aria-label="Notas para la cocina"
					bind:value={notes}
					placeholder="Ej: bien picante, sin sal, etc."
					rows="2"
					class="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none border border-[var(--c-border-soft)] focus:border-[var(--c-brand)]"
					style="background:var(--c-bg-secondary);color:var(--c-text-primary)"
				></textarea>
			</div>

			<!-- Cantidad + total -->
			<div class="flex items-center gap-3 p-3.5 rounded-xl" style="background:var(--c-bg-secondary)">
				<span class="text-[13px] font-bold">Cantidad</span>
				<div class="flex items-center gap-2">
					<button
						onclick={() => (quantity = Math.max(1, quantity - 1))}
						class="w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold"
						style="background:var(--c-bg-card)">−</button>
					<span class="font-mono text-[17px] font-bold min-w-6 text-center">{quantity}</span>
					<button
						onclick={() => (quantity += 1)}
						class="w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold text-white"
						style="background:var(--c-brand)">+</button>
				</div>
				<div class="ml-auto text-right">
					<div class="text-[11px]" style="color:var(--c-text-muted)">Total</div>
					<div class="font-display font-extrabold text-[18px]" style="color:var(--c-brand)">{fmtCOP(total)}</div>
				</div>
			</div>

			<!-- Errores -->
			{#if !isValid}
				<div class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold"
					style="background:var(--c-error-light);color:var(--c-error)">
					<Icon name="alert" size={14}/>
					Faltan: {errores.join(', ')}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="px-5 py-4 border-t border-[var(--c-border-soft)] flex gap-3 shrink-0">
			<button onclick={onclose} class="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[var(--c-border-soft)]"
				style="color:var(--c-text-secondary)">Cancelar</button>
			<button
				onclick={confirm}
				disabled={!isValid}
				class="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
				style="background:var(--c-brand)">
				<Icon name={initial ? 'check' : 'cart'} size={15} color="#fff"/>
				{initial ? 'Guardar cambios' : 'Agregar'} · {fmtCOP(total)}
			</button>
		</div>
	{/if}
	</Dialog.Content>
</Dialog.Root>
