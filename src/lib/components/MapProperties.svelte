<script lang="ts">
	import { appState } from '$lib/state.svelte'

	let map = $derived(appState.selectedMap)

	let fileInput: HTMLInputElement | undefined = $state()

	function handleImageChange(files: FileList | null) {
		if (!files || !files[0] || !map) {
			return
		}
		const file = files[0]
		if (!file.type.startsWith('image/')) {
			return
		}
		if (map.imageUrl) {
			URL.revokeObjectURL(map.imageUrl)
		}
		map.imageFile = file
		map.imageUrl = URL.createObjectURL(file)
	}
</script>

{#if map}
	<div class="flex flex-col gap-4">
		<h2 class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">
			Map Properties
		</h2>

		<!-- Map name -->
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Map Name</span>
			</div>
			<input
				type="text"
				class="input-bordered input input-sm w-full"
				bind:value={map.name}
				placeholder="e.g. Overworld"
			/>
		</label>

		<!-- Image -->
		<div class="form-control w-full">
			<div class="label">
				<span class="label-text">Map Image</span>
			</div>
			{#if map.imageUrl}
				<div class="group relative">
					<img
						src={map.imageUrl}
						alt={map.name}
						class="max-h-32 w-full rounded-lg border border-base-300 object-contain"
					/>
					<button
						class="btn absolute top-1 right-1 opacity-0 btn-ghost transition-opacity btn-xs group-hover:opacity-100"
						onclick={() => fileInput?.click()}
					>
						Change
					</button>
				</div>
			{:else}
				<button class="btn w-full btn-outline btn-sm" onclick={() => fileInput?.click()}>
					Choose Image
				</button>
			{/if}
			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="hidden"
				onchange={(e) => handleImageChange((e.target as HTMLInputElement).files)}
			/>
		</div>

		<!-- Location size -->
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Default Location Size</span>
				<span class="label-text-alt text-base-content/50">{map.locationSize}px</span>
			</div>
			<input
				type="range"
				min="4"
				max="64"
				step="1"
				class="range range-primary range-sm"
				bind:value={map.locationSize}
			/>
		</label>

		<!-- Border thickness -->
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Location Border Thickness</span>
				<span class="label-text-alt text-base-content/50">{map.locationBorderThickness}px</span>
			</div>
			<input
				type="range"
				min="0"
				max="8"
				step="1"
				class="range range-primary range-sm"
				bind:value={map.locationBorderThickness}
			/>
		</label>

		<!-- Box count -->
		<div class="text-xs text-base-content/50">
			{map.locationBoxes.length} location {map.locationBoxes.length === 1 ? 'box' : 'boxes'} placed
		</div>
	</div>
{/if}
