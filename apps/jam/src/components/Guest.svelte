<script lang="ts">
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import BandJoin from './BandJoin.svelte';
	import SetView from './SetView.svelte';

	// Set peer mode to Guest when this component mounts
	$effect(() => {
		if (appState.store.peerMode !== PeerOperationMode.Guest) {
			appState.setPeerMode(PeerOperationMode.Guest);
		}
	});

	// Check if connected
	let isConnected = $state(false);

	$effect(() => {
		isConnected = !!appState.store.currentSetId;
	});
</script>

<div class="guest-container">
	{#if !isConnected}
		<BandJoin />
	{:else}
		<SetView mode="guest" setId={appState.store.currentSetId} />
	{/if}
</div>

<style>
	.guest-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 1px;
		padding: 5px;
		overflow-y: auto;
	}
</style>
