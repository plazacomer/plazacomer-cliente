import { describe, it, expect } from "vitest";
import {
  CreateStoreRequestSchema,
  CreateProductRequestSchema,
  CreateDealRequestSchema,
  GeneralResponseSchema,
  ListStoresResponseSchema,
  StoreDetailResponseSchema,
  ListProductsResponseSchema,
  SearchResponseSchema
} from "../src/lib/gen/catalog_pb";
import { toBinary, fromBinary, create } from "@bufbuild/protobuf";

const PUBLIC_URL = "http://localhost:8788";
const ADMIN_URL = "http://localhost:8789";

describe("E2E - Rust Catalog Workers Zero-Copy Protobuf", () => {
  let storeId: bigint = 0n;
  let productId: bigint = 0n;
  let dealId: bigint = 0n;
  const mockToken = "mock-token-merchant123";

  it("Should deny store creation when authorization is missing", async () => {
    const request = create(CreateStoreRequestSchema, {
      name: "Test Store",
      category: "restaurants",
      emoji: "🍔",
      description: "The best burgers",
      hours: "08:00 - 22:00",
      location: "Calle 10 # 5-20"
    });
    const requestBytes = toBinary(CreateStoreRequestSchema, request);

    const res = await fetch(`${ADMIN_URL}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/x-protobuf" },
      body: requestBytes
    });

    expect(res.status).toBe(401);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);
    expect(response.success).toBe(false);
  });

  it("Should create a store successfully with mock authorization", async () => {
    const request = create(CreateStoreRequestSchema, {
      name: "Delicious Burgers",
      category: "restaurants",
      emoji: "🍔",
      description: "Delicious gourmet burgers",
      hours: "11:00 - 23:00",
      location: "Av Principal # 45"
    });
    const requestBytes = toBinary(CreateStoreRequestSchema, request);

    const res = await fetch(`${ADMIN_URL}/stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-protobuf",
        "Authorization": `Bearer ${mockToken}`
      },
      body: requestBytes
    });

    expect(res.status).toBe(201);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.id).toBeGreaterThan(0n);
    storeId = response.id;
  });

  it("Should list stores in the public catalog in binary format", async () => {
    const res = await fetch(`${PUBLIC_URL}/stores`);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-protobuf");

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(ListStoresResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    const store = response.stores.find(s => s.id === storeId);
    expect(store).toBeDefined();
    expect(store?.name).toBe("Delicious Burgers");
  });

  it("Should get store details in binary format", async () => {
    const res = await fetch(`${PUBLIC_URL}/stores/${storeId}`);
    expect(res.status).toBe(200);

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(StoreDetailResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.store?.name).toBe("Delicious Burgers");
    expect(response.store?.sellerUid).toBe("merchant123");
  });

  it("Should create a product inside the store", async () => {
    const request = create(CreateProductRequestSchema, {
      name: "Double Cheese Burger",
      price: 25000n,
      category: "burgers",
      description: "Two patties, double cheddar cheese",
      emoji: "🍔",
      stock: 50n
    });
    const requestBytes = toBinary(CreateProductRequestSchema, request);

    const res = await fetch(`${ADMIN_URL}/stores/${storeId}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-protobuf",
        "Authorization": `Bearer ${mockToken}`
      },
      body: requestBytes
    });

    expect(res.status).toBe(201);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.id).toBeGreaterThan(0n);
    productId = response.id;
  });

  it("Should list the store's public products", async () => {
    const res = await fetch(`${PUBLIC_URL}/stores/${storeId}/products`);
    expect(res.status).toBe(200);

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(ListProductsResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    const product = response.products.find(p => p.id === productId);
    expect(product).toBeDefined();
    expect(product?.name).toBe("Double Cheese Burger");
    expect(product?.price).toBe(25000n);
  });

  it("Should search products and stores in binary format", async () => {
    const res = await fetch(`${PUBLIC_URL}/search?q=Double`);
    expect(res.status).toBe(200);

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(SearchResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.products.length).toBeGreaterThan(0);
    expect(response.products[0].name).toBe("Double Cheese Burger");
  });

  it("Should create an active deal for the product", async () => {
    const request = create(CreateDealRequestSchema, {
      productId,
      dealPrice: 18000n,
      dealStock: 10n,
      label: "Launch Deal",
      finishAt: BigInt(Date.now() + 86400000) // Tomorrow
    });
    const requestBytes = toBinary(CreateDealRequestSchema, request);

    const res = await fetch(`${ADMIN_URL}/products/${productId}/deals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-protobuf",
        "Authorization": `Bearer ${mockToken}`
      },
      body: requestBytes
    });

    expect(res.status).toBe(201);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.id).toBeGreaterThan(0n);
    dealId = response.id;
  });
});
