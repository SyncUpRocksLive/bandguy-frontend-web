<script lang="ts">
	import { auth } from '../Auth.svelte';
	import { appState } from '../State.svelte';
	import { router } from '../Router.svelte';
	import { PeerOperationMode } from '../Types/Types';
	import Configuration from './Configuration.svelte';
	import HostModeStatus from './HostModeStatus.svelte';
	import GuestModeStatus from './GuestModeStatus.svelte';
	import UserProfile from './UserProfile.svelte';
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
				<HostModeStatus />
				<GuestModeStatus />
				<Configuration />
				<UserProfile />
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
</style>
