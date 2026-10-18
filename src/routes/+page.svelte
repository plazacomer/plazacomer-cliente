<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { m } from '$lib/paraglide/messages.js';
</script>

<div
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
	style="background:radial-gradient(ellipse at center, #1A1A2E 0%, #0A0A14 100%)"
>
	<!-- Colored blobs -->
	{#each [{ c: '#EA580C', x: '10%', y: '20%', s: 180 }, { c: '#2563EB', x: '80%', y: '15%', s: 220 }, { c: '#7C3AED', x: '85%', y: '75%', s: 200 }, { c: '#16A34A', x: '15%', y: '80%', s: 180 }, { c: '#EC4899', x: '50%', y: '90%', s: 160 }] as blob, idx (idx)}
		<div
			class="pointer-events-none absolute rounded-full"
			style="left:{blob.x};top:{blob.y};width:{blob.s}px;height:{blob.s}px;background:{blob.c};opacity:.18;filter:blur(60px)"
		></div>
	{/each}

	<div class="animate-fade-in relative z-10 text-center">
		<div class="animate-radial mb-8 inline-block">
			<Logo size={160} />
		</div>
		<h1 class="mb-2 font-display text-5xl font-extrabold tracking-[2px] text-white">PLAZACOMER</h1>
		<p class="mb-12 text-[13px] tracking-[4px] text-[#A0A0B8] uppercase">
			{m.landing_tagline()}
		</p>

		<div class="mx-auto max-w-sm">
			<p class="mb-8 text-base leading-relaxed text-[#E0E0E8]">
				{m.landing_description()}
			</p>
			<Button variant="brand" size="lg" fullWidth onclick={() => goto('/login')}>
				{m.landing_login_cta()}
				<Icon name="arrowRight" size={18} />
			</Button>
			<button
				onclick={() => goto('/onboarding')}
				class="mt-4 w-full rounded-2xl border-2 border-white/20 py-3.5 font-display text-[15px] font-bold text-white/80 transition-all hover:border-white/40 hover:text-white"
			>
				{m.landing_signup_cta()}
			</button>
		</div>
	</div>
</div>
