<script lang="ts">
	import { router } from "@/Router.svelte";
</script>

<header id="header">
	<!-- TODO: Change this to navigation for mixing room - to update sstate -->
	<nav>
		<a href="/">Home</a>
		<a {...router.linkTo("Home")} href="/mixingroom">Mixing Room</a>
		<a href="/jam">Jam</a>
	</nav>

	<!-- TODO - Add a user profile section here with login/logout and settings -->
</header>

<style>
	header {
		grid-area: header;
	}
</style>
