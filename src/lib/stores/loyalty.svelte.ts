import { browser } from '$app/environment';
import { LOYALTY_CARDS, type LoyaltyCardConfig, getProduct } from '$lib/data/mock';
import { cart, orders, toast, type Order } from '$lib/stores/app.svelte';
import { fmtCOP } from '$lib/utils';

const CLAIMS_KEY = 'pc_loyalty_claims_v1';

function readClaims(): Record<string, number> {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(CLAIMS_KEY) ?? '{}');
	} catch {
		return {};
	}
}

export type LoyaltyProgress = {
	config: LoyaltyCardConfig;
	stamps: number;
	hasRewardAvailable: boolean;
	rewardLabel: string;
};

function qualifies(pedido: Order, cfg: LoyaltyCardConfig): boolean {
	if (pedido.status === 'cancelled') return false;
	if (cfg.countingMode === 'minimum_amount') return pedido.total >= (cfg.minimumAmount ?? 0);
	if (cfg.countingMode === 'selected_products') {
		return pedido.items.some((i) => cfg.eligibleProductIds?.includes(i.productId));
	}
	return true;
}

export function rewardLabel(cfg: LoyaltyCardConfig): string {
	switch (cfg.rewardType) {
		case 'product': {
			const p = cfg.rewardProductId ? getProduct(cfg.rewardProductId) : null;
			return p ? `${p.emoji} ${p.name} gratis` : 'Un producto gratis';
		}
		case 'discount_percent':
			return `${cfg.rewardValue ?? 0}% de descuento`;
		case 'discount_fixed':
			return `${fmtCOP(cfg.rewardValue ?? 0)} de descuento`;
		case 'free_shipping':
			return 'Envío gratis';
	}
}

function createLoyalty() {
	let configs = $state<LoyaltyCardConfig[]>(LOYALTY_CARDS);
	let claimed = $state<Record<string, number>>(readClaims());

	$effect.root(() => {
		$effect(() => {
			if (browser) localStorage.setItem(CLAIMS_KEY, JSON.stringify(claimed));
		});
	});

	function config(storeId: string): LoyaltyCardConfig | null {
		return configs.find((c) => c.storeId === storeId && c.active) ?? null;
	}

	function progress(storeId: string): LoyaltyProgress | null {
		const cfg = config(storeId);
		if (!cfg) return null;
		const qualifyingCount = orders.items.filter(
			(p) => p.storeId === storeId && qualifies(p, cfg)
		).length;
		const claimedCount = claimed[storeId] ?? 0;
		const sinceLastClaim = qualifyingCount - claimedCount * cfg.threshold;
		return {
			config: cfg,
			stamps: Math.min(Math.max(sinceLastClaim, 0), cfg.threshold),
			hasRewardAvailable: sinceLastClaim >= cfg.threshold,
			rewardLabel: rewardLabel(cfg)
		};
	}

	return {
		get all() {
			return configs;
		},
		config,
		progress,
		upsertConfig(storeId: string, patch: Partial<Omit<LoyaltyCardConfig, 'storeId'>>) {
			const idx = configs.findIndex((c) => c.storeId === storeId);
			if (idx >= 0) {
				configs[idx] = { ...configs[idx], ...patch };
			} else {
				configs.push({
					storeId,
					active: true,
					threshold: 5,
					countingMode: 'all',
					rewardType: 'free_shipping',
					...patch
				});
			}
		},
		claim(storeId: string) {
			const p = progress(storeId);
			if (!p?.hasRewardAvailable) return;
			claimed = { ...claimed, [storeId]: (claimed[storeId] ?? 0) + 1 };
			if (p.config.rewardType === 'product' && p.config.rewardProductId) {
				const prod = getProduct(p.config.rewardProductId);
				cart.add({ productId: prod.id, storeId: storeId, price: 0 });
				toast.show(`🎁 ${prod.name} gratis agregado a tu carrito`);
			} else {
				toast.show(`🎁 Premio reclamado · ${p.rewardLabel} se aplicará en tu próxima compra`);
			}
		}
	};
}

export const loyalty = createLoyalty();
