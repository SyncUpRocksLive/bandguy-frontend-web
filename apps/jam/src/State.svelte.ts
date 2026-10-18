
class AppState {
	// Global state equivalent to react-superstore
	// UI state
	ui = $state({
		isMenuOpen: false,
		lastError: null as string | null,
	});

	uuid(): string {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	connectionIdentifier = this.uuid();

	constructor() {
	}

	async loadFromStorage() {
		// TODO: load user, peerMode, etc. from localStorage if needed	
	}

	saveToStorage() {
		// TODO: persist state
	}
}

// Export a single instance
export const appState = new AppState();
