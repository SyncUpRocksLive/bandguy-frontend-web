<script lang="ts">
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import { LogInfo } from '@shared/services/Logger';
	import { broadcastMessage } from '../Support/MessageBus';
	import { MessageBusActionType } from '../Types/MessageBus';

	let show = $state(false);

	function bootFromBand(user: any) {
		LogInfo(`Kicking User:Instance (${user.username} out of band!)`);
		broadcastMessage({
			data: {
				type: MessageBusActionType.KICKOUT,
				userId: user.userId,
				instance: ''
			}
		});
		setShow(false);
	}

	function setShow(value: boolean) {
		show = value;
	}
</script>

{#if appState.store.peerMode === PeerOperationMode.Host}
	<button
		class="status-button"
		onclick={() => setShow(!show)}
		title="Host Status"
		aria-label="Host status menu"
	>
		🎸
	</button>

	{#if show}
		<div class="status-overlay" onclick={() => setShow(false)} onkeydown={(e) => { if (e.key === 'Escape') setShow(false); }} role="dialog" aria-modal="true" tabindex="-1">
			<div class="status-popover" onclick={(e) => e.stopPropagation()}>
				<div class="status-header">
					<h4>Band Leader {appState.store.user?.displayName}</h4>
					<button onclick={() => setShow(false)} aria-label="Close">&times;</button>
				</div>
				<div class="status-body">
					<div class="bandmates-section">
						<strong>Bandmates:</strong>
						{#if appState.store.connectedUsers.length > 0}
							<ul class="bandmates-list">
								{#each appState.store.connectedUsers as user (user.userId)}
									<li class="bandmate-item">
										{user.username} ({user.role})
										<button
											class="kick-button"
											onclick={() => bootFromBand(user)}
											aria-label="Kick {user.username} out of band"
										>
											Kick out
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p>No bandmates connected</p>
						{/if}
					</div>
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

	.bandmates-section {
		margin-bottom: 1rem;
	}

	.bandmates-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0 0;
	}

	.bandmate-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}

	.bandmate-item:last-child {
		border-bottom: none;
	}

	.kick-button {
		background-color: #dc3545;
		color: white;
		border: none;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background-color 0.2s;
	}

	.kick-button:hover {
		background-color: #c82333;
	}
</style>
