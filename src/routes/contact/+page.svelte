<script lang="ts">
	import Marquee from "svelte-fast-marquee";
	import { Canvas } from "@threlte/core";
	import GitHub3D from "$lib/logo_3d/GitHub3D.svelte";
	import Gmail3D from "$lib/logo_3d/Gmail3D.svelte";

	let w: number;
    let h: number;

    $: landscape = w > h;
	$: zoom = landscape ? w / 15 : w / 6;
	$: speed = w / 384 + 5;
</script>

<svelte:head>
	<title>Contact - Xyphuz</title>
</svelte:head>

<section bind:clientWidth={w} bind:clientHeight={h}>
	<div id="backgruond" />

	<div id="backgruond-marquee-container">
		<div id="backgruond-marquee">
			<Marquee {speed}>
				Contact Xyphuz
				<div id="divider" />
			</Marquee>
		</div>
	</div>

	<div id="info-container">
		<div class="wrapper">
			<p id="name" data-text="Contact">Contact</p>
		</div>
		<div class="wrapper">
			<p id="description" data-text="Xyphuz">Xyphuz</p>
		</div>
	</div>

	<div id="canvas-container">
		<div id="canvas-github">
			<Canvas>
				<GitHub3D {zoom} />
			</Canvas>
		</div>
		<div id="canvas-gmail">
			<Canvas>
				<Gmail3D {zoom} />
			</Canvas>
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
		position: relative;
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
		opacity: 0;
		animation: backgruond-scrolling 10s linear infinite, fade-in 1s ease-in-out 0.5s forwards;
	}

	#backgruond-marquee-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0;
		width: 100%;
		height: calc(100% - 5em);
		z-index: -2;
        margin-bottom: 2em;
	}

	#backgruond-marquee {
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
		opacity: 0;
		animation: fade-in 2s ease-in-out 1s forwards;
	}

	#divider {
		width: 5vw;
	}

	#canvas-container {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		padding: 0;
		width: 100vw;
		height: calc(100% - 5em);
		opacity: 0;
		animation: fade-in 1s ease-in-out 2s forwards;
		overflow-x: visible;
	}

	#canvas-github {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin: 0;
		padding: 0;
		height: calc(100% - 5em);
	}

	#canvas-gmail {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0;
		padding: 0;
		height: calc(100% - 5em);
	}

	#info-container {
		position: relative;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		margin: 0;
		width: 100%;
		height: 100%;
        z-index: -1;
	}

	.wrapper {
		position: relative;
		width: 100%;
	}

	@keyframes backgruond-scrolling {
		100% {
			background-position: 50px 50px;
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
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

		#canvas-github {
            width: 25%;
		}

		#canvas-gmail {
            width: 25%;
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

        #canvas-github {
            width: 50%;
        }

        #canvas-gmail {
            width: 50%;
        }
	}
</style>
