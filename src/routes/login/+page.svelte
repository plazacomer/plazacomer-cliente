<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { authStore } from '$lib/stores/auth.svelte';

	type Provider = {
		id: 'google' | 'facebook' | 'apple';
		label: string;
		icon: string;
		bg: string;
		color: string;
		border: string;
	};

	const providers: Provider[] = [
		{
			id: 'google',
			label: 'Continuar con Google',
			icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
				<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
				<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
				<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
			</svg>`,
			bg: 'white',
			color: '#1F1F1F',
			border: '#DADCE0',
		},
		{
			id: 'facebook',
			label: 'Continuar con Facebook',
			icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
			</svg>`,
			bg: '#1877F2',
			color: 'white',
			border: '#1877F2',
		},
		{
			id: 'apple',
			label: 'Continuar con Apple',
			icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
				<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="white"/>
			</svg>`,
			bg: '#000',
			color: 'white',
			border: '#000',
		},
	];

	let signingIn = $state<string | null>(null);

	async function handleLogin(provider: Provider) {
		if (signingIn) return;
		signingIn = provider.id;
		authStore.clearError();
		const methodMap = {
			google:   () => authStore.signInWithGoogle(),
			facebook: () => authStore.signInWithFacebook(),
			apple:    () => authStore.signInWithApple(),
		};
		await methodMap[provider.id]();
		signingIn = null;
		if (authStore.isAuthenticated) goto('/app/home');
	}

	function handleGuest() {
		goto('/app/home');
	}
</script>

<div
	class="min-h-screen flex items-center justify-center p-6"
	style="background:var(--c-bg-primary)"
>
	<div
		class="w-full grid overflow-hidden"
		style="max-width:960px;grid-template-columns:1fr;border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,.12);border:1px solid var(--c-border-soft);background:var(--c-bg-card)"
	>
		<style>
			@media (min-width: 768px) {
				.login-grid { grid-template-columns: 1fr 1fr !important; }
			}
		</style>
		<div class="login-grid grid" style="grid-template-columns:1fr">

			<!-- Hero side -->
			<div
				class="flex flex-col items-center justify-center text-center px-8 py-12 relative overflow-hidden min-h-[280px]"
				style="background:radial-gradient(ellipse at center, #1A1A2E 0%, #0A0A14 100%)"
			>
				<div class="absolute inset-0"
					style="background:radial-gradient(circle at 30% 40%, rgba(236,72,153,.15), transparent 50%),radial-gradient(circle at 70% 70%, rgba(37,99,235,.15), transparent 50%)">
				</div>
				<div class="relative z-10 animate-radial flex flex-col items-center">
					<Logo size={120}/>
					<div class="font-display text-3xl font-extrabold text-white tracking-[1.5px] mt-5">PLAZACOMER</div>
					<div class="text-[11px] text-[#A0A0B8] tracking-[3px] uppercase mt-1">Tu plaza · Tu gente</div>
				</div>
			</div>

			<!-- Form side -->
			<div class="px-7 py-10 md:px-12">
				<h2 class="font-display text-2xl font-bold mb-2">Iniciar sesión</h2>
				<p class="text-sm mb-7" style="color:var(--c-text-secondary)">
					Accede con tu cuenta para ver ofertas y seguir tus tiendas favoritas.
				</p>

				{#if authStore.error}
					<div class="mb-4 px-4 py-3 rounded-xl text-sm" style="background:rgba(239,68,68,.1);color:var(--c-error);border:1px solid rgba(239,68,68,.2)">
						{authStore.error}
					</div>
				{/if}

				<div class="flex flex-col gap-2.5">
					{#each providers as p}
						<button
							onclick={() => handleLogin(p)}
							disabled={!!signingIn}
							class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border cursor-pointer"
							style="border-color:{p.border};background:{p.bg};color:{p.color};opacity:{signingIn && signingIn !== p.id ? 0.45 : 1};box-shadow:0 1px 3px rgba(0,0,0,.1)"
						>
							{#if signingIn === p.id}
								<div class="w-5 h-5 flex items-center justify-center">
									<div class="w-4 h-4 border-2 rounded-full animate-spin" style="border-color:{p.color}40;border-top-color:{p.color}"></div>
								</div>
							{:else}
								<span class="w-5 h-5 flex items-center justify-center flex-shrink-0">{@html p.icon}</span>
							{/if}
							<span class="flex-1 text-left">
								{signingIn === p.id ? 'Conectando...' : p.label}
							</span>
							<Icon name="arrowRight" size={16} color={p.color === 'white' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)'}/>
						</button>
					{/each}
				</div>

				<div class="flex items-center gap-3 my-7 text-xs" style="color:var(--c-text-muted)">
					<div class="flex-1 h-px" style="background:var(--c-border-soft)"></div>
					<span>o como invitado</span>
					<div class="flex-1 h-px" style="background:var(--c-border-soft)"></div>
				</div>

				<button
					onclick={handleGuest}
					class="w-full py-3 rounded-xl text-sm font-medium transition-all border cursor-pointer"
					style="border-color:var(--c-border);background:transparent;color:var(--c-text-secondary)"
				>
					Explorar sin iniciar sesión
				</button>

				<p class="mt-7 text-[11px] text-center leading-relaxed" style="color:var(--c-text-muted)">
					Al continuar aceptas los
					<span class="font-semibold" style="color:var(--c-brand)">Términos</span>
					y la
					<span class="font-semibold" style="color:var(--c-brand)">Política de Privacidad</span>
				</p>

				<!-- CTAs vendedor / repartidor -->
				<div class="mt-6 p-4 rounded-2xl" style="background:var(--c-bg-secondary)">
					<div class="text-[11px] font-bold uppercase tracking-[1px] text-center mb-2.5" style="color:var(--c-text-muted)">
						¿Trabajas con nosotros?
					</div>
					<div class="grid grid-cols-2 gap-2">
						<button
							onclick={() => goto('/onboarding?rol=vendedor')}
							class="p-3 rounded-xl text-white text-center flex flex-col items-center gap-1 font-semibold text-xs leading-tight cursor-pointer"
							style="background:linear-gradient(120deg,var(--c-text-primary),var(--c-brand))">
							<span class="text-2xl">🏪</span>
							Vende en<br/>PlazaComer
						</button>
						<button
							onclick={() => goto('/onboarding?rol=repartidor')}
							class="p-3 rounded-xl text-white text-center flex flex-col items-center gap-1 font-semibold text-xs leading-tight cursor-pointer"
							style="background:linear-gradient(120deg,#16A34A,#0F766E)">
							<span class="text-2xl">🛵</span>
							Sé<br/>repartidor
						</button>
					</div>
				</div>
			</div>

		</div>
	</div>
</div>
