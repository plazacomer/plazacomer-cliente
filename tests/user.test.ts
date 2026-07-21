import { describe, it, expect } from "vitest";
import {
  CreateUserRequestSchema,
  GeneralResponseSchema,
  GetUserResponseSchema,
  ListUsersResponseSchema,
  UpdateUserRequestSchema
} from "../src/lib/gen/user_pb";
import { toBinary, fromBinary, create } from "@bufbuild/protobuf";

const WORKER_URL = "http://localhost:8787";

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
});
