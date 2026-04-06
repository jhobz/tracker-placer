<script lang="ts">
	import { appState } from '$lib/state.svelte'

	type Props = { onUploadNew: () => void }
	let { onUploadNew }: Props = $props()
</script>

<div role="tablist" class="tabs-border tabs border-b border-base-300 tabs-sm">
	{#if appState.maps.length === 0}
		<p class="px-3 py-2 text-xs text-base-content/40">No maps yet</p>
	{:else}
		{#each appState.maps as map (map.id)}
			<div
				role="tab"
				class={{
					'group tab flex min-w-max items-center gap-1 pr-0 pl-4 hover:bg-base-200': true,
					'tab-active bg-base-200 [&::before]:left-0 [&::before]:w-full':
						appState.selectedMapId === map.id
				}}
			>
				<button class="cursor-pointer" onclick={() => appState.selectMap(map.id)}>
					{map.name}
				</button>
				<button
					class="btn btn-square opacity-0 btn-ghost btn-xs group-hover:opacity-100"
					onclick={() => appState.removeMap(map.id)}
					title="Remove map"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/each}
	{/if}
	<div class="tab p-1">
		<button class="btn btn-square btn-ghost btn-xs" onclick={onUploadNew} title="Add map">
			<svg class="aspect-square w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>
</div>
