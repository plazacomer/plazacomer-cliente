// Orchestrates test:api: spins up two isolated, per-domain local D1s (users,
// catalog -- see plazacomer_co_users / plazacomer_co_catalog in each worker's
// wrangler.toml), applies fresh schema to each via the real `wrangler d1
// migrations` of the worker that owns the domain (plus a test-only admin-seed
// fixture for users), runs vitest against
// the four Rust workers under test (worker-user, worker-catalog,
// worker-catalog-admin, worker-user-admin), and only deletes the temp DBs if
// every test passed. A failed run keeps them in place so it can be inspected.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CLIENT_DIR = path.resolve(import.meta.dirname, '..');
const REPO_ROOT = path.resolve(CLIENT_DIR, '..');
const CLOUDFLARE_DIR = path.join(REPO_ROOT, 'plazacomer-cloudflare');
const WRANGLER_BIN = path.join(CLIENT_DIR, 'node_modules', '.bin', 'wrangler');

const persistTo = path.join(REPO_ROOT, `.wrangler-test-${Date.now()}`);

const cargoEnv = {
	...process.env,
	RUSTC: '/Users/christian.cabrera/.cargo/bin/rustc',
	PATH: `/Users/christian.cabrera/.cargo/bin:${process.env.PATH}`
};

/** @type {{ name: string, proc: import('node:child_process').ChildProcess }[]} */
const servers = [];

/**
 * @param {string} bin
 * @param {string[]} args
 * @param {import('node:child_process').SpawnOptions} opts
 * @returns {Promise<number>}
 */
function runToCompletion(bin, args, opts) {
	return new Promise((resolve, reject) => {
		const child = spawn(bin, args, { stdio: 'inherit', ...opts });
		child.on('error', reject);
		child.on('exit', (code) => resolve(code ?? 1));
	});
}

// Test-only fixtures (e.g. seed-admin.sql) that must never be part of a real
// migration, applied with `d1 execute` on top of the migrated schema.
/** @param {{ domain: string, workerDir: string, schemaFile: string }} opts */
async function applyExecFile({ domain, workerDir, schemaFile }) {
	console.log(`[test:api] applying tests/${schemaFile} to the fresh temp ${domain} DB...`);
	const code = await runToCompletion(
		WRANGLER_BIN,
		[
			'd1',
			'execute',
			'DB',
			'--local',
			'--env',
			'co',
			'--persist-to',
			persistTo,
			'--file',
			path.join(CLIENT_DIR, 'tests', schemaFile)
		],
		{ cwd: path.join(CLOUDFLARE_DIR, workerDir), env: process.env }
	);
	if (code !== 0) throw new Error(`db init (${domain}) failed with exit code ${code}`);
}

// Each domain has its own D1 (plazacomer_co_users / plazacomer_co_catalog) with
// real versioned migrations in the worker that owns it (worker-user/migrations,
// worker-catalog-admin/migrations) -- applied the same way a real deploy would,
// so the test schema can't drift from production the way a hand-rolled copy did.
/** @param {{ domain: string, workerDir: string }} opts */
async function applyMigrations({ domain, workerDir }) {
	console.log(`[test:api] applying ${workerDir}/migrations to the fresh temp ${domain} DB...`);
	const code = await runToCompletion(
		WRANGLER_BIN,
		['d1', 'migrations', 'apply', 'DB', '--local', '--env', 'co', '--persist-to', persistTo],
		{
			cwd: path.join(CLOUDFLARE_DIR, workerDir),
			env: process.env,
			stdio: ['ignore', 'inherit', 'inherit']
		}
	);
	if (code !== 0) throw new Error(`migrations apply (${domain}) failed with exit code ${code}`);
}

/**
 * @param {{ name: string, dir: string, port: number, inspectorPort: number, delayMs: number }} opts
 * @returns {Promise<void>}
 */
