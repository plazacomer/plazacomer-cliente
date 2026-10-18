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
	let storeName  = $state('');
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
			bg: 'rgba(37,99,235,.06)',
		},
		{
			id: 'seller' as Role,
			emoji: '🏪',
			title: m.onboarding_role_seller_title(),
			desc: m.onboarding_role_seller_desc(),
			color: '#7C3AED',
			bg: 'rgba(124,58,237,.06)',
		},
		{
			id: 'courier' as Role,
			emoji: '🛵',
			title: m.onboarding_role_courier_title(),
			desc: m.onboarding_role_courier_desc(),
			color: '#16A34A',
			bg: 'rgba(22,163,74,.06)',
		},
	];

	const VEHICLES = [
		{ key: 'motorcycle', emoji: '🛵', label: m.onboarding_vehicle_motorcycle() },
		{ key: 'bicycle',    emoji: '🚲', label: m.onboarding_vehicle_bicycle() },
		{ key: 'mototaxi',   emoji: '🛺', label: m.onboarding_vehicle_mototaxi() },
		{ key: 'car',        emoji: '🚗', label: m.onboarding_vehicle_car() },
	];

	const CATEGORIES = [
		{ key: 'food',     emoji: '🍽️', label: m.onboarding_category_food() },
		{ key: 'market',   emoji: '🛒', label: m.onboarding_category_market() },
		{ key: 'fashion',  emoji: '👗', label: m.onboarding_category_fashion() },
		{ key: 'tech',     emoji: '💻', label: m.onboarding_category_tech() },
		{ key: 'beauty',   emoji: '💄', label: m.onboarding_category_beauty() },
		{ key: 'services', emoji: '🔧', label: m.onboarding_category_services() },
	];

	const STORE_EMOJIS = ['🍽️','🍕','🥑','🛒','👗','💄','💻','🔧','🎒','☕','🍺','🧃','🎂','🌿','🎨','📚'];

	const selectedRoleInfo = $derived(ROLES.find(r => r.id === selectedRole));

	const destination = $derived(
		selectedRole === 'seller'  ? '/seller' :
		selectedRole === 'courier' ? '/app/courier' :
		'/app/home'
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

<div class="min-h-screen flex flex-col items-center justify-center px-5 py-10">

	<!-- Progress indicator (steps 2-4) -->
	{#if step !== 'welcome'}
		<div class="fixed top-0 left-0 right-0 z-10 h-1" style="background:var(--c-bg-secondary)">
			<div class="h-full transition-all duration-500 rounded-r-full"
				style="background:var(--c-brand);width:{step === 'role' ? '33' : step === 'profile' ? '66' : '100'}%"></div>
		</div>
	{/if}

	<div class="w-full max-w-sm">

		<!-- ═══════════════════════════════════ WELCOME ══ -->
		{#if step === 'welcome'}
			<div class="text-center">
				<div class="flex justify-center mb-6">
					<div class="w-20 h-20 rounded-[22px] flex items-center justify-center shadow-lg"
						style="background:var(--c-brand)">
						<Logo size={44}/>
					</div>
				</div>

				<div class="font-mono text-[11px] font-bold uppercase tracking-[2px] mb-2"
					style="color:var(--c-brand)">
					{m.onboarding_welcome_label()}
				</div>
				<h1 class="font-display text-[36px] font-black tracking-tight mb-1">PLAZACOMER</h1>
				<p class="text-[15px] leading-relaxed mb-8" style="color:var(--c-text-secondary)">
					{m.onboarding_welcome_tagline()}
				</p>

				<!-- Highlights -->
				<div class="flex flex-col gap-3 mb-10 text-left">
					{#each [
						{ icon: 'store',    text: m.onboarding_highlight_stores() },
						{ icon: 'calendar', text: m.onboarding_highlight_services() },
						{ icon: 'truck',    text: m.onboarding_highlight_delivery() },
					] as h}
						<div class="flex items-center gap-3.5 px-4 py-3 rounded-xl"
							style="background:var(--c-bg-card);border:1px solid var(--c-border-soft)">
							<div class="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
								style="background:rgba(37,99,235,.08)">
								<Icon name={h.icon} size={17} color="var(--c-brand)"/>
							</div>
							<span class="text-[13.5px] font-semibold">{h.text}</span>
						</div>
					{/each}
				</div>

				<button onclick={() => step = 'role'}
					class="w-full py-4 rounded-2xl font-display font-extrabold text-[16px] text-white tracking-wide"
					style="background:var(--c-brand);box-shadow:0 8px 24px rgba(37,99,235,.3)">
					{m.onboarding_start_cta()} →
				</button>
				<p class="text-[12px] mt-4" style="color:var(--c-text-muted)">{m.onboarding_free_no_card()}</p>
			</div>

		<!-- ═══════════════════════════════════ ROLE ══ -->
		{:else if step === 'role'}
			<div>
				<button onclick={() => step = 'welcome'}
					class="flex items-center gap-1.5 text-[13px] font-semibold mb-6"
					style="color:var(--c-text-muted)">
					<Icon name="arrowLeft" size={15}/>
					{m.onboarding_back()}
				</button>

				<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">
					{m.onboarding_step_1_of_2()}
				</div>
				<h2 class="font-display text-[26px] font-extrabold mb-1.5">{m.onboarding_role_question()}</h2>
				<p class="text-sm mb-7" style="color:var(--c-text-secondary)">
					{m.onboarding_role_hint()}
				</p>

				<div class="flex flex-col gap-3">
					{#each ROLES as role}
						<button
							onclick={() => chooseRole(role.id)}
							class="flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5"
							style="background:{role.bg};border-color:{role.color}20;box-shadow:0 2px 12px {role.color}10">
							<div class="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] shrink-0"
								style="background:white;box-shadow:0 2px 8px rgba(0,0,0,.08)">
								{role.emoji}
							</div>
							<div class="flex-1 min-w-0">
								<div class="font-display text-[16px] font-extrabold mb-0.5">{role.title}</div>
								<div class="text-[12.5px] leading-snug" style="color:var(--c-text-secondary)">{role.desc}</div>
							</div>
							<Icon name="arrowRight" size={18} color="var(--c-text-muted)"/>
						</button>
					{/each}
				</div>
			</div>

		<!-- ═══════════════════════════════════ PROFILE ══ -->
		{:else if step === 'profile'}
			<div>
				<button onclick={() => step = 'role'}
					class="flex items-center gap-1.5 text-[13px] font-semibold mb-6"
					style="color:var(--c-text-muted)">
					<Icon name="arrowLeft" size={15}/>
					{m.onboarding_change_role()}
				</button>

				<!-- Selected role chip -->
				{#if selectedRoleInfo}
					<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[12px] font-bold"
						style="background:{selectedRoleInfo.bg};color:{selectedRoleInfo.color}">
						{selectedRoleInfo.emoji} {selectedRoleInfo.title}
					</div>
				{/if}

				<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">
					{m.onboarding_step_2_of_2()}
				</div>
				<h2 class="font-display text-[24px] font-extrabold mb-5">{m.onboarding_profile_title()}</h2>

				<div class="flex flex-col gap-4">
					<!-- Name (all roles) -->
					<div>
						<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
							{m.onboarding_name_label()}
						</label>
						<input bind:value={name} type="text" placeholder={m.onboarding_name_placeholder()}
							class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
					</div>

					<!-- Email (all roles) -->
					<div>
						<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
							{m.onboarding_email_label()}
						</label>
						<input bind:value={email} type="email" placeholder={m.onboarding_email_placeholder()}
							class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
					</div>

					<!-- ── BUYER ── -->
					{#if selectedRole === 'buyer'}
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								{m.onboarding_address_label()}
							</label>
							<input bind:value={address} type="text" placeholder={m.onboarding_address_placeholder()}
								class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
						</div>

					<!-- ── SELLER ── -->
					{:else if selectedRole === 'seller'}
						<!-- Store emoji -->
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								{m.onboarding_store_emoji_label()}
							</label>
							<div class="flex flex-wrap gap-2">
								{#each STORE_EMOJIS as em}
									<button onclick={() => storeEmoji = em}
										class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all"
										style="border-color:{storeEmoji === em ? 'var(--c-brand)' : 'transparent'};background:var(--c-bg-card)">
										{em}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								{m.onboarding_store_name_label()}
							</label>
							<input bind:value={storeName} type="text" placeholder={m.onboarding_store_name_placeholder()}
								class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
						</div>

						<!-- Category -->
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								{m.onboarding_category_label()}
							</label>
							<div class="grid grid-cols-3 gap-2">
								{#each CATEGORIES as cat}
									<button onclick={() => storeCategory = cat.key}
										class="py-2.5 px-2 rounded-xl text-[12px] font-bold border-2 flex flex-col items-center gap-1 transition-all"
										style="border-color:{storeCategory === cat.key ? 'var(--c-brand)' : 'var(--c-border)'};background:{storeCategory === cat.key ? 'rgba(37,99,235,.06)' : 'var(--c-bg-card)'};color:{storeCategory === cat.key ? 'var(--c-brand)' : 'var(--c-text-primary)'}">
										<span class="text-lg">{cat.emoji}</span>
										{cat.label}
									</button>
								{/each}
							</div>
						</div>

					<!-- ── COURIER ── -->
					{:else if selectedRole === 'courier'}
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								{m.onboarding_vehicle_type_label()}
							</label>
							<div class="grid grid-cols-2 gap-2">
								{#each VEHICLES as v}
									<button onclick={() => vehicle = v.key}
										class="py-3 rounded-xl text-[13px] font-bold border-2 transition-all"
										style="border-color:{vehicle === v.key ? 'var(--c-success)' : 'var(--c-border)'};background:{vehicle === v.key ? 'rgba(22,163,74,.06)' : 'var(--c-bg-card)'};color:{vehicle === v.key ? '#16A34A' : 'var(--c-text-primary)'}">
										{v.emoji} {v.label}
									</button>
								{/each}
							</div>
						</div>

						{#if vehicle}
							<div>
								<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
									{m.onboarding_plate_label()}
								</label>
								<input bind:value={vehiclePlate} type="text" placeholder={m.onboarding_plate_placeholder()}
									class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none uppercase"
									style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
							</div>
						{/if}
					{/if}
				</div>

				<button onclick={finish} disabled={!isProfileValid}
					class="w-full py-4 mt-7 rounded-2xl font-display font-extrabold text-[15px] text-white disabled:opacity-40 transition-all"
					style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'};box-shadow:0 8px 24px {selectedRoleInfo?.color ?? '#2563EB'}30">
					{selectedRole === 'buyer' ? m.onboarding_submit_buyer() : selectedRole === 'seller' ? m.onboarding_submit_seller() : m.onboarding_submit_courier()} →
				</button>
			</div>

		<!-- ═══════════════════════════════════ DONE ══ -->
		{:else if step === 'done'}
			<div class="text-center">
				<!-- Check animation -->
				<div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
					style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'}20">
					<div class="w-16 h-16 rounded-full flex items-center justify-center"
						style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'}">
						<Icon name="check" size={32} color="#fff" strokeWidth={2.5}/>
					</div>
				</div>

				<h2 class="font-display text-[30px] font-black mb-2">
					{selectedRole === 'buyer' ? m.onboarding_done_title_buyer() :
					 selectedRole === 'seller' ? m.onboarding_done_title_seller() :
					 m.onboarding_done_title_courier()}
				</h2>
				<p class="text-[15px] mb-2" style="color:var(--c-text-secondary)">
					{m.onboarding_done_greeting()}{#if name}, <strong>{name.split(' ')[0]}</strong>{/if}.
				</p>
				<p class="text-[13px]" style="color:var(--c-text-muted)">
					{selectedRole === 'buyer' ? m.onboarding_done_subtitle_buyer() :
					 selectedRole === 'seller' ? m.onboarding_done_subtitle_seller() :
					 m.onboarding_done_subtitle_courier()}
				</p>

				<!-- Dots loader -->
				<div class="flex items-center justify-center gap-2 mt-8">
					{#each [0, 150, 300] as delay}
						<div class="w-2.5 h-2.5 rounded-full animate-pulse"
							style="background:{selectedRoleInfo?.color ?? 'var(--c-brand)'};animation-delay:{delay}ms"></div>
					{/each}
				</div>

				<button onclick={() => goto(destination)}
					class="mt-8 text-[13px] font-semibold underline underline-offset-2"
					style="color:var(--c-text-muted)">
					{m.onboarding_go_now()} →
				</button>
			</div>
		{/if}
	</div>
</div>
