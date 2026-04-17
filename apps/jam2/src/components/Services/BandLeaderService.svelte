<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '../../State.svelte';
	import { PeerOperationMode } from '../../Types/Types';
	import { messageBus } from '../../Support/MessageBus';
	import { peerManager } from '../../Support/WebRTC/PeerConnectionManager';
	import { JamChannels } from '@shared/services/syncuprocks/musician/JamChannels';
	import { Log } from '@shared/services/Logger';

	let isListening = $state(false);
	let connectedClients = $state<string[]>([]);
	let channelId = $state<string | null>(null);

	// BandLeaderService - manages host connections
	onMount(() => {
		if (appState.store.peerMode === PeerOperationMode.Host && appState.store.user) {
			Log('info', 'Setting up BandLeaderService');
			setupChannel();
		}
	});

	async function setupChannel() {
		try {
			// Create a new channel
			const newChannelId = Math.floor(Math.random() * 10000).toString();
			const channelDetail = {
				hostUser: appState.store.user!.userId,
				identifier: newChannelId,
				friendlyName: `${appState.store.user!.username}-${newChannelId}`,
				timestamp: Date.now()
			};

			Log('info', `Creating new channel: ${channelDetail.friendlyName}`);
			await JamChannels.createChannel(channelDetail);
			channelId = newChannelId;

			// Start listening for guest connections
			startListening();

			return () => {
				cleanup();
			};
		} catch (error) {
			Log('error', 'Failed to setup channel:', error);
		}
	}

	function startListening() {
		Log('info', 'BandLeaderService: Starting host mode');

		// Listen for guest connection requests via MessageBus
		const unsubscribe = messageBus.subscribe((event) => {
			if (event.data.type === 'GUEST_JOIN_REQUEST') {
				const peerId = event.data.peerId;
				Log('info', `Host: Guest ${peerId} requesting to join`);

				// Create peer connection for this guest
				const peerConnection = peerManager.createPeerConnection(peerId);

				// Create data channels for messaging and audio
				peerManager.createDataChannel(peerId, 'messages');
				peerManager.createDataChannel(peerId, 'audio');

				connectedClients = [...connectedClients, peerId];
			}
		});

		isListening = true;

		return unsubscribe;
	}

	function cleanup() {
		Log('info', 'Tearing down BandLeaderService');
		isListening = false;

		// Delete the channel
		if (channelId && appState.store.user) {
			JamChannels.deleteChannel({
				hostUser: appState.store.user.userId,
				identifier: channelId,
				friendlyName: '',
				timestamp: 0
			}).catch((error) => Log('error', 'Failed to delete channel:', error));
		}

		peerManager.closeAll();
		connectedClients = [];
	}
</script>

{#if appState.store.peerMode === PeerOperationMode.Host}
	<div class="band-leader-service">
		<h4>Band Leader Service</h4>
		<p>Status: {isListening ? 'Listening for guests' : 'Not listening'}</p>
		<p>Clients connected: {connectedClients.length}</p>
		{#if connectedClients.length > 0}
			<ul class="client-list">
				{#each connectedClients as clientId (clientId)}
					<li>{clientId}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.band-leader-service {
		padding: 1rem;
		border: 1px solid #4fc3f7;
		border-radius: 0.5rem;
		margin: 1rem 0;
		background: rgba(79, 195, 247, 0.05);
		color: white;
	}

	.client-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0 0;
		font-size: 0.9rem;
	}

	.client-list li {
		padding: 0.25rem 0;
		color: #4fc3f7;
	}
</style>
