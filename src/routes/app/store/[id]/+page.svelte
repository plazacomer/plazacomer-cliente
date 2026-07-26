<script lang="ts">
	import { page } from '$app/stores';
	import {
		getStore, getStoreProducts, getStoreDeals, getStoreReviews,
		getServiciosDe, isServiceStore,
		type Product,
	} from '$lib/data/mock';
	import { cart, toast } from '$lib/stores/app.svelte';
	import CustomizeModal, { type CartLineItem } from '$lib/components/CustomizeModal.svelte';
	import ServicioLanding from '$lib/components/ServicioLanding.svelte';
	import RestaurantLanding from '$lib/components/RestaurantLanding.svelte';
	import TiendaLanding from '$lib/components/TiendaLanding.svelte';

	const tiendaId = $derived($page.params.id ?? '');
	const tienda = $derived(getStore(tiendaId));
	const esServicio = $derived(isServiceStore(tienda));
	const esRestaurante = $derived(!esServicio && tienda.category === 'food');
	const productos = $derived(getStoreProducts(tiendaId));
	const ofertas = $derived(getStoreDeals(tiendaId));
	const resenas = $derived(getStoreReviews(tiendaId));
	const servicios = $derived(getServiciosDe(tiendaId));
	const accent = $derived(tienda.logoColor);
	const isOpen = $derived((tienda.status ?? 'abierto') === 'abierto');

	// Customize modal — compartido por RestaurantLanding y TiendaLanding
	let customizeProduct = $state<Product | null>(null);
	let customizeOpen = $state(false);

	function openProducto(p: Product) {
		if (!isOpen) return;
		if (p.modifiers && p.modifiers.length > 0) {
			customizeProduct = p;
			customizeOpen = true;
		} else {
			cart.add({ productId: p.id, storeId: tienda.id, price: p.price });
			toast.show(`✓ ${p.name} agregado al carrito`);
		}
	}

	function onCustomizeConfirm(item: CartLineItem) {
		cart.add({ productId: item.productId, storeId: item.storeId, price: item.price, quantity: item.quantity, selections: item.selections, notes: item.notes });
		toast.show(`✓ ${customizeProduct?.name} agregado al carrito`);
	}

	function goBack() { history.back(); }
</script>

{#if esServicio}
	<ServicioLanding {tienda} {servicios} {isOpen} onBack={goBack}/>
{:else if esRestaurante}
	<RestaurantLanding {tienda} {productos} {ofertas} {accent} {isOpen} onOpenProduct={openProducto}/>
{:else}
	<TiendaLanding {tienda} {productos} {ofertas} {resenas} {accent} {isOpen} onOpenProduct={openProducto}/>
{/if}

<CustomizeModal
	open={customizeOpen}
	producto={customizeProduct}
	onclose={() => (customizeOpen = false)}
	onconfirm={onCustomizeConfirm}
/>
