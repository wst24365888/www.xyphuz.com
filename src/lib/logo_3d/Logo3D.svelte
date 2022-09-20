<script lang="ts">
	import {
		AmbientLight,
		DirectionalLight,
		Group,
		OrthographicCamera,
		useFrame,
	} from "@threlte/core";
	import { GLTF } from "@threlte/extras";

	export let zoom: number;
	let rotation = 0;

	let started = false;
	setTimeout(() => {
		started = true;
	}, 3000);

	let smoothDelta = 0;
	useFrame((_, delta) => {
		if (!started || 1/delta < 1) {
			return;
		}

		smoothDelta = smoothDelta * 0.9 + delta * 0.1;

		rotation += 0.002 * (144 / (1/smoothDelta));
	});
</script>

<Group rotation={{ y: rotation }}>
	<OrthographicCamera position={{ z: 100, y: 0 }} lookAt={{ y: 0 }} zoom={zoom} />
</Group>

<GLTF 
	castShadow 
	receiveShadow 
	url={"/logo_3d/logo_3d.gltf"} 
	interactive 
	rotation={{ x: Math.PI / 2 }}
	useDraco
/>

<DirectionalLight shadow position={{ x: 0, y: 10, z: 10 }} intensity={2} />
<DirectionalLight shadow position={{ x: 10, y: 10, z: 0 }} intensity={2} />
<DirectionalLight shadow position={{ x: 0, y: 10, z: -10 }} intensity={2} />
<DirectionalLight shadow position={{ x: -10, y: 10, z: 0 }} intensity={2} />
<AmbientLight intensity={0.5} />
