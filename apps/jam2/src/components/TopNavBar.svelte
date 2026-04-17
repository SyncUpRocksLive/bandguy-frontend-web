<script lang="ts">
	import { auth } from '../Auth.svelte';
	import { appState } from '../State.svelte';
	import { router } from '../Router.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import Configuration from './Configuration.svelte';
</script>

{#if auth.user}
	<header>
		<div style="padding: 3px 10px 0 10px; width: 100%; display: flex; flex-direction: row; color: white; background: rgba(155,155,155,.1); justify-content: center; align-items: center;">
			<a href="/">HOME</a> -
			<a href="#/" onclick={router.linkTo('Home').onclick}>JAM</a> -
			<a href="/mixingroom">MIXING ROOM</a>

			<div style="user-select: none;">
				- {appState.store.peerMode}
			</div>

			<div style="flex: auto; display: flex; flex-direction: row; column-gap: 0; justify-content: right; align-items: right;">
				{#if appState.store.peerMode === PeerOperationMode.Host}
					<!-- HostModeStatus placeholder -->
					<span>Host</span>
				{/if}
				{#if appState.store.peerMode === PeerOperationMode.Guest}
					<!-- GuestModeStatus placeholder -->
					<span>Guest</span>
				{/if}
				<!-- Configuration placeholder -->
				<Configuration />
				<!-- UserProfile placeholder -->
				<span>{auth.user.displayName}</span>
			</div>
		</div>
	</header>
{:else}
	<header></header>
{/if}

<style>
	a {
		color: white;
		text-decoration: none;
		margin: 0 5px;
	}

	a:hover {
		text-decoration: underline;
	}

	button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		margin: 0 5px;
	}

	button:hover {
		text-decoration: underline;
	}
</style>
