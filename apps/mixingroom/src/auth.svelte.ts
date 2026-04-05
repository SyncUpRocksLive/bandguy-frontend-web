import { GetAuthState } from '@shared/services/syncuprocks/auth/Api';

// src/auth.svelte.ts
class AuthService {
	// Use $state so the UI can react to login changes
	isAuthenticated = $state<boolean | null>(null); // null = "checking", true, or false
	user = $state<any>(null);
	isChecking = $state(false);

	private intervalId: number | null = null;
	private loginUrl: string | null = null;
	private logoutUrl: string | null = null;

	constructor() {
		this.checkStatus();
		this.startPolling();
	}

	async checkStatus() {
		if (this.isChecking) {
			console.warn('Already checking auth status, skipping...');
			return;
		}

		this.isChecking = true;

		try {
			const loginState = await GetAuthState();

			// Update state
			this.isAuthenticated = loginState ? loginState.isLoggedIn : false;
			this.user = loginState ? loginState.username : null;

			if (loginState) {
				this.loginUrl = loginState.logInUrl || null;
				this.logoutUrl = loginState.logOutUrl || null;
			}

			// If we were logged in and now we aren't, handle it
			if (this.isAuthenticated === false) {
				this.stopPolling();
			}
		} catch (err) {
			this.isAuthenticated = false;
		}

		this.isChecking = false;
	}

	startPolling() {
		if (this.intervalId) return;
		// Check every 5 minutes (300,000 ms)
		this.intervalId = window.setInterval(() => this.checkStatus(), 300_000);
	}

	stopPolling() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	login() {
		// Standard OIDC redirect
		window.location.href = (this.loginUrl || '/api/auth/login') + '?returnUrl=/mixingroom/';
	}

	logout() {
		// Standard OIDC redirect
		window.location.href = this.logoutUrl || '/api/auth/logout';
	}
}

export const auth = new AuthService();
