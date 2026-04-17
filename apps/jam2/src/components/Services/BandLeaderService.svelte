<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '../../State.svelte';
	import { PeerOperationMode } from '../../Types/Types';
	import { messageBus } from '../../Support/MessageBus';

	let isListening = $state(false);
	let clients = $state([]);

	// Placeholder BandLeaderService - manages host connections
	onMount(() => {
		if (appState.store.peerMode === PeerOperationMode.Host) {
			console.log('BandLeaderService: Starting host mode');

			// TODO: Implement WebRTC host functionality
			// - Create RTCPeerConnection
			// - Listen for guest connections
			// - Handle signaling via MessageBus

			isListening = true;
		}

		return () => {
			console.log('BandLeaderService: Stopping host mode');
			isListening = false;
			// TODO: Clean up WebRTC connections
		};
	});
</script>

{#if appState.store.peerMode === PeerOperationMode.Host}
	<div class="band-leader-service">
		<h4>Band Leader Service</h4>
		<p>Status: {isListening ? 'Listening for guests' : 'Not listening'}</p>
		<p>Clients connected: {clients.length}</p>
		<!-- TODO: Show connected clients list -->
	</div>
{/if}

<style>
	.band-leader-service {
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
</style>
