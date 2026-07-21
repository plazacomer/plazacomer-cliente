<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	type Paso = 'bienvenida' | 'rol' | 'perfil' | 'listo';
	type Rol = 'comprador' | 'vendedor' | 'repartidor';

	let paso = $state<Paso>('bienvenida');
	let rolElegido = $state<Rol | null>(null);

	// Campos perfil
	let nombre = $state('');
	let email  = $state('');
	// Comprador
	let direccion = $state('');
	// Vendedor
	let tiendaNombre = $state('');
	let tiendaEmoji  = $state('🍽️');
	let tiendaCat    = $state('');
	// Repartidor
	let vehiculo  = $state('');
	let vehiculoPlaca = $state('');

	const ROLES = [
		{
			id: 'comprador' as Rol,
			emoji: '🛍️',
			titulo: 'Comprador',
			desc: 'Explora tiendas, pide a domicilio y agenda servicios.',
			color: '#2563EB',
			bg: 'rgba(37,99,235,.06)',
		},
		{
			id: 'vendedor' as Rol,
			emoji: '🏪',
			titulo: 'Vendedor',
			desc: 'Publica tu tienda, gestiona pedidos y crea ofertas.',
			color: '#7C3AED',
			bg: 'rgba(124,58,237,.06)',
		},
		{
			id: 'repartidor' as Rol,
			emoji: '🛵',
			titulo: 'Repartidor',
			desc: 'Toma entregas, gana por cada pedido completado.',
			color: '#16A34A',
			bg: 'rgba(22,163,74,.06)',
		},
	];

	const VEHICULOS = ['🛵 Moto', '🚲 Bicicleta', '🛺 Mototaxi', '🚗 Carro'];
	const CATEGORIAS = [
		{ key: 'food',    emoji: '🍽️', label: 'Comida' },
		{ key: 'market',  emoji: '🛒', label: 'Mercado' },
		{ key: 'fashion', emoji: '👗', label: 'Moda' },
		{ key: 'tech',    emoji: '💻', label: 'Tecnología' },
		{ key: 'beauty',  emoji: '💄', label: 'Belleza' },
		{ key: 'services',emoji: '🔧', label: 'Servicios' },
	];

	const EMOJIS_TIENDA = ['🍽️','🍕','🥑','🛒','👗','💄','💻','🔧','🎒','☕','🍺','🧃','🎂','🌿','🎨','📚'];

	const rolInfo = $derived(ROLES.find(r => r.id === rolElegido));

	const destino = $derived(
		rolElegido === 'vendedor'   ? '/seller' :
		rolElegido === 'repartidor' ? '/app/courier' :
		'/app/home'
	);

	const perfilValido = $derived.by(() => {
		if (!nombre.trim()) return false;
		if (rolElegido === 'vendedor' && !tiendaNombre.trim()) return false;
		if (rolElegido === 'repartidor' && !vehiculo) return false;
		return true;
	});

	function elegirRol(r: Rol) {
		rolElegido = r;
		paso = 'perfil';
	}

	function finalizar() {
		paso = 'listo';
		// Redirige tras 2.5 s
		setTimeout(() => goto(destino), 2500);
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center px-5 py-10">

	<!-- Indicador de progreso (steps 2-4) -->
	{#if paso !== 'bienvenida'}
		<div class="fixed top-0 left-0 right-0 z-10 h-1" style="background:var(--c-bg-secondary)">
			<div class="h-full transition-all duration-500 rounded-r-full"
				style="background:var(--c-brand);width:{paso === 'rol' ? '33' : paso === 'perfil' ? '66' : '100'}%"></div>
		</div>
	{/if}

	<div class="w-full max-w-sm">

		<!-- ═══════════════════════════════════ BIENVENIDA ══ -->
		{#if paso === 'bienvenida'}
			<div class="text-center">
				<div class="flex justify-center mb-6">
					<div class="w-20 h-20 rounded-[22px] flex items-center justify-center shadow-lg"
						style="background:var(--c-brand)">
						<Logo size={44} color="#fff"/>
					</div>
				</div>

				<div class="font-mono text-[11px] font-bold uppercase tracking-[2px] mb-2"
					style="color:var(--c-brand)">
					Bienvenido a
				</div>
				<h1 class="font-display text-[36px] font-black tracking-tight mb-1">PLAZACOMER</h1>
				<p class="text-[15px] leading-relaxed mb-8" style="color:var(--c-text-secondary)">
					Tu plaza de mercado digital.<br/>Tiendas, servicios y repartidores<br/>en un solo lugar.
				</p>

				<!-- Highlights -->
				<div class="flex flex-col gap-3 mb-10 text-left">
					{#each [
						{ icon: 'store',    text: 'Más de 50 tiendas locales' },
						{ icon: 'calendar', text: 'Agenda citas con servicios' },
						{ icon: 'truck',    text: 'Domicilios en minutos' },
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

				<button onclick={() => paso = 'rol'}
					class="w-full py-4 rounded-2xl font-display font-extrabold text-[16px] text-white tracking-wide"
					style="background:var(--c-brand);box-shadow:0 8px 24px rgba(37,99,235,.3)">
					Empezar →
				</button>
				<p class="text-[12px] mt-4" style="color:var(--c-text-muted)">Gratuito · Sin tarjeta de crédito</p>
			</div>

		<!-- ═══════════════════════════════════ ROL ══ -->
		{:else if paso === 'rol'}
			<div>
				<button onclick={() => paso = 'bienvenida'}
					class="flex items-center gap-1.5 text-[13px] font-semibold mb-6"
					style="color:var(--c-text-muted)">
					<Icon name="arrowLeft" size={15}/>
					Volver
				</button>

				<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">
					Paso 1 de 2
				</div>
				<h2 class="font-display text-[26px] font-extrabold mb-1.5">¿Cómo quieres usar PlazaComer?</h2>
				<p class="text-sm mb-7" style="color:var(--c-text-secondary)">
					Puedes cambiar de rol en cualquier momento desde tu perfil.
				</p>

				<div class="flex flex-col gap-3">
					{#each ROLES as rol}
						<button
							onclick={() => elegirRol(rol.id)}
							class="flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5"
							style="background:{rol.bg};border-color:{rol.color}20;box-shadow:0 2px 12px {rol.color}10">
							<div class="w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] shrink-0"
								style="background:white;box-shadow:0 2px 8px rgba(0,0,0,.08)">
								{rol.emoji}
							</div>
							<div class="flex-1 min-w-0">
								<div class="font-display text-[16px] font-extrabold mb-0.5">{rol.titulo}</div>
								<div class="text-[12.5px] leading-snug" style="color:var(--c-text-secondary)">{rol.desc}</div>
							</div>
							<Icon name="arrowRight" size={18} color="var(--c-text-muted)"/>
						</button>
					{/each}
				</div>
			</div>

		<!-- ═══════════════════════════════════ PERFIL ══ -->
		{:else if paso === 'perfil'}
			<div>
				<button onclick={() => paso = 'rol'}
					class="flex items-center gap-1.5 text-[13px] font-semibold mb-6"
					style="color:var(--c-text-muted)">
					<Icon name="arrowLeft" size={15}/>
					Cambiar rol
				</button>

				<!-- Chip del rol elegido -->
				{#if rolInfo}
					<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[12px] font-bold"
						style="background:{rolInfo.bg};color:{rolInfo.color}">
						{rolInfo.emoji} {rolInfo.titulo}
					</div>
				{/if}

				<div class="font-mono text-[11px] font-bold uppercase tracking-[1.5px] mb-1" style="color:var(--c-brand)">
					Paso 2 de 2
				</div>
				<h2 class="font-display text-[24px] font-extrabold mb-5">Cuéntanos sobre ti</h2>

				<div class="flex flex-col gap-4">
					<!-- Nombre (todos) -->
					<div>
						<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
							Tu nombre *
						</label>
						<input bind:value={nombre} type="text" placeholder="Ej: María Camila Torres"
							class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
					</div>

					<!-- Email (todos) -->
					<div>
						<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
							Correo electrónico
						</label>
						<input bind:value={email} type="email" placeholder="tu@correo.co"
							class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
							style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
					</div>

					<!-- ── COMPRADOR ── -->
					{#if rolElegido === 'comprador'}
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								Dirección principal
							</label>
							<input bind:value={direccion} type="text" placeholder="Ej: Cra 10 #45-23, El Poblado"
								class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
						</div>

					<!-- ── VENDEDOR ── -->
					{:else if rolElegido === 'vendedor'}
						<!-- Emoji tienda -->
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								Emoji de tu tienda
							</label>
							<div class="flex flex-wrap gap-2">
								{#each EMOJIS_TIENDA as em}
									<button onclick={() => tiendaEmoji = em}
										class="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 transition-all"
										style="border-color:{tiendaEmoji === em ? 'var(--c-brand)' : 'transparent'};background:var(--c-bg-card)">
										{em}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								Nombre de tu tienda *
							</label>
							<input bind:value={tiendaNombre} type="text" placeholder="Ej: El Sabor de Abuela"
								class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none"
								style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
						</div>

						<!-- Categoría -->
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								Categoría
							</label>
							<div class="grid grid-cols-3 gap-2">
								{#each CATEGORIAS as cat}
									<button onclick={() => tiendaCat = cat.key}
										class="py-2.5 px-2 rounded-xl text-[12px] font-bold border-2 flex flex-col items-center gap-1 transition-all"
										style="border-color:{tiendaCat === cat.key ? 'var(--c-brand)' : 'var(--c-border)'};background:{tiendaCat === cat.key ? 'rgba(37,99,235,.06)' : 'var(--c-bg-card)'};color:{tiendaCat === cat.key ? 'var(--c-brand)' : 'var(--c-text-primary)'}">
										<span class="text-lg">{cat.emoji}</span>
										{cat.label}
									</button>
								{/each}
							</div>
						</div>

					<!-- ── REPARTIDOR ── -->
					{:else if rolElegido === 'repartidor'}
						<div>
							<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
								Tipo de vehículo *
							</label>
							<div class="grid grid-cols-2 gap-2">
								{#each VEHICULOS as v}
									<button onclick={() => vehiculo = v}
										class="py-3 rounded-xl text-[13px] font-bold border-2 transition-all"
										style="border-color:{vehiculo === v ? 'var(--c-success)' : 'var(--c-border)'};background:{vehiculo === v ? 'rgba(22,163,74,.06)' : 'var(--c-bg-card)'};color:{vehiculo === v ? '#16A34A' : 'var(--c-text-primary)'}">
										{v}
									</button>
								{/each}
							</div>
						</div>

						{#if vehiculo}
							<div>
								<label class="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style="color:var(--c-text-muted)">
									Placa
								</label>
								<input bind:value={vehiculoPlaca} type="text" placeholder="Ej: ABC-123"
									class="w-full h-12 px-4 rounded-xl border text-[14px] outline-none uppercase"
									style="background:var(--c-bg-card);border-color:var(--c-border);color:var(--c-text-primary)"/>
							</div>
						{/if}
					{/if}
				</div>

				<button onclick={finalizar} disabled={!perfilValido}
					class="w-full py-4 mt-7 rounded-2xl font-display font-extrabold text-[15px] text-white disabled:opacity-40 transition-all"
					style="background:{rolInfo?.color ?? 'var(--c-brand)'};box-shadow:0 8px 24px {rolInfo?.color ?? '#2563EB'}30">
					{rolElegido === 'comprador' ? 'Ir a explorar' : rolElegido === 'vendedor' ? 'Abrir mi tienda' : 'Empezar a repartir'} →
				</button>
			</div>

		<!-- ═══════════════════════════════════ LISTO ══ -->
		{:else if paso === 'listo'}
			<div class="text-center">
				<!-- Animación check -->
				<div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"
					style="background:{rolInfo?.color ?? 'var(--c-brand)'}20">
					<div class="w-16 h-16 rounded-full flex items-center justify-center"
						style="background:{rolInfo?.color ?? 'var(--c-brand)'}">
						<Icon name="check" size={32} color="#fff" strokeWidth={2.5}/>
					</div>
				</div>

				<h2 class="font-display text-[30px] font-black mb-2">
					{rolElegido === 'comprador' ? '¡Todo listo!' :
					 rolElegido === 'vendedor'  ? '¡Tu tienda te espera!' :
					 '¡A repartir!'}
				</h2>
				<p class="text-[15px] mb-2" style="color:var(--c-text-secondary)">
					Bienvenido{#if nombre}, <strong>{nombre.split(' ')[0]}</strong>{/if}.
				</p>
				<p class="text-[13px]" style="color:var(--c-text-muted)">
					{rolElegido === 'comprador' ? 'Explorando tiendas en un momento…' :
					 rolElegido === 'vendedor'  ? 'Abriendo tu panel de vendedor…' :
					 'Conectando al panel de repartidor…'}
				</p>

				<!-- Dots loader -->
				<div class="flex items-center justify-center gap-2 mt-8">
					{#each [0, 150, 300] as delay}
						<div class="w-2.5 h-2.5 rounded-full animate-pulse"
							style="background:{rolInfo?.color ?? 'var(--c-brand)'};animation-delay:{delay}ms"></div>
					{/each}
				</div>

				<button onclick={() => goto(destino)}
					class="mt-8 text-[13px] font-semibold underline underline-offset-2"
					style="color:var(--c-text-muted)">
					Ir ahora →
				</button>
			</div>
		{/if}
	</div>
</div>
