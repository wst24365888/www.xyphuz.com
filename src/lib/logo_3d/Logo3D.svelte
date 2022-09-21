<script lang="ts">
	import {
		AmbientLight,
		DirectionalLight,
		Group,
		Object3DInstance,
		OrthographicCamera,
		useFrame,
	} from "@threlte/core";
	import { useGltf } from "@threlte/extras";

	export let zoom: number;
	let rotation = 0;

	let started = false;

	let smoothDelta = 0;
	useFrame((_, delta) => {
		if (!started || 1 / delta < 1) {
			return;
		}

		smoothDelta = smoothDelta * 0.9 + delta * 0.1;

		rotation += 0.002 * (144 / (1 / smoothDelta));
	});

	const { gltf } = useGltf("/logo_3d/logo_3d.gltf", {
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

<Group rotation={{ y: rotation }}>
	<OrthographicCamera position={{ z: 100, y: 0 }} lookAt={{ y: 0 }} {zoom} />
</Group>

{#if $gltf && $gltf.nodes["Scene"] != undefined}
	<Object3DInstance
		castShadow
		receiveShadow
		rotation={{ x: Math.PI / 2 }}
		object={$gltf.nodes["Scene"]}
	/>
{/if}

<DirectionalLight shadow position={{ x: 0, y: 10, z: 10 }} intensity={2} />
<DirectionalLight shadow position={{ x: 10, y: 10, z: 0 }} intensity={2} />
<DirectionalLight shadow position={{ x: 0, y: 10, z: -10 }} intensity={2} />
<DirectionalLight shadow position={{ x: -10, y: 10, z: 0 }} intensity={2} />
<AmbientLight intensity={0.5} />
