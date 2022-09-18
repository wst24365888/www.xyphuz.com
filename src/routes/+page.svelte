<script lang="ts">
	import Marquee from "svelte-fast-marquee";
	import { Canvas } from '@threlte/core'
	import Logo3D from "$lib/logo_3d/Logo3D.svelte";

	let w: number;
	let h: number;

	$: zoom = Math.min(w, h) / 5;
</script>

<svelte:head>
	<title>Official Website - Xyphuz</title>
	<meta name="description" content="This is the official website of Xyphuz." />
</svelte:head>

<section bind:clientWidth={w} bind:clientHeight={h}>
	<div id="background-text-container">
		<p id="background-text">
			<Marquee speed={10}>
				Official Website - Xyphuz
				<div id="divider"></div>
			</Marquee>
		</p>
	</div>

	<div id="canvas">
		<Canvas>
			<Logo3D zoom={zoom} />
		</Canvas>
	</div>
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
	}

	#background-text-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 0 5em 0;
		padding: 0;
		width: 100%;
		height: 100%;
		z-index: -2;
	}

	#background-text {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16em;
		height: 100%;
		font-weight: 900;
		color: #eee;
		white-space: nowrap;
		width: 100vw;
		margin: 0;
		padding: 0;
		height: 100%;
	}

	#divider {
		width: 5vw;
	}

	#canvas {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		width: 100%;
		height: calc(100% - 5em);
		z-index: -1;
	}
</style>
