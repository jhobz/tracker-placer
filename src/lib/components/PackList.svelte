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

{#if appState.packs.length === 0}
	<p class="p-2 text-center text-xs text-base-content/40">No packs yet</p>
{:else}
	<ul class="menu">
		<li class="flex-row items-center justify-between menu-title text-xs tracking-wider uppercase">
			<h2>Packs</h2>
			<button class="btn btn-square btn-ghost btn-xs" onclick={handleAddPack} title="Add pack">
				<svg class="w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</button>
		</li>
		{#each appState.packs as pack (pack.id)}
			<li>
				<a
					class={{
						'group justify-between font-medium': true,
						'menu-active': appState.selectedPackId === pack.id
					}}
					onclick={() => appState.selectPack(pack.id)}
					ondblclick={() => startEditing(pack.id, pack.name)}
					role="button"
					href={undefined}
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
						<span class="truncate">{pack.name}</span>
					{/if}
					<button
						class={{
							'btn btn-square opacity-0 btn-ghost btn-xs group-hover:opacity-100': true,
							'opacity-100': appState.selectedPackId === pack.id
						}}
						onclick={() => appState.removePack(pack.id)}
						title="Remove pack"
					>
						<svg class="w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</a>
			</li>
		{/each}
	</ul>
{/if}
