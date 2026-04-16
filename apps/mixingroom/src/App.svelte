<script lang="ts">
	// Main mixing room components will be added here
	import Header from "./lib/Header.svelte";
	import { appState } from "./State.svelte";
	import { auth } from "./Auth.svelte";
	import Login from "./lib/areas/components/login/Login.svelte";
	import { router } from "./Router.svelte";
</script>

<Header />

{#if auth.isAuthenticated}
	{#await import(`./lib/areas/${router.route.area}.svelte`)}
		<!-- only show loading spinner if taking > 4 secs... -->
	{:then module}
		<svelte:component this={module.default} params={router.route.params} />
	{:catch}
		<p>Could not load view {router.route.area}</p>
		<button onclick={() => router.navigate("Home")}>Go Home</button>
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
