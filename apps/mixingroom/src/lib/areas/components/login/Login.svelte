<script lang="ts">
	import { auth } from "@/Auth.svelte";

	const returnUrl = window.location.pathname + window.location.search + window.location.hash;

</script>

<section id="center">
	<div class="login-container">
		<h2>Welcome to the Mixing Room</h2>
		<p>Please log in to access your music library, setlists, and more.</p>
		<button class="login-btn" on:click={() => auth.login(returnUrl)}>Log In</button>
	</div>
</section>