function startServer({ name, dir, port, inspectorPort, delayMs }) {
	return new Promise((resolve) => {
		setTimeout(() => {
			const proc = spawn(
				WRANGLER_BIN,
				[
					'dev',
					'--local',
					'--env',
					'co',
					'--port',
					String(port),
					'--persist-to',
					persistTo,
					'--inspector-port',
					String(inspectorPort)
				],
				{ cwd: path.join(CLOUDFLARE_DIR, dir), env: cargoEnv, stdio: 'inherit', detached: true }
			);
			servers.push({ name, proc });
			resolve(undefined);
		}, delayMs);
	});
}

async function waitForServersReady() {
	const urls = [
		'http://localhost:8787/users/list',
		'http://localhost:8788/stores',
		'http://localhost:8789/my-stores',
		'http://localhost:8791/users/admin/health'
	];
	for (;;) {
		try {
			await Promise.all(urls.map((u) => fetch(u)));
			console.log('[test:api] all local Wrangler (Rust) servers ready.');
			return;
		} catch {
			await new Promise((r) => setTimeout(r, 500));
		}
	}
}

// Explicit allowlist, not a bare `vitest run` -- otherwise any future test file
// dropped into tests/ (e.g. a manual/diagnostic one pointed at a fixed dev port
// test:api doesn't manage, like tests/manual-admin.test.ts) gets silently picked
// up by default glob discovery and makes this "isolated" run's pass/fail depend
// on whatever else happens to be running outside the temp DB this script builds.
const AUTOMATED_TEST_FILES = ['tests/user.test.ts', 'tests/catalog.test.ts'];

function runVitest() {
	return runToCompletion('yarn', ['vitest', 'run', ...AUTOMATED_TEST_FILES], {
		cwd: CLIENT_DIR,
		env: process.env
	});
}

function killServers() {
	return Promise.all(
		servers.map(
			({ proc }) =>
				new Promise((resolve) => {
					if (proc.exitCode !== null || proc.signalCode !== null) return resolve(undefined);
					proc.once('exit', resolve);
					try {
						process.kill(-(/** @type {number} */ (proc.pid)), 'SIGTERM');
					} catch {
						resolve(undefined);
					}
				})
		)
	);
}

let cleanedUp = false;
/** @param {number} code */
async function cleanupAndExit(code) {
	if (cleanedUp) return;
	cleanedUp = true;
	await killServers();
	if (code === 0) {
		fs.rmSync(persistTo, { recursive: true, force: true });
		console.log(`[test:api] all tests passed -- deleted temp DB at ${persistTo}`);
	} else {
		console.log(
			`[test:api] tests failed (or setup errored) -- keeping temp DB for inspection: ${persistTo}`
		);
	}
	process.exit(code);
}

process.on('SIGINT', () => cleanupAndExit(130));
process.on('SIGTERM', () => cleanupAndExit(143));

async function main() {
	fs.mkdirSync(persistTo, { recursive: true });
	console.log(`[test:api] temp D1 dir: ${persistTo}`);
	await applyMigrations({ domain: 'users', workerDir: 'worker-user' });
	await applyExecFile({
		domain: 'users (test fixture)',
		workerDir: 'worker-user',
		schemaFile: 'seed-admin.sql'
	});
	await applyMigrations({ domain: 'catalog', workerDir: 'worker-catalog-admin' });
	await startServer({
		name: 'worker-user',
		dir: 'worker-user',
		port: 8787,
		inspectorPort: 9229,
		delayMs: 0
	});
	await startServer({
		name: 'worker-catalog',
		dir: 'worker-catalog',
		port: 8788,
		inspectorPort: 9230,
		delayMs: 3000
	});
	await startServer({
		name: 'worker-catalog-admin',
		dir: 'worker-catalog-admin',
		port: 8789,
		inspectorPort: 9231,
		delayMs: 6000
	});
	await startServer({
		name: 'worker-user-admin',
		dir: 'worker-user-admin',
		port: 8791,
		inspectorPort: 9233,
		delayMs: 9000
	});
	await waitForServersReady();
	const vitestCode = await runVitest();
	await cleanupAndExit(vitestCode);
}

main().catch((err) => {
	console.error('[test:api]', err);
	cleanupAndExit(1);
});
