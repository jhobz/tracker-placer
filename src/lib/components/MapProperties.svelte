<script lang="ts">
	import { appState } from '$lib/state.svelte.js';

	let map = $derived(appState.selectedMap);

	let fileInput: HTMLInputElement | undefined = $state();

	function handleImageChange(files: FileList | null) {
		if (!files || !files[0] || !map) return;
		const file = files[0];
		if (!file.type.startsWith('image/')) return;
		if (map.imageUrl) URL.revokeObjectURL(map.imageUrl);
		map.imageFile = file;
		map.imageUrl = URL.createObjectURL(file);
	}
</script>

{#if map}
	<div class="flex flex-col gap-4">
		<h2 class="text-base-content/70 text-xs font-semibold uppercase tracking-wider">
			Map Properties
		</h2>

		<!-- Map name -->
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Map Name</span>
			</div>
			<input
				type="text"
				class="input input-bordered input-sm w-full"
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
						class="border-base-300 max-h-32 w-full rounded-lg border object-contain"
					/>
					<button
						class="btn btn-xs btn-ghost absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
						onclick={() => fileInput?.click()}
					>
						Change
					</button>
				</div>
			{:else}
				<button
					class="btn btn-outline btn-sm w-full"
					onclick={() => fileInput?.click()}
				>
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
		<div class="text-base-content/50 text-xs">
			{map.locationBoxes.length} location {map.locationBoxes.length === 1 ? 'box' : 'boxes'} placed
		</div>
	</div>
{/if}
