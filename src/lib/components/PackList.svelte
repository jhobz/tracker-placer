<script lang="ts">
	import { appState } from '$lib/state.svelte'
	import MaterialSymbol from './MaterialSymbol.svelte'

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

	function handleMenuKeyboardNavigation(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
			return
		}

		const currentIndex = appState.packs.findIndex((p) => p.id === appState.selectedPackId)

		if (e.key === 'ArrowDown') {
			let nextIndex = currentIndex + 1
			if (nextIndex >= appState.packs.length) {
				nextIndex = 0
			}

			appState.selectPack(appState.packs[nextIndex].id)
			return
		}

		// Yes, we could just use .at(), but TypeScript makes it slightly more annoying
		let prevIndex = currentIndex - 1
		if (prevIndex < 0) {
			prevIndex = appState.packs.length - 1
		}
		appState.selectPack(appState.packs[prevIndex].id)
	}
</script>

{#if appState.packs.length === 0}
	<p class="p-2 text-center text-xs text-base-content/40">No packs yet</p>
{:else}
	<ul class="menu w-full" role="listbox" tabindex="0" onkeyup={handleMenuKeyboardNavigation}>
		<li class="flex-row items-center justify-between menu-title text-xs tracking-wider uppercase">
			<h2>Packs</h2>
			<button class="btn btn-square btn-ghost btn-xs" onclick={handleAddPack} title="Add pack">
				<MaterialSymbol>add</MaterialSymbol>
			</button>
		</li>
		{#each appState.packs as pack (pack.id)}
			<li role="option" aria-selected={appState.selectedPackId === pack.id}>
				<a
					class={{
						'group justify-between font-medium': true,
						'menu-active': appState.selectedPackId === pack.id
					}}
					onclick={() => appState.selectPack(pack.id)}
					ondblclick={() => startEditing(pack.id, pack.name)}
					href={undefined}
				>
					{#if editingPackId === pack.id}
						<input
							type="text"
							class="input input-xs bg-transparent"
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
						<span class="truncate" title={pack.name}>{pack.name}</span>
					{/if}
					<button
						class={{
							'btn btn-square opacity-0 btn-ghost btn-xs group-focus-within:opacity-100 group-hover:opacity-100': true,
							'opacity-100': appState.selectedPackId === pack.id
						}}
						onclick={() => appState.removePack(pack.id)}
						title="Remove pack"
					>
						<MaterialSymbol size="sm">close</MaterialSymbol>
					</button>
				</a>
			</li>
		{/each}
	</ul>
{/if}
