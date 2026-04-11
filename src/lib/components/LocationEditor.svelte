<script lang="ts">
	import { createLocation } from '$lib/state.svelte'
	import type { PoptrackerLocation } from '$lib/types'
	import MaterialSymbol from './MaterialSymbol.svelte'
	import SectionEditor from './SectionEditor.svelte'

	type Props = {
		locations: PoptrackerLocation[]
	}
	let { locations }: Props = $props()

	function addLocation() {
		const loc = createLocation()
		locations.push(loc)
	}

	function removeLocation(idx: number) {
		locations.splice(idx, 1)
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between text-sm">
		<span class="font-medium">Locations</span>
		<button class="btn btn-ghost btn-xs" onclick={addLocation}>
			<MaterialSymbol size="sm">add</MaterialSymbol>
			Add
		</button>
	</div>

	{#each locations as location, i (location.id)}
		<details
			class="collapse-arrow collapse border border-base-300 bg-base-200 open:*:[summary]:bg-secondary/20"
			name="locations-accordion"
			id="location-{i}"
		>
			<!-- Header -->
			<summary class="collapse-title flex items-center justify-between px-3 py-2 transition-colors">
				<span class="truncate text-sm font-medium">{location.name || 'Unnamed'}</span>
				<button
					class="btn mr-8 btn-square btn-ghost btn-xs btn-error"
					onclick={() => removeLocation(i)}
					title="Remove location"
				>
					<MaterialSymbol size="sm" deemphasis>delete</MaterialSymbol>
				</button>
			</summary>

			<!-- Content -->
			<div class="collapse-content flex flex-col gap-2">
				<!-- Name -->
				<label>
					<div class="label py-0">
						<span class="label-text text-xs">Location Name</span>
					</div>
					<input
						type="text"
						name="location-name-{i}"
						class="input-bordered input input-sm w-full"
						bind:value={location.name}
						placeholder="e.g. Eastern Palace"
					/>
				</label>

				<!-- Icon fields -->
				<div class="flex gap-2">
					<label class="x-1">
						<div class="label py-0">
							<span class="label-text text-xs">Chest Unopened Img</span>
						</div>
						<input
							type="text"
							class="input-bordered input input-xs w-full font-mono"
							bind:value={location.chest_unopened_img}
							placeholder="images/items/chest.png"
						/>
					</label>
					<label class="x-1">
						<div class="label py-0">
							<span class="label-text text-xs">Chest Opened Img</span>
						</div>
						<input
							type="text"
							class="input-bordered input input-xs w-full font-mono"
							bind:value={location.chest_opened_img}
							placeholder="images/items/chest_open.png"
						/>
					</label>
				</div>

				<!-- Inherit icon from -->
				<label class="w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Inherit Icon From</span>
					</div>
					<input
						type="text"
						class="input-bordered input input-xs w-full font-mono"
						bind:value={location.inherit_icon_from}
						placeholder="parent_location_name"
					/>
				</label>

				<!-- Access rules -->
				<label class="w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Access Rules</span>
						<span class="label-text-alt text-xs opacity-50">one per line</span>
					</div>
					<textarea
						class="textarea-bordered textarea w-full font-mono textarea-xs"
						rows="2"
						placeholder="{'{item1}'} and {'{item2}'}"
						value={location.access_rules.join('\n')}
						onchange={(e) => {
							location.access_rules = (e.target as HTMLTextAreaElement).value
								.split('\n')
								.map((r) => r.trim())
								.filter((r) => r.length > 0)
						}}
					></textarea>
				</label>

				<!-- Visibility rules -->
				<label class="w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Visibility Rules</span>
						<span class="label-text-alt text-xs opacity-50">one per line</span>
					</div>
					<textarea
						class="textarea-bordered textarea w-full font-mono textarea-xs"
						rows="2"
						placeholder={'{setting}'}
						value={location.visibility_rules.join('\n')}
						onchange={(e) => {
							location.visibility_rules = (e.target as HTMLTextAreaElement).value
								.split('\n')
								.map((r) => r.trim())
								.filter((r) => r.length > 0)
						}}
					></textarea>
				</label>

				<!-- Sections -->
				<div class="divider my-0 text-xs opacity-50"></div>
				<SectionEditor sections={location.sections} />
			</div>
		</details>
	{/each}

	{#if locations.length === 0}
		<p class="text-center text-xs text-base-content/40">No locations. Add one above.</p>
	{/if}
</div>
