<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<div
	class="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
	style="background:radial-gradient(ellipse at center, #1A1A2E 0%, #0A0A14 100%)"
>
	<!-- Colored blobs -->
	{#each [
		{ c: '#EA580C', x: '10%', y: '20%', s: 180 },
		{ c: '#2563EB', x: '80%', y: '15%', s: 220 },
		{ c: '#7C3AED', x: '85%', y: '75%', s: 200 },
		{ c: '#16A34A', x: '15%', y: '80%', s: 180 },
		{ c: '#EC4899', x: '50%', y: '90%', s: 160 },
	] as blob}
		<div
			class="absolute rounded-full pointer-events-none"
			style="left:{blob.x};top:{blob.y};width:{blob.s}px;height:{blob.s}px;background:{blob.c};opacity:.18;filter:blur(60px)"
		></div>
	{/each}

	<div class="relative z-10 text-center animate-fade-in">
		<div class="mb-8 animate-radial inline-block">
			<Logo size={160}/>
		</div>
		<h1 class="font-display text-5xl font-extrabold text-white tracking-[2px] mb-2">
			PLAZACOMER
		</h1>
		<p class="text-[13px] text-[#A0A0B8] tracking-[4px] uppercase mb-12">
			{m.landing_tagline()}
		</p>

		<div class="max-w-sm mx-auto">
			<p class="text-base text-[#E0E0E8] leading-relaxed mb-8">
				{m.landing_description()}
			</p>
			<Button variant="brand" size="lg" fullWidth onclick={() => goto('/login')}>
				{m.landing_login_cta()}
				<Icon name="arrowRight" size={18}/>
			</Button>
			<button onclick={() => goto('/onboarding')}
				class="mt-4 w-full py-3.5 rounded-2xl font-display font-bold text-[15px] border-2 border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all">
				{m.landing_signup_cta()}
			</button>
		</div>
	</div>
</div>
