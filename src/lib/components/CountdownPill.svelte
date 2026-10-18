<script lang="ts">
	type Props = { finishAt: number };
	let { finishAt }: Props = $props();

	function fmt(ms: number) {
		if (ms <= 0) return 'Terminó';
		const h = Math.floor(ms / 3600000);
		const m = Math.floor((ms % 3600000) / 60000);
		const s = Math.floor((ms % 60000) / 1000);
		if (h > 0) return `${h}h ${m}m`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	let remaining = $state(finishAt - Date.now());
	$effect(() => {
		const end = finishAt;
		const id = setInterval(() => {
			remaining = end - Date.now();
		}, 1000);
		return () => clearInterval(id);
	});
</script>

<span
	style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:700;background:rgba(220,38,38,.12);color:var(--c-error)"
>
	⏱ {fmt(remaining)}
</span>
