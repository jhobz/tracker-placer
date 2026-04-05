<script lang="ts">
	import { appState } from '$lib/state.svelte'

	let editingPackId = $state<string | null>(null)
	let editingName = $state('')

	function startEditing(packId: string, currentName: string) {
		editingPackId = packId
		editingName = currentName
	}

	function handleAddPack() {
		appState.addPack()
		const newPack = appState.selectedPack
		if (newPack) {
			startEditing(newPack.id, newPack.name)
		}
	}

	function handleInputMount(el: HTMLInputElement) {
		el.focus()
		el.select()
	}
</script>

<div class="flex h-full flex-col gap-2">
	<div class="flex items-center justify-between px-1">
		<h2 class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">Packs</h2>
		<button class="btn btn-ghost btn-xs" onclick={handleAddPack} title="Add pack">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	{#if appState.packs.length === 0}
		<p class="p-2 text-center text-xs text-base-content/40">No packs yet</p>
	{:else}
		<ul class="flex flex-col gap-1">
			{#each appState.packs as pack (pack.id)}
				<li>
					<div
						class="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors {appState.selectedPackId ===
						pack.id
							? 'bg-primary text-primary-content'
							: 'hover:bg-base-300'}"
					>
						{#if editingPackId === pack.id}
							<input
								type="text"
								class="input input-xs w-full bg-transparent font-medium"
								value={editingName}
								use:handleInputMount
								onblur={(e) => {
									const val = (e.target as HTMLInputElement).value.trim()
									if (val) {
										pack.name = val
									}
									editingPackId = null
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault()
										const val = (e.target as HTMLInputElement).value.trim()
										if (val) {
											pack.name = val
										}
										editingPackId = null
									}
									if (e.key === 'Escape') {
										editingPackId = null
									}
								}}
							/>
						{:else}
							<button
								class="flex flex-1 items-center gap-2 text-left"
								onclick={() => appState.selectPack(pack.id)}
								ondblclick={() => startEditing(pack.id, pack.name)}
							>
								<span class="flex-1 truncate font-medium">{pack.name}</span>
							</button>
						{/if}
						<button
							class="btn opacity-0 btn-ghost btn-xs group-hover:opacity-100 {appState.selectedPackId ===
							pack.id
								? 'text-primary-content/70 hover:text-primary-content'
								: ''}"
							onclick={() => appState.removePack(pack.id)}
							title="Remove pack"
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
