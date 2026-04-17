<script lang="ts">
	import { onMount } from 'svelte';
	import { appState } from '../../State.svelte';
	import { PeerOperationMode } from '../../Types/Types';
	import { messageBus, broadcastMessage } from '../../Support/MessageBus';
	import { peerManager } from '../../Support/WebRTC/PeerConnectionManager';
	import { LogInfo, LogError } from '@shared/services/Logger';

	let isConnected = $state(false);
	let hostPeerId = $state<string | null>(null);
	let connectionStatus = $state('Disconnected');

	onMount(() => {
		if (appState.store.peerMode === PeerOperationMode.Guest) {
			LogInfo('FollowerService: Starting guest mode');
			setupGuestMode();
		}
	});

	function setupGuestMode() {
		// Listen for offers from host
		const unsubscribe = messageBus.subscribe((event) => {
			if (event.data.type === 'OFFER') {
				const { peerId, offer } = event.data;
				LogInfo(`Guest: Received offer from ${peerId}`);

				hostPeerId = peerId;
				const peerConnection = peerManager.createPeerConnection(peerId);

				// Set remote description and create answer
				peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
					.then(() => peerConnection.createAnswer())
					.then(answer => {
						peerConnection.setLocalDescription(answer);
						// Send answer back to host via signaling
						broadcastMessage({
							data: {
								type: 'ANSWER',
								peerId,
								answer: peerConnection.localDescription
							}
						});
						connectionStatus = 'Connecting...';
					})
					.catch(error => {
						LogError('Error answering offer:', error);
						connectionStatus = 'Connection failed';
					});
			} else if (event.data.type === 'CONNECTION_STATE_CHANGE') {
				if (event.data.peerId === hostPeerId) {
					connectionStatus = event.data.state;
					isConnected = event.data.state === 'connected';
				}
			}
		});

		return () => {
			LogInfo('FollowerService: Stopping guest mode');
			unsubscribe?.();
			peerManager.closeAll();
			isConnected = false;
			hostPeerId = null;
			connectionStatus = 'Disconnected';
		};
	}

	// Watch for connectedChannelDetail changes
	$effect(() => {
		if (!appState.store.connectedChannelDetail && isConnected) {
			LogInfo('FollowerService: Disconnecting from channel');
			peerManager.closeAll();
			isConnected = false;
			hostPeerId = null;
			connectionStatus = 'Disconnected';
		} else if (appState.store.connectedChannelDetail && !isConnected) {
			// TODO: Join the channel using ConnectFlow or similar
			LogInfo('FollowerService: Joining channel', appState.store.connectedChannelDetail.friendlyName);
		}
	});
</script>

{#if appState.store.peerMode === PeerOperationMode.Guest}
	<div class="follower-service">
		<h4>Follower Service</h4>
		<p>Status: {connectionStatus}</p>
		{#if hostPeerId}
			<p>Connected to: <strong>{hostPeerId}</strong></p>
		{/if}
	</div>
{/if}

<style>
	.follower-service {
		padding: 1rem;
		border: 1px solid #81c784;
		border-radius: 0.5rem;
		margin: 1rem 0;
		background: rgba(129, 199, 132, 0.05);
		color: white;
	}
</style>
