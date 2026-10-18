import { authStore } from '$lib/stores/auth.svelte';
import {
	GetUserResponseSchema,
	UpdateUserRequestSchema,
	GeneralResponseSchema,
	type User
} from './gen/user_pb';
import { toBinary, fromBinary, create } from '@bufbuild/protobuf';

// User Worker URL. Points to localhost in development, to the configured URL in prod.
const USER_WORKER_URL = 'http://localhost:8787';

/**
 * Logs in (or registers) against the Rust backend.
 * Grabs the current Firebase ID token and sends it in the Authorization header.
 * The Rust worker verifies the token and returns the user profile as a Protobuf buffer.
 */
export async function loginUser(): Promise<{ success: boolean; message: string; user?: User }> {
	if (!authStore.user) {
		throw new Error('No active Firebase session.');
	}

	const token = await authStore.user.getIdToken();

	const response = await fetch(`${USER_WORKER_URL}/users/login`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/x-protobuf'
		},
		credentials: 'include'
	});

	if (!response.ok) {
		throw new Error(`Login backend error: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();
	// Native ultra-fast decoding without JSON.parse
	const result = fromBinary(GetUserResponseSchema, new Uint8Array(buffer));

	return {
		success: result.success,
		message: result.message,
		user: result.user
	};
}

/**
 * Updates the authenticated user's profile info in D1.
 */
export async function updateUser(
	name: string,
	email: string,
	phone: string
): Promise<{ success: boolean; message: string }> {
	if (!authStore.user) {
		throw new Error('No active Firebase session.');
	}

	const token = await authStore.user.getIdToken();
	const userId = authStore.user.uid;

	// Serialize the data to bytes via Protobuf
	const request = create(UpdateUserRequestSchema, {
		id: userId,
		name,
		email,
		phone
	});
	const requestBody = toBinary(UpdateUserRequestSchema, request);

	const response = await fetch(`${USER_WORKER_URL}/users/update`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/x-protobuf',
			Accept: 'application/x-protobuf'
		},
		body: requestBody,
		credentials: 'include'
	});

	if (!response.ok) {
		throw new Error(`Error updating user: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();
	const result = fromBinary(GeneralResponseSchema, new Uint8Array(buffer));

	return {
		success: result.success,
		message: result.message
	};
}

/**
 * Gets the authenticated user's own profile by id. The backend only allows a user
 * to read their own profile, so this always requires the current Firebase token.
 */
export async function getUserById(
	id: string
): Promise<{ success: boolean; message: string; user?: User }> {
	if (!authStore.user) {
		throw new Error('No active Firebase session.');
	}

	const token = await authStore.user.getIdToken();

	const response = await fetch(`${USER_WORKER_URL}/users/get/${id}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/x-protobuf'
		},
		credentials: 'include'
	});

	if (!response.ok) {
		throw new Error(`Error getting user: ${response.statusText}`);
	}

	const buffer = await response.arrayBuffer();
	const result = fromBinary(GetUserResponseSchema, new Uint8Array(buffer));

	return {
		success: result.success,
		message: result.message,
		user: result.user
	};
}
