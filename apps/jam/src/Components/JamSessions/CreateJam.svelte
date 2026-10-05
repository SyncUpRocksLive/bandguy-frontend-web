<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { auth } from "@shared/ui/stores/Auth.svelte";
	import { peerStore } from "@/Stores/PeerStore.svelte";
	import { JamChannels, type JamChannelDetail } from '@shared/services/syncuprocks/musician/JamChannels';
	import { LogError, LogInfo, LogObject } from '@shared/services/Logger';
	import { onMount } from 'svelte';

	let joinCode = $state('');
	let channelName = $state('');
	let validationError = $state('');
	let toast = $state('');

	// Query for available channels
	const channelsQuery = createQuery(() => ({
		queryKey: ['channel.list'],
		queryFn: async () => {
			// TODO: Refactor this to use same type of response as Api
			LogInfo('Fetching user channel list...', 'JamJoin');
			const channels = await JamChannels.getChannelList();

			return channels
				.filter((k) => k.hostUser === auth.user?.userId)
				.sort((a, b) => a.timestamp - b.timestamp);
		},
		// TODO: Refresh does not seem to happen when a channel is created or deleted and we navigate back to this page. Need to investigate why.
		// These refetch settings are not working as expected. The query is not being refetched when the component is mounted or when the window regains focus.
		refetchInterval: 30000,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		enabled: !!auth.user,
	}));

	function showToast(message: string) {
		toast = message;

		setTimeout(() => {
			toast = '';
		}, 3000);
	}

	const mutation = createMutation(() => ({
		mutationFn: async () => {
			return await JamChannels.createChannel({
				hostUser: auth.user!.userId,
				identifier: channelName,
				friendlyName: channelName,
				timestamp: Date.now(),
				code: joinCode
			});
		},

		onSuccess: (data) => {
			LogInfo(`Channel Created`, 'CreateJam');

			peerStore.updateState({
				peerChannelDetail: {
					hostUser: data!.hostUser,
					identifier: data!.identifier,
					friendlyName: data!.friendlyName,
					timestamp: data!.timestamp,
					code: data!.code,
					status: 'connected'
				}
			});

			validationError = '';

			channelsQuery.refetch();
		},

		onError: (err) => {
			LogError(`Failed to create channel: ${err}`, 'CreateJam');
		}
	}));

	function createChannel() {
		if (mutation.isPending) return;

		validationError = '';

		if (!channelName.trim()) {
			validationError = 'Please enter a Jam Name.';
			showToast(validationError);
			return;
		}

		if (!joinCode.trim()) {
			validationError = 'Please enter an Entry Code.';
			showToast(validationError);
			return;
		}

		mutation.mutate();
	}

	function reconnectChannel(channel: JamChannelDetail) {
		LogInfo(`Reconnecting to channel: ${channel.friendlyName}`, 'CreateJam');

		peerStore.updateState({
			peerChannelDetail: {
				hostUser: channel.hostUser,
				identifier: channel.identifier,
				friendlyName: channel.friendlyName,
				timestamp: channel.timestamp,
				code: channel.code,
				status: 'connected'
			}
		});

		validationError = '';
	}

	async function stopChannel(channel: JamChannelDetail) {
		await JamChannels.deleteChannel(channel.identifier);
		channelsQuery.refetch();
	}

	onMount(() => {
		channelName = auth.user
			? `${auth.user.username}'s Jam`
			: 'My Jam';
	});
</script>

