<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import logo from "./logo.svg";

	export let landscape = true;
	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	let expandMenu = false;
	function toggleMenu() {
		expandMenu = !expandMenu;
	}
</script>

<header>
	<div class="corner" data-sveltekit-preload-data>
		<a href="/">
			<img src={logo} alt="logo" />
		</a>
	</div>

	{#if mounted && landscape}
		<nav>
			<ul>
				<li class:active={$page.url.pathname === "/"} data-sveltekit-preload-data>
					<a href="/">Home</a>
				</li>
				<li class:active={$page.url.pathname === "/about"} data-sveltekit-preload-data>
					<a href="/about">About</a>
				</li>
				<li class:active={$page.url.pathname === "/projects"} data-sveltekit-preload-data>
					<a href="/projects">Projects</a>
				</li>
				<li class:active={$page.url.pathname === "/blog"} data-sveltekit-preload-data>
					<a href="/blog">Blog</a>
				</li>
				<li class:active={$page.url.pathname === "/contact"} data-sveltekit-preload-data>
					<a href="/contact">Contact</a>
				</li>
			</ul>
		</nav>
	{/if}

	<div class="corner">
		{#if mounted && !landscape}
			<div id="menu-icon" on:click={toggleMenu} on:keypress={toggleMenu}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					x="0px"
					y="0px"
					width="50"
					height="50"
					viewBox="0 0 50 50"
					style=" fill:#000000;"
					><path
						d="M 3 8 A 2.0002 2.0002 0 1 0 3 12 L 47 12 A 2.0002 2.0002 0 1 0 47 8 L 3 8 z M 3 23 A 2.0002 2.0002 0 1 0 3 27 L 47 27 A 2.0002 2.0002 0 1 0 47 23 L 3 23 z M 3 38 A 2.0002 2.0002 0 1 0 3 42 L 47 42 A 2.0002 2.0002 0 1 0 47 38 L 3 38 z"
					/></svg
				>
			</div>
			{#if expandMenu}
				<div id="menu-container">
					<div id="menu">
						<a href="/" on:click={toggleMenu} data-sveltekit-preload-data>Home</a>
						<a href="/about" on:click={toggleMenu} data-sveltekit-preload-data>About</a>
						<a href="/projects" on:click={toggleMenu} data-sveltekit-preload-data>Projects</a>
						<a href="/blog" on:click={toggleMenu} data-sveltekit-preload-data>Blog</a>
						<a href="/contact" on:click={toggleMenu} data-sveltekit-preload-data>Contact</a>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</header>

<style>
	#menu-container {
		position: absolute;
		left: 0;
		top: 5em;
		height: calc(100vh - 5em);
		width: 100vw;
		padding: 2em;
		background-color: rgba(0, 0, 0, 0.5);
	}

	#menu {
		position: absolute;
		left: 0;
		top: 0;
		width: 100vw;
		padding: 2em;
		z-index: 10;
		background-color: white;
	}

	#menu > a {
		display: block;
		padding: 1em;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.7);
		opacity: 0;
		animation: fade-in 0.25s ease-in-out 0.25s forwards;
	}

	header {
		display: flex;
		justify-content: space-between;
		background-color: white;
	}

	.corner {
		width: 5em;
		height: 5em;
	}

	.corner > a,
	#menu-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		opacity: 0;
		animation: fade-in 0.5s ease-in-out 0.5s forwards;
		cursor: pointer;
	}

	.corner img,
	svg {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		opacity: 0;
		animation: fade-in 0.5s ease-in-out 0.5s forwards;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 5em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: "";
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: rgba(0, 0, 0, 0.7);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
