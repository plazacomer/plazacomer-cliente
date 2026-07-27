import { describe, it, expect } from "vitest";
import {
  CreateUserRequestSchema,
  GeneralResponseSchema,
  GetTaxDataResponseSchema,
  GetUserResponseSchema,
  ListUsersResponseSchema,
  SetUserRoleRequestSchema,
  UpdateUserRequestSchema,
  UpsertTaxDataRequestSchema
} from "../src/lib/gen/user_pb";
import { toBinary, fromBinary, create } from "@bufbuild/protobuf";

const WORKER_URL = "http://localhost:8787";
const ADMIN_WORKER_URL = "http://localhost:8791";
// Seeded by tests/init-users.sql -- the only way to become admin without already
// being one is a row set directly in D1 (see shared::authz + ADR note in the SQL file).
const adminAuthHeader = { "Authorization": "Bearer mock-token-e2e-admin-seed" };

describe("E2E - Rust Worker Zero-Copy Protobuf", () => {
  // A user's id is always claims.sub (the token's uid) -- a fresh one per run so it
  // doesn't collide with data persisted from a previous run (--persist-to).
  const uid = `e2e-${Date.now()}`;
  const authHeader = { "Authorization": `Bearer mock-token-${uid}` };
  let createdId: string = "";

  it("Should create a user using binary Protobuf payloads", async () => {
    const request = create(CreateUserRequestSchema, {
      name: "Juan Perez",
      email: `juan.perez.${uid}@example.com`,
      phone: "+573000000000"
    });
    const requestBytes = toBinary(CreateUserRequestSchema, request);

    const res = await fetch(`${WORKER_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/x-protobuf", ...authHeader },
      body: requestBytes
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-protobuf");
    expect(res.headers.get("Alt-Svc")).toBe('h3=":443"; ma=86400');

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.id).toBe(uid);
    createdId = response.id;
  });

  it("Should reject create without an authorization token", async () => {
    const request = create(CreateUserRequestSchema, {
      name: "No Auth",
      email: "noauth@example.com",
      phone: "+573000000001"
    });
    const requestBytes = toBinary(CreateUserRequestSchema, request);

    const res = await fetch(`${WORKER_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/x-protobuf" },
      body: requestBytes
    });

    expect(res.status).toBe(401);
  });

  it("Should get a user by ID decoding the binary response", async () => {
    const res = await fetch(`${WORKER_URL}/users/get/${createdId}`, {
      headers: authHeader
    });

    expect(res.status).toBe(200);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GetUserResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.user?.name).toBe("Juan Perez");
    expect(response.user?.email).toBe(`juan.perez.${uid}@example.com`);
    expect(response.user?.phone).toBe("+573000000000");
  });

  it("Should reject getting another user's profile (IDOR)", async () => {
    const res = await fetch(`${WORKER_URL}/users/get/${createdId}`, {
      headers: { "Authorization": "Bearer mock-token-other-user" }
    });

    expect(res.status).toBe(404);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GetUserResponseSchema, responseBytes);
    expect(response.success).toBe(false);
  });

  it("Should update the user using binary payloads", async () => {
    const request = create(UpdateUserRequestSchema, {
      id: createdId,
      name: "Juan Perez Edited",
      email: `juan.edited.${uid}@example.com`,
      phone: "+573111111111"
    });
    const requestBytes = toBinary(UpdateUserRequestSchema, request);

    const res = await fetch(`${WORKER_URL}/users/update`, {
      method: "POST",
      headers: { "Content-Type": "application/x-protobuf", ...authHeader },
      body: requestBytes
    });

    expect(res.status).toBe(200);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GeneralResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.id).toBe(createdId);
  });

  it("Should list all users in binary format", async () => {
    const res = await fetch(`${WORKER_URL}/users/list`, {
      headers: authHeader
    });

    expect(res.status).toBe(200);
    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(ListUsersResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.users.length).toBeGreaterThan(0);

    const updatedUser = response.users.find(u => u.id === createdId);
    expect(updatedUser).toBeDefined();
    expect(updatedUser?.name).toBe("Juan Perez Edited");
    expect(updatedUser?.email).toBe(`juan.edited.${uid}@example.com`);
  });

  it("Should log in (with auto-registration) via a Firebase token", async () => {
    const loginUid = `e2e-login-${Date.now()}`;
    const res = await fetch(`${WORKER_URL}/users/login`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer mock-token-${loginUid}`
      }
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/x-protobuf");

    const responseBytes = new Uint8Array(await res.arrayBuffer());
    const response = fromBinary(GetUserResponseSchema, responseBytes);

    expect(response.success).toBe(true);
    expect(response.user?.id).toBe(loginUid);
    expect(response.user?.name).toBe(loginUid);
    expect(response.user?.email).toBe(`${loginUid}@example.com`);
  });

  it("Should upsert and read back the user's own tax data (self-service)", async () => {
    const request = create(UpsertTaxDataRequestSchema, {
      taxId: "900123456-7",
      taxName: "Ferretería El Martillo SAS",
      taxRegime: "COMMON",
      fiscalAddress: "Cra 10 # 20-30, Bogotá",
      fiscalEmail: `billing.${uid}@example.com`,
      isCompany: true
    });
    const requestBytes = toBinary(UpsertTaxDataRequestSchema, request);

    const putRes = await fetch(`${WORKER_URL}/users/me/tax-data`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-protobuf", ...authHeader },
      body: requestBytes
    });
    expect(putRes.status).toBe(200);
    const putResponse = fromBinary(GeneralResponseSchema, new Uint8Array(await putRes.arrayBuffer()));
    expect(putResponse.success).toBe(true);

    const getRes = await fetch(`${WORKER_URL}/users/me/tax-data`, { headers: authHeader });
    expect(getRes.status).toBe(200);
    const getResponse = fromBinary(GetTaxDataResponseSchema, new Uint8Array(await getRes.arrayBuffer()));

    expect(getResponse.success).toBe(true);
    expect(getResponse.taxData?.taxId).toBe("900123456-7");
    expect(getResponse.taxData?.taxName).toBe("Ferretería El Martillo SAS");
    expect(getResponse.taxData?.isCompany).toBe(true);
  });

  it("Should reject a plain-user token on worker-user-admin (role check, not just auth)", async () => {
    const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/users`, {
      headers: authHeader // the e2e test user is role "user" by default
    });
    expect(res.status).toBe(403);
    const response = fromBinary(GeneralResponseSchema, new Uint8Array(await res.arrayBuffer()));
    expect(response.success).toBe(false);
  });

  it("Should let an admin (role-checked) read and correct a user's tax data via worker-user-admin", async () => {
    const getRes = await fetch(`${ADMIN_WORKER_URL}/users/admin/users/${createdId}/tax-data`, {
      headers: adminAuthHeader
    });
    expect(getRes.status).toBe(200);
    const getResponse = fromBinary(GetTaxDataResponseSchema, new Uint8Array(await getRes.arrayBuffer()));
    expect(getResponse.success).toBe(true);
    expect(getResponse.taxData?.taxId).toBe("900123456-7");

    const correction = create(UpsertTaxDataRequestSchema, {
      taxId: "900123456-8",
      taxName: "Ferretería El Martillo SAS",
      taxRegime: "COMMON",
      fiscalAddress: "Cra 10 # 20-30, Bogotá",
      fiscalEmail: `billing.${uid}@example.com`,
      isCompany: true
    });
    const putRes = await fetch(`${ADMIN_WORKER_URL}/users/admin/users/${createdId}/tax-data`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-protobuf", ...adminAuthHeader },
      body: toBinary(UpsertTaxDataRequestSchema, correction)
    });
    expect(putRes.status).toBe(200);

    const verifyRes = await fetch(`${ADMIN_WORKER_URL}/users/admin/users/${createdId}/tax-data`, {
      headers: adminAuthHeader
    });
    const verifyResponse = fromBinary(GetTaxDataResponseSchema, new Uint8Array(await verifyRes.arrayBuffer()));
    expect(verifyResponse.taxData?.taxId).toBe("900123456-8");
  });

  it("Should let an admin promote a user to manager, unlocking staff endpoints for them", async () => {
    const roleReq = create(SetUserRoleRequestSchema, { roleId: "manager" });
    const patchRes = await fetch(`${ADMIN_WORKER_URL}/users/admin/users/${createdId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/x-protobuf", ...adminAuthHeader },
      body: toBinary(SetUserRoleRequestSchema, roleReq)
    });
    expect(patchRes.status).toBe(200);
    const patchResponse = fromBinary(GeneralResponseSchema, new Uint8Array(await patchRes.arrayBuffer()));
    expect(patchResponse.success).toBe(true);

    const listRes = await fetch(`${ADMIN_WORKER_URL}/users/admin/users`, {
      headers: authHeader // now role "manager" -- should be let through this time
    });
    expect(listRes.status).toBe(200);
    const listResponse = fromBinary(ListUsersResponseSchema, new Uint8Array(await listRes.arrayBuffer()));
    const promoted = listResponse.users.find((u) => u.id === createdId);
    expect(promoted?.roleId).toBe("manager");
  });

  it("Should reject a manager (not admin) trying to grant roles", async () => {
    const roleReq = create(SetUserRoleRequestSchema, { roleId: "admin" });
    const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/users/${createdId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/x-protobuf", ...authHeader }, // manager, not admin
      body: toBinary(SetUserRoleRequestSchema, roleReq)
    });
    expect(res.status).toBe(403);
  });
});
