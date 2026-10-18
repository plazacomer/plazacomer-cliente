DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;

CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    seller_uid TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    kind TEXT NOT NULL,
    subtype TEXT,
    emoji TEXT NOT NULL,
    logo_color TEXT NOT NULL,
    banner_gradient TEXT,
    description TEXT NOT NULL,
    hours TEXT NOT NULL,
    location TEXT NOT NULL,
    logo_key TEXT,
    banner_key TEXT,
    open INTEGER NOT NULL DEFAULT 1,
    rating REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    emoji TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    available INTEGER NOT NULL DEFAULT 1,
    image_key TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(store_id) REFERENCES stores(id)
);

CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    deal_price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    deal_stock INTEGER NOT NULL,
    initial_stock INTEGER NOT NULL,
    label TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    finish_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(store_id) REFERENCES stores(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL,
    user_uid TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    photo_key TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(store_id) REFERENCES stores(id)
);
