// src/state.svelte.ts
const STORAGE_KEY = 'mixingroom_settings';

// Define an interface for your state structure
interface UserProfile {
	name: string;
	theme: 'light' | 'dark';
	status: 'online' | 'offline';
}

export type ViewArea = 'Home' | 'SongLibrary' | 'Setlists' | 'Notes';

function isValidView(name: string): name is ViewArea {
	return ['Home', 'SongLibrary', 'Setlists', 'Notes'].includes(name);
}

class AppState {
	// Use the $state rune for reactivity
	settings = $state<UserProfile>({
		name: 'Guest',
		theme: 'dark',
		status: 'online'
	});

	// 2. Volatile state (lost on refresh, e.g., UI toggles, search queries)
	// TODO: load area from URL hash for deep linking (hash routing)
	// TODO: Use History API for better back/forward navigation
	ui = $state({
		area: 'Home' as ViewArea,
		isMenuOpen: false,
		searchQuery: '',
		lastError: null as string | null
	});

	// Derived state (recomputes automatically when user.name changes)
	greeting = $derived(`Hello, ${this.settings.name}!`);

	constructor() {
		// Load initial settings
		//const saved = localStorage.getItem(STORAGE_KEY);
		//if (saved) 
		//	this.settings = JSON.parse(saved);
		// 3. Selective Effect: Only runs when 'this.settings' changes
		// $effect.root(() => {
		//   $effect(() => {
		//     // Svelte tracks that we are reading 'this.settings' here
		//     localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
		//     console.log('Settings saved to storage!');
		//   });
		// });
	}

	setView(name: string) {
		// No need to update if already on the same view
		if (name === this.ui.area)  {
			console.log(`Already on view: ${name}`);
			return;
		}

		// Use the type guard
		if (isValidView(name)) {
			// TypeScript now knows 'name' is safely a ViewArea
			console.log(`Switching view to: ${name}`);
			this.ui.area = name;
		} else {
			console.warn(`Invalid view name: ${name}`);
		}
	}

	// Methods to update state
	updateName(newName: string) {
		this.settings.name = newName;
	}

	toggleTheme() {
		this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
	}
}

// Export a single instance (Singleton pattern)
export const appState = new AppState();
