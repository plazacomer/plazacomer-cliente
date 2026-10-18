import { describe, it, expect } from 'vitest';
import {
	GeneralResponseSchema,
	ListUsersResponseSchema,
	GetTaxDataResponseSchema,
	SetUserRoleRequestSchema,
	UpsertTaxDataRequestSchema
} from '../src/lib/gen/user_pb';
import { toBinary, fromBinary, create } from '@bufbuild/protobuf';

// Point to the local worker-user-admin running dev port (8790) or the test port (8791)
const ADMIN_WORKER_URL = process.env.TEST_WORKER_URL || 'http://localhost:8790';
const adminAuthHeader = { Authorization: 'Bearer mock-token-e2e-admin-seed' };

describe('Manual/Diagnostic Tests - worker-user-admin', () => {
	it('Should check if the worker is healthy and returns GeneralResponse', async () => {
		console.log(
			`Connecting to worker-user-admin health at ${ADMIN_WORKER_URL}/users/admin/health...`
		);
		const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/health`, {
			headers: { Accept: 'application/x-protobuf' }
		});

		expect(res.status).toBe(200);
		expect(res.headers.get('Content-Type')).toBe('application/x-protobuf');

		const bytes = new Uint8Array(await res.arrayBuffer());
		const response = fromBinary(GeneralResponseSchema, bytes);

		console.log('✓ Health status response:', response);
		expect(response.success).toBe(true);
		expect(response.message).toContain('healthy');
	});

	it('Should access dashboard when authenticated', async () => {
		console.log(`Connecting to dashboard at ${ADMIN_WORKER_URL}/users/admin/dashboard...`);
		const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/dashboard`, {
			headers: {
				Accept: 'application/x-protobuf',
				...adminAuthHeader
			}
		});

		expect(res.status).toBe(200);
		const bytes = new Uint8Array(await res.arrayBuffer());
		const response = fromBinary(GeneralResponseSchema, bytes);

		console.log('✓ Dashboard response:', response);
		expect(response.success).toBe(true);
		expect(response.id).toBe('e2e-admin-seed');
	});

	it('Should fetch user list', async () => {
		console.log(`Connecting to list users at ${ADMIN_WORKER_URL}/users/admin/users...`);
		const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/users`, {
			headers: {
				Accept: 'application/x-protobuf',
				...adminAuthHeader
			}
		});

		expect(res.status).toBe(200);
		const bytes = new Uint8Array(await res.arrayBuffer());
		const response = fromBinary(ListUsersResponseSchema, bytes);

		console.log(
			`✓ List users response: success=${response.success}, found=${response.users?.length || 0} users`
		);
		expect(response.success).toBe(true);
		if (response.users && response.users.length > 0) {
			console.log('First user details:', {
				id: response.users[0].id,
				name: response.users[0].name,
				role: response.users[0].roleId,
				blocked: response.users[0].blocked
			});
		}
	});

	it('Should reject unauthenticated calls to user list', async () => {
		const res = await fetch(`${ADMIN_WORKER_URL}/users/admin/users`, {
			headers: { Accept: 'application/x-protobuf' }
		});
		expect(res.status).toBe(401);
	});
});
