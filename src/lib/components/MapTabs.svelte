<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import type { WheelEventHandler } from 'svelte/elements'
	import MaterialSymbol from './MaterialSymbol.svelte'

	type Props = { onUploadNew: () => void }
	let { onUploadNew }: Props = $props()

	// Source - https://stackoverflow.com/a/59680347
	// Posted by Guido Bouman, modified by community. See post 'Timeline' for change history
	// Retrieved 2026-04-24, License - CC BY-SA 4.0
	const transformScroll: WheelEventHandler<HTMLDivElement> = (e) => {
		if (!e.deltaY) {
			return
		}

		e.preventDefault()
		e.currentTarget.scrollLeft += e.deltaY + e.deltaX
	}
</script>

<div
	role="tablist"
	class="tabs-border tabs flex-nowrap overflow-x-auto border-b border-base-300 tabs-sm [scrollbar-width:thin]"
	onwheel={transformScroll}
>
	{#if appState.maps.length === 0}
		<p class="px-3 py-2 text-xs text-base-content/40">No maps yet</p>
	{:else}
		{#each appState.maps as map, i (map.id)}
			<a
				role="tab"
				tabindex="0"
				class={{
					'group tab flex min-w-max cursor-pointer items-center gap-1 pr-1 pl-4 hover:bg-base-200': true,
					'tab-active bg-base-200 [&::before]:left-0 [&::before]:w-full':
						appState.selectedMapId === map.id
				}}
				href={undefined}
				onfocus={() => appState.selectMap(map.id)}
			>
				<span>{map.name}</span>
				<button
					class={{
						'btn btn-square opacity-0 btn-ghost btn-xs group-hover:opacity-100': true,
						'opacity-100': appState.selectedMapId === map.id
					}}
					onclick={() => appState.removeMap(map.id)}
					title="Remove map"
					aria-label="Remove map"
				>
					<MaterialSymbol size="sm" deemphasis>close</MaterialSymbol>
				</button>
			</a>
		{/each}
	{/if}
	<div class="tab p-1">
		<button
			class="btn btn-square btn-ghost btn-xs"
			onclick={onUploadNew}
			title="Add map"
			aria-label="Add map"
		>
			<MaterialSymbol deemphasis>add</MaterialSymbol>
		</button>
	</div>
</div>