<div class="band-join-container">

	<div class="band-header">
		<p class="band-title">Jam Channel</p>
	</div>

	<div class="band-content">

		<section class="create-section">

			<h3>New Jam</h3>

			<div class="field">
				<label for="jam-name">Name</label>

				<input
					id="jam-name"
					type="text"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
					bind:value={channelName}
					class="code-input"
					placeholder="Saturday Night Jam"
					onkeydown={(e) => e.key === 'Enter' && createChannel()}
				/>
			</div>

			<div class="field">
				<label for="entry-code">Entry Code</label>

				<input
					id="entry-code"
					type="text"
					autocomplete="off"
					autocorrect="off"
					autocapitalize="off"
					spellcheck="false"
					bind:value={joinCode}
					class="code-input"
					placeholder="ROCK2026"
					onkeydown={(e) => e.key === 'Enter' && createChannel()}
				/>
			</div>

			{#if validationError}
				<div class="validation-error">
					⚠ {validationError}
				</div>
			{/if}

			{#if mutation.isError}
				<div class="validation-error">
					⚠ {mutation.error.message}
				</div>
			{/if}

			<button
				class="code-submit"
				onclick={createChannel}
			>
				{#if mutation.isPending}
					<span class="spinner"></span>
				{:else}
					Start Jam
				{/if}
			</button>

		</section>

		<!-- Existing Channels -->

		<section class="channel-section">

			<h3>Resume Existing Jam</h3>

			{#if channelsQuery.isLoading}
				<div class="empty-state">
					Loading...
				</div>
			{:else if channelsQuery.isError}
				<div class="empty-state">
					Failed to load jam channels.
				</div>
			{:else if channelsQuery && channelsQuery.isSuccess && channelsQuery.data.length === 0}
				<div class="empty-state">
					No active jam channels.
				</div>
			{:else}
				{#each channelsQuery.data as channel}

					<div class="channel-card">

						<div class="channel-info">
							<div class="channel-name">
								🎵 {channel.friendlyName}
							</div>

							<div class="channel-code">
								Code: {channel.code}
							</div>
						</div>

						<div class="channel-actions">

							<button
								class="secondary"
								onclick={() => reconnectChannel(channel)}
							>
								Resume
							</button>

							<button
								class="danger"
								onclick={() => stopChannel(channel)}
							>
								End
							</button>

						</div>

					</div>

				{/each}

			{/if}

		</section>

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
	background: rgba(0,0,0,.9);
	color: white;
	overflow: hidden;
}

.band-header {
	background: rgba(255,255,255,.7);
	padding: .6rem;
	text-align: center;
}

.band-title {
	margin: 0;
	font-weight: bold;
	color: black;
}

.band-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 1rem;
	gap: 1rem;
}

/* ---------- Create Section ---------- */

.create-section {
	flex: 0 0 auto;

	display: flex;
	flex-direction: column;
	gap: .75rem;

	padding: 1rem;

	background: rgba(255,255,255,.05);
	border: 1px solid rgba(255,255,255,.08);
	border-radius: .5rem;
}

.field {
	display: flex;
	flex-direction: column;
	gap: .35rem;
}

label {
	font-size: .9rem;
	font-weight: 600;
	color: rgba(255,255,255,.9);
}

.code-input {
	padding: .65rem;
	font-size: 1rem;

	background: rgba(0,0,0,.45);
	color: white;

	border: 1px solid rgba(255,255,255,.25);
	border-radius: .35rem;
}

.code-input::placeholder {
	color: rgba(255,255,255,.45);
}

.code-input:focus {
	outline: none;
	border-color: #3ea6ff;
}

.validation-error {
	padding: .75rem;

	background: rgba(255,80,80,.15);
	border: 1px solid rgba(255,80,80,.4);
	border-radius: .35rem;

	color: #ffb3b3;
}

.code-submit {
	align-self: flex-end;

	min-width: 180px;

	padding: .75rem 1rem;

	border: none;
	border-radius: .35rem;

	background: #28a745;
	color: white;

	cursor: pointer;
}

.code-submit:hover:not(:disabled) {
	background: #218838;
}

.code-submit:disabled {
	opacity: .5;
	cursor: not-allowed;
}

/* ---------- Channel List ---------- */

.channel-section {
	flex: 1;
	min-height: 0;

	display: flex;
	flex-direction: column;
	gap: .75rem;

	overflow-y: auto;

	padding-top: .75rem;
	border-top: 1px solid rgba(255,255,255,.15);
}

.channel-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;

	padding: .85rem;

	background: rgba(255,255,255,.08);
	border: 1px solid rgba(255,255,255,.08);
	border-radius: .5rem;
}

.channel-name {
	font-weight: bold;
	margin-bottom: .2rem;
}

.channel-code {
	font-size: .9rem;
	color: rgba(255,255,255,.7);
}

.channel-actions {
	display: flex;
	gap: .5rem;
	flex-shrink: 0;
}

.secondary,
.danger {
	border: none;
	border-radius: .35rem;
	padding: .55rem .9rem;
	color: white;
	cursor: pointer;
}

.secondary {
	background: #1976d2;
}

.secondary:hover {
	background: #1565c0;
}

.danger {
	background: #c62828;
}

.danger:hover {
	background: #b71c1c;
}

.empty-state {
	padding: 2rem;
	text-align: center;
	color: rgba(255,255,255,.55);
	font-style: italic;
}

/* ---------- Spinner ---------- */

.spinner {
	display: inline-block;
	width: 1rem;
	height: 1rem;

	border: 2px solid rgba(255,255,255,.3);
	border-top-color: white;
	border-radius: 50%;

	animation: spin .8s linear infinite;
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

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* ---------- Mobile ---------- */

@media (max-width: 700px) {

	.channel-card {
		flex-direction: column;
		align-items: stretch;
	}

	.channel-actions {
		width: 100%;
	}

	.channel-actions button {
		flex: 1;
	}

	.code-submit {
		width: 100%;
		align-self: stretch;
	}
}

</style>
