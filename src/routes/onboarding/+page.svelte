<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { m } from '$lib/paraglide/messages.js';

	type Step = 'welcome' | 'role' | 'profile' | 'done';
	type Role = 'buyer' | 'seller' | 'courier';

	// El link de /login manda ?rol=vendedor|repartidor (contrato de URL en español,
	// no lo tocamos ahí); acá lo traducimos al Role interno en inglés.
	const ROL_PARAM_TO_ROLE: Record<string, Role> = { vendedor: 'seller', repartidor: 'courier' };
	const rolParam = page.url.searchParams.get('rol');
	const preselectedRole = rolParam ? (ROL_PARAM_TO_ROLE[rolParam] ?? null) : null;

	let step = $state<Step>(preselectedRole ? 'profile' : 'welcome');
	let selectedRole = $state<Role | null>(preselectedRole);

	// Profile fields
	let name = $state('');
	let email = $state('');
	// Buyer
	let address = $state('');
	// Seller
	let storeName = $state('');
	let storeEmoji = $state('🍽️');
	let storeCategory = $state('');
	// Courier
	let vehicle = $state('');
	let vehiclePlate = $state('');

	const ROLES = [
		{
			id: 'buyer' as Role,
			emoji: '🛍️',
			title: m.onboarding_role_buyer_title(),
			desc: m.onboarding_role_buyer_desc(),
			color: '#2563EB',
			bg: 'rgba(37,99,235,.06)'
		},
		{
			id: 'seller' as Role,
			emoji: '🏪',
			title: m.onboarding_role_seller_title(),
			desc: m.onboarding_role_seller_desc(),
			color: '#7C3AED',
			bg: 'rgba(124,58,237,.06)'
		},
		{
			id: 'courier' as Role,
			emoji: '🛵',
			title: m.onboarding_role_courier_title(),
			desc: m.onboarding_role_courier_desc(),
			color: '#16A34A',
			bg: 'rgba(22,163,74,.06)'
		}
	];

	const VEHICLES = [
		{ key: 'motorcycle', emoji: '🛵', label: m.onboarding_vehicle_motorcycle() },
		{ key: 'bicycle', emoji: '🚲', label: m.onboarding_vehicle_bicycle() },
		{ key: 'mototaxi', emoji: '🛺', label: m.onboarding_vehicle_mototaxi() },
		{ key: 'car', emoji: '🚗', label: m.onboarding_vehicle_car() }
	];

	const CATEGORIES = [
		{ key: 'food', emoji: '🍽️', label: m.onboarding_category_food() },
		{ key: 'market', emoji: '🛒', label: m.onboarding_category_market() },
		{ key: 'fashion', emoji: '👗', label: m.onboarding_category_fashion() },
		{ key: 'tech', emoji: '💻', label: m.onboarding_category_tech() },
		{ key: 'beauty', emoji: '💄', label: m.onboarding_category_beauty() },
		{ key: 'services', emoji: '🔧', label: m.onboarding_category_services() }
	];

	const STORE_EMOJIS = [
		'🍽️',
		'🍕',
		'🥑',
		'🛒',
		'👗',
		'💄',
		'💻',
		'🔧',
		'🎒',
		'☕',
		'🍺',
		'🧃',
		'🎂',
		'🌿',
		'🎨',
		'📚'
	];

	const selectedRoleInfo = $derived(ROLES.find((r) => r.id === selectedRole));

	const destination = $derived(
		selectedRole === 'seller'
			? '/seller'
			: selectedRole === 'courier'
				? '/app/courier'
				: '/app/home'
	);

	const isProfileValid = $derived.by(() => {
		if (!name.trim()) return false;
		if (selectedRole === 'seller' && !storeName.trim()) return false;
		if (selectedRole === 'courier' && !vehicle) return false;
		return true;
	});

	function chooseRole(r: Role) {
		selectedRole = r;
		step = 'profile';
	}

	function finish() {
		step = 'done';
		// Redirect after 2.5s
		setTimeout(() => goto(destination), 2500);
	}
</script>

