<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { auth } from "@shared/ui/stores/Auth.svelte";
	import { JamChannels, type JamChannelDetail } from '@shared/services/syncuprocks/musician/JamChannels';
	import { LogInfo, LogObject } from '@shared/services/Logger';
	import { peerStore } from '@/Stores/PeerStore.svelte';

	let joinCode = $state('1234');
	let showJoinCodeInput = $state(false);

	// Query for available channels
	const channelsQuery = createQuery(() => ({
		queryKey: ['channel.list'],
		queryFn: async () => {
			// TODO: Refactor this to use same type of response as Api
			LogInfo('Fetching channel list...', 'JamJoin');
			const allChannels = await JamChannels.getChannelList();
			LogObject('info', 'JamJoin - Channel List', allChannels);

			// Ignore our own channels
			const otherChannels = allChannels
				.filter((k) => k.hostUser !== auth.user?.userId)
				.sort((a, b) => a.timestamp - b.timestamp);

			return otherChannels;
		},
		refetchInterval: 5000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!auth.user,
	}));

	function joinChannel(channel: JamChannelDetail) {
		console.log(`Joining channel: ${channel.friendlyName}`);
		peerStore.updateState({
			peerChannelDetail: {
			hostUser: channel.hostUser,
			identifier: channel.identifier,
			friendlyName: channel.friendlyName,
			timestamp: channel.timestamp,
			code: channel.code,
			status: 'pending'
		}});
	}

	function joinWithCode() {
		if (!joinCode.trim()) return;
		console.log(`Joining with code: ${joinCode}`);
		// TODO: Implement join by code logic
		joinCode = '';
		showJoinCodeInput = false;
	}
</script>

<div class="band-join-container">
	<div class="band-header">
		<p class="band-title">Band List</p>
	</div>

	<div class="band-content">
		{#if channelsQuery.isLoading}
			<p class="status-text">Loading available jam rooms...</p>
		{:else if channelsQuery.isError}
			<p class="error-text">Error loading jam rooms</p>
		{:else if channelsQuery.data && channelsQuery.data.length === 0}
			<p class="status-text">No jam rooms available</p>
		{:else}
			<ul class="channel-list">
				{#each channelsQuery.data as channel (channel.identifier)}
					<li class="channel-item">
						<button 
							class="join-button"
							onclick={() => joinChannel(channel)}
							title={`Join ${channel.friendlyName}`}
							
						>
							Join Band: <strong>{channel.friendlyName}</strong>
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="code-input-section">
			<input
				type="text"
				placeholder="Enter join code"
				bind:value={joinCode}
				onkeydown={(e) => {
					if (e.key === 'Enter') joinWithCode();
					if (e.key === 'Escape') showJoinCodeInput = false;
				}}
				class="code-input"
			/>
			<button onclick={joinWithCode} class="code-submit">
				Join
			</button>
		</div>
	</div>
</div>

<style>
	.band-join-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		overflow: hidden;
	}

	.band-header {
		background: rgba(255, 255, 255, 0.7);
		padding: 0.5rem;
		text-align: center;
	}

	.band-title {
		font-weight: bold;
		margin: 0;
		padding: 0;
		color: black;
	}

	.band-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status-text {
		text-align: center;
		color: #aaa;
		font-style: italic;
	}

	.error-text {
		text-align: center;
		color: #f00;
	}

	.channel-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.channel-item {
		width: 100%;
	}

	.join-button {
		width: 100%;
		padding: 0.75rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.join-button:hover {
		background: #0056b3;
	}

	.join-button:active {
		background: #003d82;
	}

	.code-input-section {
		display: flex;
		gap: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		padding-top: 1rem;
	}

	.code-input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.25rem;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		font-size: 1rem;
	}

	.code-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.code-input:focus {
		outline: none;
		border-color: #007bff;
		background: rgba(0, 0, 0, 0.7);
	}

	.code-submit {
		padding: 0.5rem 1rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.code-submit:hover {
		background: #218838;
	}
</style>
