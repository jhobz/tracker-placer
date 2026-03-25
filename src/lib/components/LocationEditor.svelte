<script lang="ts">
	import type { PoptrackerLocation } from '$lib/types.js'
	import { createLocation } from '$lib/state.svelte.js'
	import SectionEditor from './SectionEditor.svelte'

	type Props = {
		locations: PoptrackerLocation[]
	}
	let { locations }: Props = $props()

	let expandedId = $state<string | null>(null)

	$effect(() => {
		if (!expandedId && locations.length > 0) {
			expandedId = locations[0].id
		}
	})

	function addLocation() {
		const loc = createLocation()
		locations.push(loc)
		expandedId = loc.id
	}

	function removeLocation(idx: number) {
		const removed = locations[idx]
		locations.splice(idx, 1)
		if (expandedId === removed.id) {
			expandedId = locations[0]?.id ?? null
		}
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium">Locations</span>
		<button class="btn btn-ghost btn-xs" onclick={addLocation}>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add
		</button>
	</div>

	{#each locations as location, idx (location.id)}
		<div class="overflow-hidden rounded-lg border border-base-300">
			<!-- Header -->
			<div
				class="flex w-full items-center justify-between px-3 py-2 transition-colors {expandedId ===
				location.id
					? 'bg-secondary/20'
					: 'hover:bg-base-200'}"
			>
				<button
					class="flex-1 text-left"
					onclick={() => (expandedId = expandedId === location.id ? null : location.id)}
				>
					<span class="truncate text-sm font-medium">{location.name || 'Unnamed'}</span>
				</button>
				<div class="flex items-center gap-1">
					<button
						class="btn text-error btn-ghost btn-xs"
						onclick={() => removeLocation(idx)}
						title="Remove location"
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
					<button
						class="btn btn-ghost btn-xs"
						title="Toggle expand"
						onclick={() => (expandedId = expandedId === location.id ? null : location.id)}
					>
						<svg
							class="h-4 w-4 transition-transform {expandedId === location.id ? 'rotate-180' : ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Content -->
			{#if expandedId === location.id}
				<div class="flex flex-col gap-3 p-3">
					<!-- Name -->
					<label class="form-control w-full">
						<div class="label py-0">
							<span class="label-text text-xs">Location Name</span>
						</div>
						<input
							type="text"
							class="input-bordered input input-sm w-full"
							bind:value={location.name}
							placeholder="e.g. Eastern Palace"
						/>
					</label>

					<!-- Icon fields -->
					<div class="flex gap-2">
						<label class="form-control flex-1">
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
						<label class="form-control flex-1">
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
					<label class="form-control w-full">
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
					<label class="form-control w-full">
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
					<label class="form-control w-full">
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
					<div class="divider my-0 text-xs opacity-50">Sections</div>
					<SectionEditor sections={location.sections} />
				</div>
			{/if}
		</div>
	{/each}

	{#if locations.length === 0}
		<p class="text-center text-xs text-base-content/40">No locations. Add one above.</p>
	{/if}
</div>
