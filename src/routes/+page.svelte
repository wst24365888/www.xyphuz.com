<script lang="ts">
	import Marquee from "svelte-fast-marquee";
	import { Canvas } from "@threlte/core";
	import Logo3D from "$lib/logo_3d/Logo3D.svelte";

	let w: number;
	let h: number;

	$: zoom = Math.min(w, h) / 5;
	$: speed = w / 192;
</script>

<svelte:head>
	<title>Official Website - Xyphuz</title>
	<meta name="description" content="This is the official website of Xyphuz." />
</svelte:head>

<section bind:clientWidth={w} bind:clientHeight={h}>
	<div id="backgruond" />

	<div id="background-text-container">
		<p id="background-text">
			<Marquee speed={speed}>
				Official Website - Xyphuz
				<div id="divider" />
			</Marquee>
		</p>
	</div>

	<div id="canvas">
		<Canvas>
			<Logo3D {zoom} />
		</Canvas>
	</div>

	<div id="info-container">
		<div class="wrapper">
			<p id="name" data-text="Xyphuz's">Xyphuz's</p>
		</div>
		<div class="wrapper">
			<p id="description" data-text="Official Website">Official Website</p>
		</div>
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

	#backgruond {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		width: 100%;
		height: 100%;
		z-index: -3;
		background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC)
			repeat 0 0;
		animation: backgruond-scrolling 5s linear infinite;
	}

	@keyframes backgruond-scrolling {
		100% {
			background-position: 50px 50px;
		}
	}

	#background-text-container {
		position: absolute;
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
		width: 100vw;
		height: calc(100% - 5em);
		z-index: -1;
	}

	#info-container {
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 0;
		height: calc(100% - 5em);
		height: 100%;
	}

	.wrapper {
		position: relative;
		width: 100%;
	}

	@media (orientation: landscape) {
		#info-container {
			padding: 4em;
			justify-content: flex-end;
		}

		#name {
			font-size: 6em;
			font-weight: 900;
			color: #222;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #fff;
		}

		#name::after {
			content: attr(data-text);
			color: #222;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #fff;
		}

		#description {
			font-size: 6em;
			font-weight: 900;
			color: white;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #222;
		}

		#description::after {
			content: attr(data-text);
			color: white;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #222;
		}
	}

	@media (orientation: portrait) {
		#info-container {
			padding: 2em;
			justify-content: space-between;
			width: 100%;
			box-sizing: border-box;
		}

		#name {
			font-size: 4em;
			font-weight: 900;
			color: #222;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #fff;
		}

		#name::after {
			content: attr(data-text);
			color: #222;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #fff;
		}

		#description {
			font-size: 4em;
			font-weight: 900;
			color: white;
			margin: 0;
			padding: 0;
			line-height: 1.25;
			-webkit-text-stroke: 2px #222;
			width: 100%;
			text-align: right;
		}

		#description::after {
			content: attr(data-text);
			color: white;
			position: absolute;
			top: 0px;
			left: 0px;
			-webkit-text-stroke: 0px #222;
			width: 100%;
			text-align: right;
		}
	}
</style>
