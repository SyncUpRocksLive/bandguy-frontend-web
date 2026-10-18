<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { auth } from "@shared/ui/stores/Auth.svelte";
	import { JamChannels, type JamChannelDetail } from '@shared/services/syncuprocks/musician/JamChannels';
	import { LogInfo, LogObject, LogError } from '@shared/services/Logger';
	import { peerStore } from '@/Stores/PeerStore.svelte';
	import { PeerOperationMode, PeerRole } from '@/Types/Types';

	let joinCode = $state('');
	let toast = $state('');
	let jamChannelSelected = $state(null as JamChannelDetail | null);

	function showToast(message: string) {
		toast = message;

		setTimeout(() => {
			toast = '';
		}, 3000);
	}

	let channelsByHost = $derived.by(() => {
		const groups = new Map<string, JamChannelDetail[]>();

		// TODO: Clean this up. Our songs must be at top
		for (const channel of channelsQuery.data ?? []) {
			const hostChannels = groups.get(channel.hostUserName) ?? [];
			hostChannels.push(channel);

			if (channel.hostUser === auth.user?.userId) {
				// Move the current user's channels to the top of the list
				groups.delete(channel.hostUserName);
				groups.set(channel.hostUserName, hostChannels);
				continue;
			}

			groups.set(channel.hostUserName, hostChannels);
		}

		return Array.from(groups, ([hostUserName, channels]) => ({ hostUserName, channels }));
	});

	// Query for available channels
	const channelsQuery = createQuery(() => ({
		queryKey: ['channel.list.join'],
		queryFn: async () => {
			LogInfo('Fetching channel list...', 'JamJoin');
			const allChannels = await JamChannels.getChannelList();
			LogObject('info', 'JamJoin - Channel List', allChannels);

			return allChannels;
		},
		refetchInterval: 5000,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!auth.user,
	}));

	const mutationJoinChannel = createMutation(() => ({
		mutationFn: async () => {
			return await JamChannels.joinChannel({
				identifier: jamChannelSelected!.identifier,
				code: joinCode
			});
		},

		onSuccess: (data) => {
			if (!data.success) {
				showToast(`Failed to join channel: ${data.errorMessage ?? 'Unknown error'}`);
				return;
			}

			LogInfo(`Channel Joined`, 'JoinJam');
			peerStore.updateState({
				peerChannelDetail: {
					hostUser: jamChannelSelected!.hostUser,
					hostUserName: jamChannelSelected!.hostUserName,
					leaderIdentifier: jamChannelSelected!.leaderIdentifier,
					identifier: jamChannelSelected!.identifier,
					friendlyName: jamChannelSelected!.friendlyName,
					timestamp: jamChannelSelected!.timestamp,
					code: jamChannelSelected!.code,
					status: 'pending'
				},
				peerRole: PeerRole.Player,
				peerMode: PeerOperationMode.Guest
			});
		},
		onError: (err) => {
			LogError(`Failed to join channel: ${err}`, 'JoinJam');
			showToast(`Error trying to join channel: ${err}`);
		}
	}));

	function joinWithCode() {
		if (!jamChannelSelected) {
			showToast('Please select a jam room to join');
			return;
		}

		if (!joinCode.trim()) {
			showToast('Please enter a valid join code');
			return;
		}

		LogInfo(`Joining channel ${jamChannelSelected?.friendlyName} with code: ${joinCode}`);
		
		mutationJoinChannel.mutate();
	}
</script>

<div class="band-join-container">
	<div class="band-header">
		<p class="band-title">Select Jam</p>
	</div>

	<div class="band-content">
		{#if channelsQuery.isLoading}
			<p class="status-text">Loading available jam rooms...</p>
		{:else if channelsQuery.isError}
			<p class="error-text">Error loading jam rooms</p>
		{:else if channelsQuery.data && channelsQuery.data.length === 0}
			<p class="status-text">No jam rooms available</p>
		{:else}
			<div class="channel-groups">
				{#each channelsByHost as group (group.hostUserName)}
					<section class="channel-group">
						<h2 class="host-heading">{group.hostUserName}</h2>
						<ul class="channel-list">
							{#each group.channels as channel (channel.identifier)}
								<li class="channel-item">
									<button 
										class="join-button"
										class:selected={jamChannelSelected?.identifier === channel.identifier}
										onclick={() => jamChannelSelected = channel}
										title={`Join ${channel.friendlyName}`}
									>
										<strong>{channel.friendlyName}</strong>
									</button>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		{/if}

		<div class="code-input-section">
			{#if jamChannelSelected}
				<input
					type="text"
					placeholder={`Enter ${jamChannelSelected?.friendlyName} code `}
					value={joinCode}
					autocapitalize="characters"
					oninput={(event) => {
						const input = event.currentTarget;
						const cursor = input.selectionStart ?? input.value.length;
						const sanitized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
						const sanitizedCursor = input.value.slice(0, cursor).toUpperCase().replace(/[^A-Z0-9]/g, '').length;

						input.value = sanitized;
						input.setSelectionRange(sanitizedCursor, sanitizedCursor);
						joinCode = sanitized;
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') joinWithCode();
					}}
					class="code-input"
				/>
				<button onclick={joinWithCode} class="code-submit">
					Join
				</button>
			{/if}
		</div>
	</div>
</div>

{#if toast}
<div class="toast">
    ⚠ {toast}
</div>
{/if}

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

	.channel-groups {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.channel-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.host-heading {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
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

	.join-button.selected {
		background: #7bc126;
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

	.toast {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);

		background: #333;
		color: white;

		padding: .75rem 1.25rem;

		border-radius: .5rem;

		box-shadow: 0 4px 12px rgba(0,0,0,.35);

		z-index: 1000;
	}
</style>