<div class="flex min-h-screen flex-col items-center justify-center px-5 py-10">
	<!-- Progress indicator (steps 2-4) -->
	{#if step !== 'welcome'}
		<div class="fixed top-0 right-0 left-0 z-10 h-1" style="background:var(--c-bg-secondary)">
			<div
				class="h-full rounded-r-full transition-all duration-500"
				style="background:var(--c-brand);width:{step === 'role'
					? '33'
					: step === 'profile'
						? '66'
						: '100'}%"
			></div>
		</div>
	{/if}

	<div class="w-full max-w-sm">
		<!-- ═══════════════════════════════════ WELCOME ══ -->
		{#if step === 'welcome'}
			<div class="text-center">
				<div class="mb-6 flex justify-center">
					<div
						class="flex h-20 w-20 items-center justify-center rounded-[22px] shadow-lg"
						style="background:var(--c-brand)"
					>
						<Logo size={44} />
					</div>
				</div>

				<div
					class="mb-2 font-mono text-[11px] font-bold tracking-[2px] uppercase"
					style="color:var(--c-brand)"
				>
					{m.onboarding_welcome_label()}
				</div>
				<h1 class="mb-1 font-display text-[36px] font-black tracking-tight">PLAZACOMER</h1>
				<p class="mb-8 text-[15px] leading-relaxed" style="color:var(--c-text-secondary)">
					{m.onboarding_welcome_tagline()}
				</p>

				<!-- Highlights -->
				<div class="mb-10 flex flex-col gap-3 text-left">
					{#each [{ icon: 'store', text: m.onboarding_highlight_stores() }, { icon: 'calendar', text: m.onboarding_highlight_services() }, { icon: 'truck', text: m.onboarding_highlight_delivery() }] as h}
						<div
							class="flex items-center gap-3.5 rounded-xl px-4 py-3"
							style="background:var(--c-bg-card);border:1px solid var(--c-border-soft)"
						>
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
								style="background:rgba(37,99,235,.08)"
							>
								<Icon name={h.icon} size={17} color="var(--c-brand)" />
							</div>
							<span class="text-[13.5px] font-semibold">{h.text}</span>
						</div>
					{/each}
				</div>

				<button
					onclick={() => (step = 'role')}
					class="w-full rounded-2xl py-4 font-display text-[16px] font-extrabold tracking-wide text-white"
					style="background:var(--c-brand);box-shadow:0 8px 24px rgba(37,99,235,.3)"
				>
					{m.onboarding_start_cta()} →
				</button>
				<p class="mt-4 text-[12px]" style="color:var(--c-text-muted)">
					{m.onboarding_free_no_card()}
				</p>
			</div>

			<!-- ═══════════════════════════════════ ROLE ══ -->
		{:else if step === 'role'}
			<div>
				<button
					onclick={() => (step = 'welcome')}
					class="mb-6 flex items-center gap-1.5 text-[13px] font-semibold"
					style="color:var(--c-text-muted)"
				>
					<Icon name="arrowLeft" size={15} />
					{m.onboarding_back()}
				</button>

				<div
					class="mb-1 font-mono text-[11px] font-bold tracking-[1.5px] uppercase"
					style="color:var(--c-brand)"
				>
					{m.onboarding_step_1_of_2()}
				</div>
				<h2 class="mb-1.5 font-display text-[26px] font-extrabold">
					{m.onboarding_role_question()}
				</h2>
				<p class="mb-7 text-sm" style="color:var(--c-text-secondary)">
					{m.onboarding_role_hint()}
				</p>

				<div class="flex flex-col gap-3">
					{#each ROLES as role}
						<button
							onclick={() => chooseRole(role.id)}
							class="flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
							style="background:{role.bg};border-color:{role.color}20;box-shadow:0 2px 12px {role.color}10"
						>
							<div
								class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[28px]"
								style="background:white;box-shadow:0 2px 8px rgba(0,0,0,.08)"
							>
								{role.emoji}
							</div>
							<div class="min-w-0 flex-1">
								<div class="mb-0.5 font-display text-[16px] font-extrabold">{role.title}</div>
								<div class="text-[12.5px] leading-snug" style="color:var(--c-text-secondary)">
									{role.desc}
								</div>
							</div>
							<Icon name="arrowRight" size={18} color="var(--c-text-muted)" />
						</button>
					{/each}
				</div>
			</div>

			<!-- ═══════════════════════════════════ PROFILE ══ -->
		{:else if step === 'profile'}
			<div>
				<button
					onclick={() => (step = 'role')}
					class="mb-6 flex items-center gap-1.5 text-[13px] font-semibold"
					style="color:var(--c-text-muted)"
				>
					<Icon name="arrowLeft" size={15} />
					{m.onboarding_change_role()}
				</button>

				<!-- Selected role chip -->
				{#if selectedRoleInfo}
					<div
						class="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold"
						style="background:{selectedRoleInfo.bg};color:{selectedRoleInfo.color}"
					>
						{selectedRoleInfo.emoji}
						{selectedRoleInfo.title}
					</div>
				{/if}

				<div
					class="mb-1 font-mono text-[11px] font-bold tracking-[1.5px] uppercase"
					style="color:var(--c-brand)"
				>
					{m.onboarding_step_2_of_2()}
				</div>
				<h2 class="mb-5 font-display text-[24px] font-extrabold">{m.onboarding_profile_title()}</h2>

				<div class="flex flex-col gap-4">
					<!-- Name (all roles) -->
					<div>
						<label
							class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
							style="color:var(--c-text-muted)"
						>
							{m.onboarding_name_label()}
						</label>
						<input
							bind:value={name}
							type="text"
							placeholder={m.onboarding_name_placeholder()}
							class="h-12 w-full rounded-xl border px-4 text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
						/>
					</div>

					<!-- Email (all roles) -->
					<div>
						<label
							class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
							style="color:var(--c-text-muted)"
						>
							{m.onboarding_email_label()}
						</label>
						<input
							bind:value={email}
							type="email"
							placeholder={m.onboarding_email_placeholder()}
							class="h-12 w-full rounded-xl border px-4 text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
						/>
					</div>

					<!-- ── BUYER ── -->
					{#if selectedRole === 'buyer'}
						<div>
							<label
								class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
								style="color:var(--c-text-muted)"
							>
								{m.onboarding_address_label()}
							</label>
							<input
								bind:value={address}
								type="text"
								placeholder={m.onboarding_address_placeholder()}
								class="h-12 w-full rounded-xl border px-4 text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- ── SELLER ── -->
					{:else if selectedRole === 'seller'}
						<!-- Store emoji -->
						<div>
							<label
								class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
								style="color:var(--c-text-muted)"
							>
								{m.onboarding_store_emoji_label()}
							</label>
							<div class="flex flex-wrap gap-2">
								{#each STORE_EMOJIS as em}
									<button
										onclick={() => (storeEmoji = em)}
										class="flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl transition-all"
										style="border-color:{storeEmoji === em
											? 'var(--c-brand)'
											: 'transparent'};background:var(--c-bg-card)"
									>
										{em}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label
								class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
								style="color:var(--c-text-muted)"
							>
								{m.onboarding_store_name_label()}
							</label>
							<input
								bind:value={storeName}
								type="text"
								placeholder={m.onboarding_store_name_placeholder()}
								class="h-12 w-full rounded-xl border px-4 text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
							/>
						</div>

						<!-- Category -->
						<div>
							<label
								class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
								style="color:var(--c-text-muted)"
							>
								{m.onboarding_category_label()}
							</label>
							<div class="grid grid-cols-3 gap-2">
								{#each CATEGORIES as cat}
									<button
										onclick={() => (storeCategory = cat.key)}
										class="flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 text-[12px] font-bold transition-all"
										style="border-color:{storeCategory === cat.key
											? 'var(--c-brand)'
											: 'var(--c-border)'};background:{storeCategory === cat.key
											? 'rgba(37,99,235,.06)'
											: 'var(--c-bg-card)'};color:{storeCategory === cat.key
											? 'var(--c-brand)'
											: 'var(--c-text-primary)'}"
									>
										<span class="text-lg">{cat.emoji}</span>
										{cat.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- ── COURIER ── -->
					{:else if selectedRole === 'courier'}
						<div>
							<label
								class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
								style="color:var(--c-text-muted)"
							>
								{m.onboarding_vehicle_type_label()}
							</label>
							<div class="grid grid-cols-2 gap-2">
								{#each VEHICLES as v}
									<button
										onclick={() => (vehicle = v.key)}
										class="rounded-xl border-2 py-3 text-[13px] font-bold transition-all"
										style="border-color:{vehicle === v.key
											? 'var(--c-success)'
											: 'var(--c-border)'};background:{vehicle === v.key
											? 'rgba(22,163,74,.06)'
											: 'var(--c-bg-card)'};color:{vehicle === v.key
											? '#16A34A'
											: 'var(--c-text-primary)'}"
									>
										{v.emoji}
										{v.label}
									</button>
								{/each}
							</div>
						</div>

						{#if vehicle}
							<div>
								<label
									class="mb-1.5 block text-[11px] font-bold tracking-widest uppercase"
									style="color:var(--c-text-muted)"
								>
									{m.onboarding_plate_label()}
								</label>
								<input
									bind:value={vehiclePlate}
									type="text"
									placeholder={m.onboarding_plate_placeholder()}
									class="h-12 w-full rounded-xl border px-4 text-[14px] uppercase outline-none"
									style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"
								/>
							</div>
						{/if}
					{/if}
				</div>

				<button
					onclick={finish}
					disabled={!isProfileValid}
					class="mt-7 w-full rounded-2xl py-4 font-display text-[15px] font-extrabold text-white transition-all disabled:opacity-40"
					style="background:{selectedRoleInfo?.color ??
						'var(--c-brand)'};box-shadow:0 8px 24px {selectedRoleInfo?.color ?? '#2563EB'}30"
				>
					{selectedRole === 'buyer'
						? m.onboarding_submit_buyer()
						: selectedRole === 'seller'
							? m.onboarding_submit_seller()
							: m.onboarding_submit_courier()} →
				</button>
			</div>

			<!-- ═══════════════════════════════════ DONE ══ -->
		{:else if step === 'done'}
			<div class="text-center">
				<!-- Check animation -->
				<div
					class="mx-auto mb-6 flex h-24 w-24 animate-bounce items-center justify-center rounded-full"
					style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'}20"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full"
						style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'}"
					>
						<Icon name="check" size={32} color="#fff" strokeWidth={2.5} />
					</div>
				</div>

				<h2 class="mb-2 font-display text-[30px] font-black">
					{selectedRole === 'buyer'
						? m.onboarding_done_title_buyer()
						: selectedRole === 'seller'
							? m.onboarding_done_title_seller()
							: m.onboarding_done_title_courier()}
				</h2>
				<p class="mb-2 text-[15px]" style="color:var(--c-text-secondary)">
					{m.onboarding_done_greeting()}{#if name}, <strong>{name.split(' ')[0]}</strong>{/if}.
				</p>
				<p class="text-[13px]" style="color:var(--c-text-muted)">
					{selectedRole === 'buyer'
						? m.onboarding_done_subtitle_buyer()
						: selectedRole === 'seller'
							? m.onboarding_done_subtitle_seller()
							: m.onboarding_done_subtitle_courier()}
				</p>

				<!-- Dots loader -->
				<div class="mt-8 flex items-center justify-center gap-2">
					{#each [0, 150, 300] as delay}
						<div
							class="h-2.5 w-2.5 animate-pulse rounded-full"
							style="background:{selectedRoleInfo?.color ??
								'var(--c-brand)'};animation-delay:{delay}ms"
						></div>
					{/each}
				</div>

				<button
					onclick={() => goto(destination)}
					class="mt-8 text-[13px] font-semibold underline underline-offset-2"
					style="color:var(--c-text-muted)"
				>
					{m.onboarding_go_now()} →
				</button>
			</div>
		{/if}
	</div>
</div>
