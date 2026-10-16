<script lang="ts">
	import { slide } from 'svelte/transition';
	import { auth } from "@shared/ui/stores/Auth.svelte";
	import { router } from '@/Router.svelte';
	import { syncStore } from '@/Stores/SyncStore.svelte';
	import { peerStore } from "@/Stores/PeerStore.svelte"
	import { PeerOperationMode, PeerRole, SongPlayStatus } from '@/Types/Types';
	import Configuration from './Configuration.svelte';
	import HostModeStatus from './HostModeStatus.svelte';
	import GuestModeStatus from './GuestModeStatus.svelte';
	import UserProfile from './UserProfile.svelte';
	import TopNavBadge from './TopNavBadge.svelte';
	import FullscreenMode from './FullscreenMode.svelte';

	let isMenuOpen = $state(false); // Toggle state

    function closeMenu() {
        isMenuOpen = false;
    }

	// TODO: Handle click out and ESC and timeout close

</script>

{#if auth.user}
	<header>
		<div class="nav-container">
            <!-- Hamburger Toggle -->
            <button class="hamburger" onclick={() => isMenuOpen = !isMenuOpen} aria-label="Toggle Menu">
                <div class="bar" class:open={isMenuOpen}></div>
                <div class="bar" class:open={isMenuOpen}></div>
                <div class="bar" class:open={isMenuOpen}></div>
            </button>

			{#if $syncStore.songPlayStatus !== SongPlayStatus.Stop}
				<TopNavBadge />
			{/if}

			<!-- Right Side Actions (Status/Profile always visible) -->
            <div class="actions">
				{#if $peerStore.peerChannelDetail}
					{#if $peerStore.peerRole === PeerRole.Leader}
						<HostModeStatus />
					{:else}
						<GuestModeStatus />
					{/if}
				{/if}

                <Configuration />
                
				<FullscreenMode />
            </div>
		</div>

		<!-- Mobile/Popup Menu Drawer -->
        {#if isMenuOpen}
            <nav class="mobile-menu" transition:slide={{ duration: 250 }}>
				<div style="border-bottom: 1px solid #333; padding: 10px 20px; color: #f0f0f0;">
					<UserProfile />
				</div>
                
                <a href="#/" onclick={(e) => { 
					router.linkTo('Home').onclick(e); 
					closeMenu(); 
				}}>JAM ROOM</a>

				<a href="/mixingroom" onclick={closeMenu}>MIXING ROOM</a>

				<!-- TODO: this will not work if page is reloaded on current page. Need to check current route -->
				{#if $peerStore.peerMode !== PeerOperationMode.None}
					<a href="#/" onclick={(e) => { 
						router.back();
						closeMenu(); 
					}}>&lt; BACK</a>
				{/if}
            </nav>
        {/if}
	</header>
{/if}

<style>
    header {
        position: relative;
        background: rgba(40, 40, 40, 0.95);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1000;
		padding: 0px 0;
    }

    .nav-container {
        padding: 8px 15px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between; /* Space out hamburger, badge, and profile */
		padding: 0 10px;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* Hamburger Styles */
    .hamburger {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 5px;
    }

    .bar {
        width: 20px;
        height: 2px;
        background-color: white;
        transition: all 0.3s ease;
    }

    /* Simple Hamburger to 'X' animation */
    .bar.open:nth-child(1) { transform: translateY(6px) rotate(45deg); }
    .bar.open:nth-child(2) { opacity: 0; }
    .bar.open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

    /* The Drawer */
    .mobile-menu {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: #222;
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #444;
    }

    .mobile-menu a {
        padding: 15px 20px;
        border-bottom: 1px solid #333;
        color: white;
        text-decoration: none;
    }

    .mobile-menu a:hover {
        background: #333;
    }
</style>
