<script lang="ts">
	import { onMount } from 'svelte';
	import { router } from '../Router.svelte';
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import { Log, LogError } from '@shared/services/Logger';
	import { getSongStore } from '../Support/Stores/SongStore'; // TODO: create this

	onMount(async () => {
		Log('verbose', 'Starting up IndexDb Services...');
		const songStore = getSongStore();
		await songStore.initialize();

		if (appState.store.peerMode !== PeerOperationMode.Solo) {
			Log('verbose', 'Resetting Peer Mode');
			appState.setPeerMode(PeerOperationMode.Solo);
		}
	});
</script>

<div class="home-container">
	<h1 class="text-center mb-5">Choose Your Jam Mode</h1>

	<div class="d-flex justify-content-center gap-4">
		<button
			class="btn btn-primary btn-lg"
			onclick={() => router.navigate('SoloSets')}
		>
			Jam Solo
		</button>

		<button
			class="btn btn-success btn-lg"
			onclick={() => router.navigate('HostSets')}
		>
			Lead a band!
		</button>

		<button
			class="btn btn-warning btn-lg"
			onclick={() => router.navigate('Guest')}
		>
			Join a band!
		</button>
	</div>
</div>

<style>
	.home-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.btn {
		min-width: 200px;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		font-weight: bold;
		border: none;
		border-radius: 0.5rem;
		transition: all 0.3s ease;
	}

	.btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.btn-primary {
		background-color: #007bff;
	}

	.btn-success {
		background-color: #28a745;
	}

	.btn-warning {
		background-color: #ffc107;
		color: #212529;
	}

	/* Bootstrap utility classes */
	.text-center {
		text-align: center !important;
	}

	.mb-5 {
		margin-bottom: 3rem !important;
	}

	.d-flex {
		display: flex !important;
	}

	.justify-content-center {
		justify-content: center !important;
	}

	.gap-4 {
		gap: 1.5rem !important;
	}
</style>
