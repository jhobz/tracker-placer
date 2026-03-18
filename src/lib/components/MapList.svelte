<script lang="ts">
	import { appState } from '$lib/state.svelte.js';

	type Props = { onUploadNew: () => void };
	let { onUploadNew }: Props = $props();
</script>

<div class="flex h-full flex-col gap-2">
	<div class="flex items-center justify-between px-1">
		<h2 class="text-base-content/70 text-xs font-semibold uppercase tracking-wider">Maps</h2>
		<button class="btn btn-ghost btn-xs" onclick={onUploadNew} title="Add map">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	{#if appState.maps.length === 0}
		<p class="text-base-content/40 p-2 text-center text-xs">No maps yet</p>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each appState.maps as map (map.id)}
				<li>
					<div
						class="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors {appState.selectedMapId ===
						map.id
							? 'bg-primary text-primary-content'
							: 'hover:bg-base-300'}"
					>
						<button
							class="flex flex-1 items-center gap-2 text-left"
							onclick={() => appState.selectMap(map.id)}
						>
							{#if map.imageUrl}
								<img
									src={map.imageUrl}
									alt={map.name}
									class="h-8 w-8 rounded object-cover"
								/>
							{:else}
								<div class="bg-base-300 flex h-8 w-8 items-center justify-center rounded">
									<svg class="h-4 w-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
							{/if}
							<span class="flex-1 truncate font-medium">{map.name}</span>
						</button>
						<button
							class="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 {appState.selectedMapId === map.id ? 'text-primary-content/70 hover:text-primary-content' : ''}"
							onclick={() => appState.removeMap(map.id)}
							title="Remove map"
						>
							<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
