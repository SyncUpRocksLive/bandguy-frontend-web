<script lang="ts">
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';

	// Set peer mode to Guest
	$effect(() => {
		appState.setPeerMode(PeerOperationMode.Guest);
	});
</script>

<div class="guest-view">
	<h2>Guest Mode</h2>
	<p>Join a remote band session</p>
	<!-- TODO: Implement BandJoin dialog and remote SetView -->
	<div class="placeholder">
		Guest functionality not yet implemented
	</div>
</div>

<style>
	.guest-view {
		padding: 20px;
		text-align: center;
	}

	.placeholder {
		margin: 20px 0;
		padding: 20px;
		border: 2px dashed #ccc;
		border-radius: 8px;
		background-color: #f8f9fa;
	}
</style>
