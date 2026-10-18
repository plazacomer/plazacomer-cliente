import { authStore } from '$lib/stores/auth.svelte';
import {
	ListStoresResponseSchema,
	StoreDetailResponseSchema,
	ListProductsResponseSchema,
	ListDealsResponseSchema,
	ListReviewsResponseSchema,
	SearchResponseSchema,
	FeedResponseSchema,
	CreateStoreRequestSchema,
	UpdateStoreRequestSchema,
	CreateProductRequestSchema,
	UpdateProductRequestSchema,
	CreateDealRequestSchema,
	GeneralResponseSchema
} from './gen/catalog_pb';
import { toBinary, fromBinary, create } from '@bufbuild/protobuf';

const CATALOG_URL = 'http://localhost:8788';
const ADMIN_URL = 'http://localhost:8789';

// Helper to attach the Firebase JWT token
async function getAuthHeader(): Promise<Record<string, string>> {
	if (authStore.user) {
		const token = await authStore.user.getIdToken();
		return { Authorization: `Bearer ${token}` };
	}
	return {};
}

// === PUBLIC API (worker-catalogo) ===

export async function listStores(category?: string, query?: string): Promise<any[]> {
	const url = new URL(`${CATALOG_URL}/stores`);
	if (category) url.searchParams.set('category', category);
	if (query) url.searchParams.set('q', query);

	const response = await fetch(url.toString(), {
		headers: { Accept: 'application/x-protobuf' }
	});
	if (!response.ok) throw new Error('Error listing stores');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(ListStoresResponseSchema, new Uint8Array(buffer));
	return res.stores;
}

export async function getStore(id: number): Promise<any> {
	const response = await fetch(`${CATALOG_URL}/stores/${id}`, {
		headers: { Accept: 'application/x-protobuf' }
	});
	if (!response.ok) throw new Error('Error getting store');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(StoreDetailResponseSchema, new Uint8Array(buffer));
	if (!res.success) throw new Error(res.message);
	return res.store;
}

export async function listProducts(storeId: number): Promise<any[]> {
	const response = await fetch(`${CATALOG_URL}/stores/${storeId}/products`, {
		headers: { Accept: 'application/x-protobuf' }
	});
	if (!response.ok) throw new Error('Error listing products');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(ListProductsResponseSchema, new Uint8Array(buffer));
	return res.products;
}

export async function search(query: string): Promise<{ stores: any[]; products: any[] }> {
	const response = await fetch(`${CATALOG_URL}/search?q=${encodeURIComponent(query)}`, {
		headers: { Accept: 'application/x-protobuf' }
	});
	if (!response.ok) throw new Error('Error while searching');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(SearchResponseSchema, new Uint8Array(buffer));
	return { stores: res.stores, products: res.products };
}

// === ADMIN API (worker-catalogo-admin) ===

export async function createStore(store: {
	name: string;
	category: string;
	emoji: string;
	description: string;
	hours: string;
	location: string;
}): Promise<number> {
	const authHeader = await getAuthHeader();
	const request = create(CreateStoreRequestSchema, store);
	const requestBytes = toBinary(CreateStoreRequestSchema, request);

	const response = await fetch(`${ADMIN_URL}/stores`, {
		method: 'POST',
		headers: {
			...authHeader,
			'Content-Type': 'application/x-protobuf',
			Accept: 'application/x-protobuf'
		},
		body: requestBytes,
		credentials: 'include'
	});

	if (!response.ok) throw new Error('Error creating store');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(GeneralResponseSchema, new Uint8Array(buffer));
	if (!res.success) throw new Error(res.message);
	return Number(res.id);
}

export async function createProduct(
	storeId: number,
	product: {
		name: string;
		price: number;
		category: string;
		description?: string;
		emoji?: string;
		stock?: number;
	}
): Promise<number> {
	const authHeader = await getAuthHeader();
	const request = create(CreateProductRequestSchema, {
		name: product.name,
		price: BigInt(product.price),
		category: product.category,
		description: product.description,
		emoji: product.emoji,
		stock: product.stock !== undefined ? BigInt(product.stock) : undefined
	});
	const requestBytes = toBinary(CreateProductRequestSchema, request);

	const response = await fetch(`${ADMIN_URL}/stores/${storeId}/products`, {
		method: 'POST',
		headers: {
			...authHeader,
			'Content-Type': 'application/x-protobuf',
			Accept: 'application/x-protobuf'
		},
		body: requestBytes,
		credentials: 'include'
	});

	if (!response.ok) throw new Error('Error creating product');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(GeneralResponseSchema, new Uint8Array(buffer));
	if (!res.success) throw new Error(res.message);
	return Number(res.id);
}

export async function createDeal(
	productId: number,
	deal: {
		dealPrice: number;
		dealStock: number;
		label: string;
		finishAt: number;
	}
): Promise<number> {
	const authHeader = await getAuthHeader();
	const request = create(CreateDealRequestSchema, {
		productId: BigInt(productId),
		dealPrice: BigInt(deal.dealPrice),
		dealStock: BigInt(deal.dealStock),
		label: deal.label,
		finishAt: BigInt(deal.finishAt)
	});
	const requestBytes = toBinary(CreateDealRequestSchema, request);

	const response = await fetch(`${ADMIN_URL}/products/${productId}/deals`, {
		method: 'POST',
		headers: {
			...authHeader,
			'Content-Type': 'application/x-protobuf',
			Accept: 'application/x-protobuf'
		},
		body: requestBytes,
		credentials: 'include'
	});

	if (!response.ok) throw new Error('Error creating deal');
	const buffer = await response.arrayBuffer();
	const res = fromBinary(GeneralResponseSchema, new Uint8Array(buffer));
	if (!res.success) throw new Error(res.message);
	return Number(res.id);
}
