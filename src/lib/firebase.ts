import { browser } from '$app/env';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	FacebookAuthProvider,
	OAuthProvider,
	signInWithPopup,
	signOut as _signOut,
	type Auth,
	type User
} from 'firebase/auth';
import { isSupported, getAnalytics, logEvent, type Analytics } from 'firebase/analytics';

export type { User };

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _analytics: Analytics | null = null;

function initFirebase() {
	if (!browser || _app) return;
	_app = getApps().length
		? getApps()[0]
		: initializeApp({
				apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
				authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
				projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
				storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
				messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
				appId: import.meta.env.VITE_FIREBASE_APP_ID,
				measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
			});
	_auth = getAuth(_app);

	const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
	if (measurementId) {
		isSupported()
			.then((supported) => {
				if (supported && _app) _analytics = getAnalytics(_app);
			})
			.catch(() => {});
	}
}

export function getFirebaseAuth(): Auth {
	initFirebase();
	if (!_auth) throw new Error('Firebase Auth not available outside browser');
	return _auth;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
	if (!_analytics) return;
	logEvent(_analytics, name, import.meta.env.DEV ? { ...params, debug_mode: true } : params);
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export async function signInWithGoogle() {
	return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signInWithFacebook() {
	return signInWithPopup(getFirebaseAuth(), facebookProvider);
}

export async function signInWithApple() {
	return signInWithPopup(getFirebaseAuth(), appleProvider);
}

export async function signOut() {
	return _signOut(getFirebaseAuth());
}
