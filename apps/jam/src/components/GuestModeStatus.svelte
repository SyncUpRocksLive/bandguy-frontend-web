<script lang="ts">
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';

	let show = $state(false);

	function leaveChannel() {
		setShow(false);
		// TODO: Implement leave channel logic
		appState.updateStore({
			connectedChannelDetail: undefined,
			connectedUsers: [],
			currentSetId: undefined
		});
	}

	function setShow(value: boolean) {
		show = value;
	}
</script>

{#if appState.store.peerMode === PeerOperationMode.Guest}
	<button
		class="status-button"
		onclick={() => setShow(!show)}
		title="Guest Status"
		aria-label="Guest status menu"
	>
		🎤
	</button>

	{#if show}
		<div class="status-overlay" onclick={() => setShow(false)} onkeydown={(e) => { if (e.key === 'Escape') setShow(false); }} role="dialog" aria-modal="true" tabindex="-1">
			<div class="status-popover" onclick={(e) => e.stopPropagation()}>
				<div class="status-header">
					<h4>Band Member {appState.store.user?.displayName}</h4>
					<button onclick={() => setShow(false)} aria-label="Close">&times;</button>
				</div>
				<div class="status-body">
					{#if appState.store.connectedUsers.length > 0}
						<div class="band-section">
							<strong>Band:</strong>
							<ul class="band-list">
								{#each appState.store.connectedUsers as user (user.userId)}
									<li class="band-item">
										{user.username} ({user.role})
										{#if user.isBandLeader}
											<span class="leader-badge">Leader</span>
										{/if}
									</li>
								{/each}
							</ul>
							<button
								class="leave-button"
								onclick={leaveChannel}
								aria-label="Leave band"
							>
								Leave Band
							</button>
						</div>
					{:else}
						<p>Not Connected</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.status-button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		font-size: 1.5rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s;
	}

	.status-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.status-overlay {
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

	.status-popover {
		background: white;
		border-radius: 0.5rem;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	}

	.status-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #dee2e6;
		background-color: #f8f9fa;
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.status-header h4 {
		margin: 0;
		font-size: 1.1rem;
	}

	.status-header button {
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

	.status-header button:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.status-body {
		padding: 1rem;
	}

	.band-section {
		margin-bottom: 1rem;
	}

	.band-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 1rem 0;
	}

	.band-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.band-item:last-child {
		border-bottom: none;
	}

	.leader-badge {
		background-color: #ffc107;
		color: #000;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: bold;
	}

	.leave-button {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
		width: 100%;
	}

	.leave-button:hover {
		background-color: #c82333;
	}
</style>
