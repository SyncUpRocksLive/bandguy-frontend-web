<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { appState } from '../State.svelte';
	import { JamChannels, type JamChannelDetail } from '@shared/services/syncuprocks/musician/JamChannels';

	let joinCode = $state('');
	let showJoinCodeInput = $state(false);

	// Query for available channels
	const channelsQuery = createQuery({
		queryKey: ['channel.list'],
		queryFn: async () => {
			const allChannels = await JamChannels.getChannelList();

			// Ignore our own channels
			const otherChannels = allChannels
				.filter((k) => k.hostUser !== appState.store.user?.userId)
				.sort((a, b) => a.timestamp - b.timestamp);

			return otherChannels;
		},
		refetchInterval: 2000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!appState.store.user,
	});

	// Use the channels directly
	let channelData = $state<JamChannelDetail[]>([]);

	$effect(() => {
		channelData = $channelsQuery.data ?? [];
	});

	function joinChannel(channel: JamChannelDetail) {
		console.log(`Joining channel: ${channel.friendlyName}`);
		// TODO: Implement join channel logic
		appState.updateStore({
			connectedChannelDetail: channel,
			peerMode: 'Guest' as any
		});
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
		{#if $channelsQuery.isPending}
			<p class="status-text">Loading available jam rooms...</p>
		{:else if $channelsQuery.isError}
			<p class="error-text">Error loading jam rooms</p>
		{:else if channelData.length === 0}
			<p class="status-text">No jam rooms available</p>
		{:else}
			<ul class="channel-list">
				{#each channelData as channel (channel.identifier)}
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

		<div class="join-options">
			<button
				class="option-button"
				onclick={() => showJoinCodeInput = !showJoinCodeInput}
			>
				{showJoinCodeInput ? '✕' : '→'} Enter Code
			</button>

			<button class="option-button" disabled>
				→ Scan QR
			</button>
		</div>

		{#if showJoinCodeInput}
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
		{/if}
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

	.join-options {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		padding-top: 1rem;
	}

	.option-button {
		flex: 1;
		min-width: 100px;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	.option-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.2);
	}

	.option-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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
