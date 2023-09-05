<script lang="ts">
	import { T, useFrame } from "@threlte/core";
	import { useGltf } from "@threlte/extras";
	import * as THREE from "three";

	export let zoom: number;
	let rotation = 0;
	let model: THREE.Object3D | undefined;

	let started = false;

	let smoothDelta = 0;
	useFrame((_, delta) => {
		if (!started || 1 / delta < 1 || !model) {
			return;
		}
		smoothDelta = smoothDelta * 0.9 + delta * 0.1;
		model.setRotationFromEuler(
			new THREE.Euler(Math.PI / 2, 0, (rotation += 0.002 * (144 / (1 / smoothDelta)))),
		);
	});

	const gltf = useGltf("/logo_3d/logo_3d.gltf", {
		useDraco: true,
	});

	export let onGltfLoadedCallback: () => void;
	$: if ($gltf) {
		onGltfLoadedCallback();

		setTimeout(() => {
			started = true;
		}, 3000);
	}
</script>

<T.OrthographicCamera makeDefault position={[0, 0, 100]} {zoom} />

{#if $gltf && $gltf.nodes["Scene"] != undefined}
	<T
		castShadow
		receiveShadow
		rotation={[Math.PI / 2, 0, 0]}
		is={$gltf.nodes["Scene"]}
		bind:ref={model}
	/>
{/if}

<T.DirectionalLight castShadow position={[0, 100, 10]} intensity={2} />
<T.DirectionalLight castShadow position={[10, 100, 0]} intensity={2} />
<T.DirectionalLight castShadow position={[0, 100, -10]} intensity={2} />
<T.DirectionalLight castShadow position={[-10, 100, 0]} intensity={2} />
<T.AmbientLight intensity={2} />
