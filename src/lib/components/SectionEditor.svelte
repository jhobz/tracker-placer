<script lang="ts">
	import type { PoptrackerSection } from '$lib/types'
	import { createSection } from '$lib/state.svelte'

	type Props = {
		sections: PoptrackerSection[]
	}
	let { sections }: Props = $props()

	function addSection() {
		sections.push(createSection())
	}

	function removeSection(idx: number) {
		sections.splice(idx, 1)
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium">Sections</span>
		<button class="btn btn-ghost btn-xs" onclick={addSection}>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add
		</button>
	</div>

	{#each sections as section, idx (section.id)}
		<div class="rounded-lg bg-base-200 p-3">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-xs font-semibold opacity-60">Section {idx + 1}</span>
				<button
					class="btn text-error btn-ghost btn-xs"
					onclick={() => removeSection(idx)}
					title="Remove section"
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

			<div class="flex flex-col gap-2">
				<label class="form-control w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Name</span>
					</div>
					<input
						type="text"
						class="input-bordered input input-xs w-full"
						bind:value={section.name}
						placeholder="Section name"
					/>
				</label>

				<div class="flex gap-2">
					<label class="form-control flex-1">
						<div class="label py-0">
							<span class="label-text text-xs">Item Count</span>
						</div>
						<input
							type="number"
							class="input-bordered input input-xs w-full"
							bind:value={section.item_count}
							min="1"
						/>
					</label>
					<label class="form-control flex-1">
						<div class="label py-0">
							<span class="label-text text-xs">Hosted Item</span>
						</div>
						<input
							type="text"
							class="input-bordered input input-xs w-full"
							bind:value={section.hosted_item}
							placeholder="item_name"
						/>
					</label>
				</div>

				<label class="form-control w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Access Rules</span>
						<span class="label-text-alt text-xs opacity-50">one per line</span>
					</div>
					<textarea
						class="textarea-bordered textarea w-full font-mono textarea-xs"
						rows="2"
						placeholder="{'{item1}'} and {'{item2}'}"
						value={section.access_rules.join('\n')}
						onchange={(e) => {
							section.access_rules = (e.target as HTMLTextAreaElement).value
								.split('\n')
								.map((r) => r.trim())
								.filter((r) => r.length > 0)
						}}
					></textarea>
				</label>

				<label class="form-control w-full">
					<div class="label py-0">
						<span class="label-text text-xs">Visibility Rules</span>
						<span class="label-text-alt text-xs opacity-50">one per line</span>
					</div>
					<textarea
						class="textarea-bordered textarea w-full font-mono textarea-xs"
						rows="2"
						placeholder={'{setting}'}
						value={section.visibility_rules.join('\n')}
						onchange={(e) => {
							section.visibility_rules = (e.target as HTMLTextAreaElement).value
								.split('\n')
								.map((r) => r.trim())
								.filter((r) => r.length > 0)
						}}
					></textarea>
				</label>

				<div class="flex gap-2">
					<label class="form-control flex-1">
						<div class="label py-0">
							<span class="label-text text-xs">Chest Unopened Img</span>
						</div>
						<input
							type="text"
							class="input-bordered input input-xs w-full font-mono"
							bind:value={section.chest_unopened_img}
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
							bind:value={section.chest_opened_img}
							placeholder="images/items/chest_open.png"
						/>
					</label>
				</div>
			</div>
		</div>
	{/each}

	{#if sections.length === 0}
		<p class="text-center text-xs text-base-content/40">No sections. Add one above.</p>
	{/if}
</div>
