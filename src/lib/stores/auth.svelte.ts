import { browser } from '$app/environment';
import { getFirebaseAuth, signInWithGoogle, signInWithFacebook, signInWithApple, signOut as firebaseSignOut, trackEvent, type User } from '$lib/firebase';
import { onAuthStateChanged, getAdditionalUserInfo, type UserCredential } from 'firebase/auth';

function createAuth() {
	let user = $state<User | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let configured = $state(true);

	if (browser) {
		try {
			const auth = getFirebaseAuth();
			onAuthStateChanged(auth, (u) => {
				user = u;
				loading = false;
			});
		} catch {
			configured = false;
			loading = false;
		}
	}

	async function runSignIn(method: string, fn: () => Promise<UserCredential>) {
		if (!configured) {
			error = 'Firebase no está configurado. Agrega tus credenciales en el archivo .env';
			return;
		}
		error = null;
		try {
			const result = await fn();
			const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
			trackEvent(isNewUser ? 'sign_up' : 'login', { method });
		} catch (e: unknown) {
			const code = (e as { code?: string }).code ?? '';
			if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
			error = code === 'auth/account-exists-with-different-credential'
				? 'Ya existe una cuenta con ese correo. Intenta con otro método.'
				: 'Error al iniciar sesión. Intenta de nuevo.';
		}
	}

	return {
		get user()         { return user; },
		get loading()      { return loading; },
		get error()        { return error; },
		get configured()   { return configured; },
		get isAuthenticated() { return !!user; },
		clearError() { error = null; },
		signInWithGoogle()   { return runSignIn('google', signInWithGoogle); },
		signInWithFacebook() { return runSignIn('facebook', signInWithFacebook); },
		signInWithApple()    { return runSignIn('apple', signInWithApple); },
		async signOut() {
			if (!configured) return;
			await firebaseSignOut();
			user = null;
		},
	};
}

export const authStore = createAuth();
