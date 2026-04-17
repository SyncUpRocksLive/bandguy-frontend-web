<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { router } from '../Router.svelte';
	import { appState } from '../State.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import { Log } from '@shared/services/Logger';
// Placeholder types - TODO: import from shared
interface SetOverview {
	musicianId: number;
	id: number;
	name: string;
	createdAtMsUtc: number;
	songs: any[]; // SongOverview[]
}

interface ApiResponseBase<T> {
	success: boolean;
	data?: T;
	errorMessage?: string;
}

	interface Props {
		mode: 'host' | 'solo';
	}

	let { mode }: Props = $props();

	// Update peer mode
	$effect(() => {
		const peerMode = mode === 'host' ? PeerOperationMode.Host : PeerOperationMode.Solo;
		appState.setPeerMode(peerMode);
	});

	const query = createQuery({
		queryKey: ['my.setlist', appState.store.user?.userId ?? 'none'],
		queryFn: async () => {
			if (!appState.store.user?.userId) return [];
			Log('verbose', `my.setlist: downloading for userId=${appState.store.user.userId}`);
			const data = await fetch(`/api/legacy/user/sets/overview/${appState.store.user.userId}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" }
			});
			const response: ApiResponseBase<SetOverview[]> = await data.json();
			Log('verbose', `my.setlist: ${JSON.stringify(response)}`);
			return response.data ?? [];
		},
		refetchInterval: 600000,
		staleTime: 0,
		refetchOnMount: 'always',
		refetchOnWindowFocus: true,
		enabled: !!appState.store.user?.userId,
	});

	function playSet(set: SetOverview) {
		const route = mode === 'host' ? 'HostSetView' : 'SoloSetView';
		Log('verbose', `Starting set=${set.name} route=${route}`);
		router.navigate(route, [set.id.toString()]);
	}
</script>

<div style="flex: 1; display: flex; flex-direction: column; margin: 1px; padding: 5px; overflow-y: auto;">
	<div style="background: rgba(255,255,255,.7); padding: 0px; justify-content: center; align-items: center;">
		<p style="font-weight: bold; margin: 0px; padding: 2px;">Set List</p>
	</div>

	<div style="flex: 1; display: flex; flex-direction: row; background: rgba(0,0,0,.9); padding: 10px; color: white; overflow-y: auto;">
		{#if $query.isLoading}
			<div>Loading...</div>
		{:else if $query.data}
			{#each $query.data as set (set.id)}
				<div style="width: 200px; height: 100px; margin: 4px;">
					<button
						class="btn btn-dark"
						style="padding: 2px 10px;"
						onclick={() => playSet(set)}
					>
						▶ {set.name} : {set.songs.length} songs 00:00:00 hrs
					</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
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

	.btn-dark {
		color: #fff;
		background-color: #343a40;
		border-color: #343a40;
	}

	.btn:hover {
		color: #fff;
		background-color: #23272b;
		border-color: #1d2124;
	}
</style>
