<script lang="ts">
	import logoMark from '$lib/assets/plazacomer-logo-mark.svg';
	import logoFull from '$lib/assets/plazacomer-logo-full.svg';

	type Props = {
		size?: number;
		full?: boolean;
		spin?: boolean;
		class?: string;
	};
	let { size = 48, full = false, spin = false, class: cls = '' }: Props = $props();
</script>

<img
	src={full ? logoFull : logoMark}
	alt="PlazaComer"
	width={size}
	height={size}
	draggable={false}
	class={cls}
	style:animation={spin ? 'spin 20s linear infinite' : undefined}
	style="display:block;object-fit:contain"
/>
