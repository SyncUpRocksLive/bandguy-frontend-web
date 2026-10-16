<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { router } from '@/Router.svelte';
	import { auth } from "@shared/ui/stores/Auth.svelte";
	import { peerStore } from "@/Stores/PeerStore.svelte"
	import { Log } from '@shared/services/Logger';
	import { getSetsOverview } from '@shared/services/syncuprocks/musician/Api';
	import type { SetOverview } from '@shared/services/syncuprocks/musician/Types';
	import { PeerOperationMode, PeerRole } from '@/Types/Types';
	import CreateJam from '../JamSessions/CreateJam.svelte';
	import JamJoin from '../JamSessions/JamJoin.svelte';
	import { msToHMS } from '@shared/display/DisplayHelpers';

	// TODO: When joined to a jam from a different host - we must load their setlist
	let query = createQuery(() => ({
		queryKey: ['my.setlist', auth.user?.userId ?? 'none'],
		queryFn: async () => {
			console.log("Fetching for user:", auth.user?.userId);
			return await getSetsOverview(auth.user!.userId);
		},
		refetchInterval: 600000,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		enabled: !!auth.user?.userId,
	}));

	function playSet(set: SetOverview) {
		const route = $peerStore.peerMode === PeerOperationMode.Host ? 'HostSetView' : 'SoloSetView';
		Log('verbose', `Starting set=${set.name} route=${route}`);
		router.navigate(route, [set.id.toString()]);
	}
	
	function getDuration(set: SetOverview) {
		// FUTURE: Return duration as part of overview
		const ms = set.songs.reduce((acc, song) => acc + (song.durationMs ?? 0), 0);
		if (ms <= 0) {
			return '';
		}

		return msToHMS(ms);
	}

	const errorMessage = $derived.by(() => {
		if (!query.isLoading) {
			if (query.isError) {
				return query.error.message;
			} else if (!query.data) {
				return "No Data Loaded";
			} else if (query.data.ok === false) {
				return query.data.error ?? "Unknown Error";
			}
		}
	
		return undefined;
	});

	let JamSetupDialog = $derived.by(() => {
		if ($peerStore.peerMode === PeerOperationMode.Host && !$peerStore.peerChannelDetail) {
			return CreateJam;
		} else if ($peerStore.peerMode === PeerOperationMode.Guest && !$peerStore.peerChannelDetail) {
			return JamJoin;
		}

		return null;
	});

	let setlists = $derived.by(() => {
		if (query.data && query.data.ok) {
			return query.data.value.filter(set => set.songs.length > 0).sort((a, b) => a.name.localeCompare(b.name));
		}

		return [];
	});

</script>

<section id="center">
	<div class="studio-controls">
		<div class="control-grid">
			{#if JamSetupDialog}
				<JamSetupDialog />
			{:else if $peerStore.peerChannelDetail && $peerStore.peerRole !== PeerRole.Leader}
				WAITING FOR HOST TO START JAM
			{:else}
				<!-- TODO: Clean this style up -->
				{#if query.isLoading}
					<div>Loading...</div>
				{:else if errorMessage}
					<div>Error: {errorMessage}</div>
				{:else if query.data && query.data.ok}
					{#each setlists as set (set.id)}
						<div class="control-item">
							<div class="icon">
								<svg fill="#f0f0f0" width="64px" height="64px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="#f0f0f0"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.096"></g><g id="SVGRepo_iconCarrier"><path d="M7,20a1,1,0,0,1-1,1H2a1,1,0,0,1,0-2H6A1,1,0,0,1,7,20ZM6,15H2a1,1,0,0,0,0,2H6a1,1,0,0,0,0-2Zm0-4H2a1,1,0,0,0,0,2H6a1,1,0,0,0,0-2Zm8,8H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm0-4H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm0-4H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm0-4H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm0-4H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm8,16H18a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm0-4H18a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Z"></path></g></svg>
							</div>
							<h4>{set.name}</h4>
							<p>
								({set.songs.length} songs) {getDuration(set)}
							</p>
							<button
								class="control-btn"
								onclick={() => playSet(set)}>
								▶ Play
							</button>
						</div>
					{/each}
				{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	section {
		grid-area: center;
		flex: 1;
		display: flex;
		flex-direction: column;
		margin: 1px;
		padding: 5px;
		overflow-y: auto;
		/* overflow: hidden !important;  */
		overscroll-behavior: none;
	}

	.studio-controls {
		text-align: center;
		max-width: 1000px;
		margin: 0 auto;
	}

	.control-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		max-width: 1000px;
		margin: 0 auto;
		overflow-y: auto;
	}

	.control-item {
		background: rgba(33, 53, 71, 0.8);
		border: 1px solid rgba(100, 150, 200, 0.3);
		border-radius: 12px;
		padding: 2rem;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.control-item:hover {
		border-color: #6b9ec4;
		background: rgba(33, 53, 71, 0.95);
		transform: translateY(-2px);
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.9;
	}

	.control-item h4 {
		font-size: 1.4rem;
		margin-bottom: 0.5rem;
		color: #e0e0e0;
	}

	.control-item p {
		font-size: 0.9rem;
		color: #a0a0a0;
		margin-bottom: 1.5rem;
		line-height: 1.4;
		flex-grow: 1;
	}

	.control-btn {
		background: #239fc4;
		color: #ffffff;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.control-btn:hover:not(:disabled) {
		background: #1a7a9a;
		transform: translateY(-1px);
	}

	.control-btn:disabled {
		background: #555555;
		cursor: not-allowed;
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.control-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.control-item {
			padding: 1.5rem;
		}
	}

</style>
