-- Test-only fixture, applied AFTER worker-user/migrations/0001_init.sql (which
-- creates the schema + seeds the roles table). This is deliberately NOT part of
-- that migration: a bootstrap admin *user* row is environment-specific fixture
-- data, not schema -- it must never be silently created by `migrations apply`
-- against a real deploy. There is no self-service or API path to create the
-- first admin; in a real environment this row is set directly in D1, once.
INSERT OR IGNORE INTO users (id, name, email, phone, created_at, blocked, role_id)
VALUES ('e2e-admin-seed', 'Admin E2E', 'admin.e2e@example.com', '', 0, 0, 'admin');
