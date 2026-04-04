<script lang="ts">
  import Upload from "./lib/Upload.svelte";
</script>

<header id="header">
  <nav>
    <a href="/">Home</a>
    <a href="/mixingroom">Mixing Room</a>
    <a href="/jam">Jam</a>
  </nav>
</header>

<section id="center">
  <div>
    <h3>Coming Soon - Music Mixing Room</h3>
    <p>Synchronized multi-track editing and mixing for your collaborations</p>
    <Upload />
  </div>
</section>

<footer id="spacer"></footer>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }

  header {
    grid-area: header;
  }

  section {
    grid-area: center;
  }

  footer {
    grid-area: spacer;
  }
</style>
