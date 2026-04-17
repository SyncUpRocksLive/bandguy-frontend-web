<script lang="ts">
	import { auth } from '../Auth.svelte';
	import { onMount } from 'svelte';

	let show = $state(false);
	let isFullscreen = $state(false);

	onMount(() => {
		function onFullscreenChange() {
			isFullscreen = Boolean(document.fullscreenElement);
			show = false;
		}

		if (document.fullscreenElement) {
			isFullscreen = true;
		}

		document.addEventListener('fullscreenchange', onFullscreenChange);

		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	});

	function toggleFullscreen() {
		if (!isFullscreen) {
			document.body.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
		show = false;
	}

	function logout() {
		show = false;
		window.location.assign('/api/auth/logout');
	}

	function setShow(value: boolean) {
		show = value;
	}
</script>

{#if auth.user}
	<button
		class="profile-button"
		onclick={() => setShow(!show)}
		title={auth.user.displayName}
		aria-label="User profile menu"
	>
		👤
	</button>

	{#if show}
		<div class="profile-overlay" onclick={() => setShow(false)} onkeydown={(e) => { if (e.key === 'Escape') setShow(false); }} role="dialog" aria-modal="true" tabindex="-1">
			<div class="profile-popover" onclick={(e) => e.stopPropagation()}>
				<div class="profile-header">
					<h4>Welcome {auth.user.displayName}</h4>
					<button onclick={() => setShow(false)} aria-label="Close">&times;</button>
				</div>
				<div class="profile-body">
					<div class="user-info">
						<span>{auth.user.displayName}</span>
						<span class="username">@{auth.user.username}</span>
					</div>
					<div class="profile-actions">
						<button
							class="action-button"
							onclick={toggleFullscreen}
							aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
						>
							{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
						</button>
						<button
							class="action-button logout-button"
							onclick={logout}
							aria-label="Logout"
						>
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.profile-button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1.5rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.profile-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.profile-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.profile-popover {
		background: white;
		border-radius: 0.5rem;
		max-width: 300px;
		width: 90%;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.profile-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #dee2e6;
		background-color: #f8f9fa;
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.profile-header h4 {
		margin: 0;
		font-size: 1.1rem;
	}

	.profile-header button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.profile-header button:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.profile-body {
		padding: 1rem;
	}

	.user-info {
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.username {
		color: #6c757d;
		font-size: 0.875rem;
	}

	.profile-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.action-button {
		background-color: #6c757d;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.action-button:hover {
		background-color: #5a6268;
	}

	.logout-button {
		background-color: #dc3545;
	}

	.logout-button:hover {
		background-color: #c82333;
	}
</style>
