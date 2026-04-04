<script lang="ts">
	import { appState } from '$lib/state.svelte'

	type Props = { onUploadNew: () => void }
	let { onUploadNew }: Props = $props()
</script>

<div role="tablist" class="tabs-bordered tabs flex items-end gap-0">
	{#if appState.maps.length === 0}
		<p class="px-3 py-2 text-xs text-base-content/40">No maps yet</p>
	{:else}
		{#each appState.maps as map (map.id)}
			<div class="group relative flex items-center">
				<button
					role="tab"
					class="tab {appState.selectedMapId === map.id ? 'tab-active' : ''}"
					onclick={() => appState.selectMap(map.id)}
				>
					{map.name}
				</button>
				<button
					class="btn absolute -top-1 right-0 btn-circle h-4 min-h-0 w-4 opacity-0 btn-ghost btn-xs group-hover:opacity-100"
					onclick={() => appState.removeMap(map.id)}
					title="Remove map"
				>
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
	<button class="btn ml-1 btn-ghost btn-xs" onclick={onUploadNew} title="Add map">
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	</button>
</div>
