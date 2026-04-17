<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { appState } from '../../State.svelte';
	import { PeerOperationMode } from '../../Types/Types';
	import { broadcastMessage } from '../../Support/MessageBus';
	import { Messages } from '@shared/services/syncuprocks/musician/MessageQueue';
	import { LogError, LogInfo } from '@shared/services/Logger';
	import { MessageBusActionType } from '../../Types/MessageBus';

	let lastMessageTime = $state(null);

	// MessageChannelService - polls for messages
	const query = createQuery({
		queryKey: ['my.messages'],
		queryFn: async () => {
			if (!appState.store.user || appState.store.peerMode === PeerOperationMode.Solo) {
				LogError('MessageChannelService: No user or invalid peer mode');
				return [];
			}

			const response = await Messages.getMessages();
			if (response.length > 0) {
				LogInfo(`MessageChannelService: Rx'd ${response.length} new messages`);
				broadcastMessage({
					data: {
						type: MessageBusActionType.MESSAGE,
						message: response
					}
				});
			}
			lastMessageTime = new Date().toLocaleTimeString();
			return response;
		},
		refetchInterval: 1000,
		staleTime: 0,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		enabled: !!appState.store.user && appState.store.peerMode !== PeerOperationMode.Solo,
	});
</script>

{#if appState.store.peerMode !== PeerOperationMode.Solo}
	<div class="message-channel-service">
		<h4>Message Channel Service</h4>
		<p>Status: {query.isFetching ? 'Polling...' : 'Idle'}</p>
		<p>Last poll: {lastMessageTime || 'Never'}</p>
		<p>Messages: {query.data?.length || 0}</p>
		<!-- TODO: Process messages and send to MessageBus -->
	</div>
{/if}

<style>
	.message-channel-service {
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
</style>
