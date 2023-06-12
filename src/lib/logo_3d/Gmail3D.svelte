<script lang="ts">
	import { T, useFrame } from "@threlte/core";
	import { useGltf, interactivity } from "@threlte/extras";
	import * as THREE from "three";
	import { tweened } from "svelte/motion";
	import { quintOut } from "svelte/easing";

	interactivity();

	export let zoom: number;
	let rotation = 0;
	let model: THREE.Object3D | undefined;

	let started = false;

	useFrame(() => {
		if (!started || !model) {
			return;
		}

		model.setRotationFromEuler(new THREE.Euler(Math.PI / 2, 0, (rotation += 0.002)));
	});

	const scale = tweened(1, {
		duration: 500,
		easing: quintOut,
	});

	function debounce(func: () => void, wait: number) {
		let timeout: ReturnType<typeof setTimeout>;
		return function executedFunction() {
			const later = () => {
				clearTimeout(timeout);
				func();
			};

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	const gltf = useGltf("/logo_3d/gmail_3d.gltf", {
		useDraco: true,
	});

	$: if ($gltf) {
		setTimeout(() => {
			started = true;
		}, 3000);
	}
</script>

<T.OrthographicCamera position={[0, 0, 100]} {zoom} />

{#if $gltf}
	<T
		castShadow
		receiveShadow
		is={$gltf.nodes["Scene"]}
		on:pointerenter={debounce(() => {
			scale.set(1.25);
		}, 100)}
		on:pointerleave={debounce(() => {
			scale.set(1);
		}, 100)}
		on:click={() => window.open("mailto:xyphuzu@gmail.com", "_blank")}
		rotation={[Math.PI / 2, 0, 0]}
		scale={[$scale, $scale, $scale]}
		bind:ref={model}
	/>
{/if}

<T.DirectionalLight castShadow position={[0, 100, 10]} intensity={1} />
<T.DirectionalLight castShadow position={[10, 100, 0]} intensity={1} />
<T.DirectionalLight castShadow position={[0, 100, -10]} intensity={1} />
<T.DirectionalLight castShadow position={[-10, 100, 0]} intensity={1} />
<T.AmbientLight intensity={0.75} />
