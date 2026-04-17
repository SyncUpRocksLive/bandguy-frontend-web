<script lang="ts">
	import { setContext } from 'svelte';
	import { QueryClient } from '@tanstack/svelte-query';
	import { auth } from "./Auth.svelte";
	import { router } from "./Router.svelte";
	import { appState } from "./State.svelte";
	import Login from "./components/Login.svelte";
	import Home from "./components/Home.svelte";
	import SetList from "./components/SetList.svelte";
	import SetView from "./components/SetView.svelte";
	import Guest from "./components/Guest.svelte";
	import { queryClient } from './queryClient';

	// Set up TanStack Query
	setContext(QueryClient, queryClient);
</script>

{#if auth.isAuthenticated}
	{#if router.route.area === 'Home'}
		<Home />
	{:else if router.route.area === 'HostSets'}
		<SetList mode="host" />
	{:else if router.route.area === 'HostSetView'}
		<SetView mode="host" setId={router.route.params[0]} />
	{:else if router.route.area === 'SoloSets'}
		<SetList mode="solo" />
	{:else if router.route.area === 'SoloSetView'}
		<SetView mode="solo" setId={router.route.params[0]} />
	{:else if router.route.area === 'Guest'}
		<Guest />
	{:else}
		<p>Unknown route: {router.route.area}</p>
		<button onclick={() => router.navigate("Home")}>Go Home</button>
	{/if}
{:else}
	<Login />
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
