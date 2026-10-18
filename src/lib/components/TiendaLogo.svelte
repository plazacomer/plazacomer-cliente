<script lang="ts">
	import type { Store } from '$lib/data/mock';

	type Props = { tienda: Store; size?: number };
	let { tienda, size = 40 }: Props = $props();
</script>

<div
	style="width:{size}px;height:{size}px;border-radius:50%;background:{tienda.logoColor};color:#fff;display:flex;align-items:center;justify-content:center;font-size:{size *
		0.5}px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.12)"
>
	{tienda.emoji}
</div>
