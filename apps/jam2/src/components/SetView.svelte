<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { router } from '../Router.svelte';
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import { Log, LogVerbose } from '@shared/services/Logger';
// Placeholder types - TODO: import from shared
interface SetComplete {
	id: number;
	name: string;
	songs: any[];
}

interface ApiResponseBase<T> {
	success: boolean;
	data?: T;
	errorMessage?: string;
}

	interface Props {
		mode: 'host' | 'solo';
		setId: string;
	}

	let { mode, setId }: Props = $props();

	// Update state
	$effect(() => {
		const peerMode = mode === 'host' ? PeerOperationMode.Host : PeerOperationMode.Solo;
		appState.setPeerMode(peerMode);
		appState.setCurrentSet(parseInt(setId, 10));
	});

	const query = createQuery({
		queryKey: ['setlist', appState.store.currentSetId],
		queryFn: async () => {
			if (!appState.store.currentSetId) return null;
			LogVerbose(`Downloading set overview for setId=${appState.store.currentSetId}`);
			const data = await fetch(`/api/legacy/user/sets/complete/${appState.store.currentSetId}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" }
			});
			const response: ApiResponseBase<SetComplete> = await data.json();
			return response.data;
		},
		refetchInterval: false,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchOnWindowFocus: false,
		enabled: !!appState.store.currentSetId,
	});
</script>

<div class="set-view">
	<h2>Set View - {mode} mode</h2>
	<p>Set ID: {setId}</p>

	{#if $query.isLoading}
		<div>Loading set...</div>
	{:else if $query.data}
		<div>
			<h3>{$query.data.name}</h3>
			<p>{$query.data.songs.length} songs</p>
			<!-- TODO: Implement full SetView functionality -->
		</div>
	{:else}
		<div>No set data</div>
	{/if}

	<button class="btn btn-secondary" onclick={() => router.navigate(mode === 'host' ? 'HostSets' : 'SoloSets')}>
		Back to Sets
	</button>
</div>

<style>
	.set-view {
		padding: 20px;
	}

	.btn {
		display: inline-block;
		font-weight: 400;
		line-height: 1.5;
		color: #212529;
		text-align: center;
		text-decoration: none;
		vertical-align: middle;
		cursor: pointer;
		-webkit-user-select: none;
		-moz-user-select: none;
		user-select: none;
		background-color: transparent;
		border: 1px solid transparent;
		padding: 0.375rem 0.75rem;
		font-size: 1rem;
		border-radius: 0.25rem;
		transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
	}

	.btn-secondary {
		color: #fff;
		background-color: #6c757d;
		border-color: #6c757d;
	}

	.btn:hover {
		color: #fff;
		background-color: #545b62;
		border-color: #4e555b;
	}
</style>
