<script lang="ts">
	import { createSection } from '$lib/state.svelte'
	import type { PoptrackerSection } from '$lib/types'
	import MaterialSymbol from './MaterialSymbol.svelte'

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

	function convertRulesToString(
		rules: PoptrackerSection['access_rules'] | PoptrackerSection['visibility_rules']
	): string {
		if (!rules) {
			return ''
		}
		if (typeof rules === 'string') {
			return rules
		}
		if (Array.isArray(rules) && rules.every((r) => typeof r === 'string')) {
			return rules.join('\n')
		}
		return rules.flatMap((r) => (typeof r === 'string' ? [r] : r)).join('\n')
	}
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium">Sections</span>
		<button class="btn btn-ghost btn-xs" onclick={addSection}>
			<MaterialSymbol size="sm">add</MaterialSymbol>
			Add
		</button>
	</div>

	{#each sections as section, idx (section.id)}
		<details
			class="collapse-arrow collapse border border-base-100 bg-base-300 open:*:[summary]:bg-accent/20"
			name="sections-accordion"
		>
			<summary class="collapse-title flex items-center justify-between px-3 py-2 transition-colors">
				<span class="text-xs font-semibold">{section.name ?? `Section ${idx + 1}`}</span>
				<button
					class="btn mr-8 btn-square btn-ghost btn-xs btn-error"
					onclick={() => removeSection(idx)}
					title="Remove section"
				>
					<MaterialSymbol size="sm" deemphasis>delete</MaterialSymbol>
				</button>
			</summary>

			<div class="collapse-content flex flex-col gap-1">
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
						value={convertRulesToString(section.access_rules)}
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
						value={convertRulesToString(section.visibility_rules)}
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
		</details>
	{/each}

	{#if sections.length === 0}
		<p class="text-center text-xs text-base-content/40">No sections. Add one above.</p>
	{/if}
</div>
