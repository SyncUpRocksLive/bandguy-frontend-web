// Placeholder - TODO: import from shared
interface LoggedInStatus {
	isLoggedIn: boolean;
	userId?: string;
	username?: string;
	logInUrl?: string;
	logOutUrl?: string;
}

const GetAuthState = async (): Promise<LoggedInStatus | null> => {
	// TODO: implement actual auth check
	return { isLoggedIn: false };
};

// src/auth.svelte.ts
class AuthService {
	// Use $state so the UI can react to login changes
	isAuthenticated = $state<boolean | null>(null); // null = "checking", true, or false
	user = $state<LoggedInStatus | null>(null);
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
			this.user = loginState || null;

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

	login(returnUrl?: string) {
		// Standard OIDC redirect
		const url = (this.loginUrl || '/api/auth/login') + (returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '');
		console.log(`Redirecting to login: ${url}`);
		window.location.href = url;
	}

	logout() {
		// Standard OIDC redirect
		window.location.href = this.logoutUrl || '/api/auth/logout';
	}
}

export const auth = new AuthService();
