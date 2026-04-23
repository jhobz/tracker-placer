import { appState, createLocation } from '$lib/state.svelte'
import type { Location } from '$lib/types'
import { findLocation } from '$lib/utils/locations'
import { createContext } from 'svelte'

export class LocationsTabContext {
	#currentLocation: Location | null = $state(null)
	#currentChildren: Location[] = $derived(
		this.#currentLocation === null
			? (appState.selectedPack?.locations ?? [])
			: (this.#currentLocation?.children ?? [])
	)
	#path: string = $derived(
		findLocation(appState.selectedPack?.locations ?? [], this.#currentLocation)[1]
	)
	#parentLocation: Location | null = $derived(
		this.#getLocationByPath(
			this.#path.substring(0, this.#path.lastIndexOf('/')),
			appState.selectedPack?.locations ?? []
		) ?? null
	)

	#getLocationByPath(path: string, locations: Location[]): Location | null {
		const parts = path.split('/').filter(Boolean)
		if (!parts.length || parts[0] === '') {
			return null
		}

		let locs = locations
		let loc
		for (const part of parts) {
			loc = locs?.find((l) => l.name === part)
			if (!loc) {
				return null
			}

			locs = loc.children ?? []
		}

		return loc ?? null
	}

	get path() {
		return this.#path
	}

	get parentLocation() {
		return this.#parentLocation
	}

	get currentLocation() {
		return this.#currentLocation
	}
	set currentLocation(loc) {
		this.#currentLocation = loc
	}

	get currentChildren() {
		return this.#currentChildren
	}

	walkUpPath(segments: number) {
		if (segments === -1) {
			this.#currentLocation = null
			return
		}

		for (let i = segments; i > 0; i--) {
			const index = this.#path.lastIndexOf('/')
			if (index === -1) {
				throw new Error('Cannot walk up path any further')
			}

			this.#currentLocation = this.#getLocationByPath(
				this.#path.substring(0, index),
				appState.selectedPack?.locations ?? []
			)
		}
	}

	walkDownPath(location: Location) {
		this.#currentLocation = location
	}

	addChildLocation() {
		const loc = createLocation()
		this.#currentChildren.push(loc)

		if (this.#currentLocation && !this.#currentLocation.children) {
			this.#currentLocation.children = this.#currentChildren
		}
	}
}

export const [getLocationsTabContext, setLocationsTabContext] = createContext<LocationsTabContext>()
