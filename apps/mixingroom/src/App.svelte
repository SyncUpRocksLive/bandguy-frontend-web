<script lang="ts">
	// Main mixing room components will be added here
	import Header from "./lib/Header.svelte";
	import { appState } from "./State.svelte";
	import { auth } from "./Auth.svelte";
	import Login from "./lib/areas/components/login/Login.svelte";
</script>

<Header />

{#if auth.isAuthenticated}
	{#await import(`./lib/areas/${appState.ui.area}.svelte`)}
		<p>Loading...</p>
	{:then module}
		<svelte:component this={module.default} />
	{:catch}
		<p>Could not load view {appState.ui.area}</p>
		<button onclick={() => appState.setView("Home")}>Go Home</button>
	{/await}
{:else}
	<Login />
{/if}

<footer id="spacer"></footer>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	footer {
		grid-area: spacer;
	}
</style>
