<script lang="ts">
	import {
		AmbientLight,
		DirectionalLight,
		Group,
		OrthographicCamera,
		useFrame,
	} from "@threlte/core";
	import { GLTF, useCursor } from "@threlte/extras";

	export let zoom: number;
	let rotation = 0;

	let started = false;
	setTimeout(() => {
		started = true;
	}, 3000);

	let smoothDelta = 0;
	useFrame((_, delta) => {
		if (!started) {
			return;
		}

		smoothDelta = smoothDelta * 0.9 + delta * 0.1;

		rotation += 0.002 * (144 / (1/smoothDelta));
	});

	const { onPointerEnter, onPointerLeave } = useCursor();

	let scale = 1;
	const onPointerEnterHandler = () => {
		scale = 1.25;
		onPointerEnter();
	};

	const onPointerLeaveHandler = () => {
		scale = 1;
		onPointerLeave();
	};

	function debounce(func: Function, wait: number) {
		let timeout: NodeJS.Timeout;
		return function executedFunction(...args: any[]) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}
</script>

<Group rotation={{ y: rotation }}>
	<OrthographicCamera position={{ z: 100, y: 0 }} lookAt={{ y: 0 }} {zoom} />
</Group>

<GLTF
	castShadow
	receiveShadow
	url={"/logo_3d/github_3d.gltf"}
	interactive
	on:pointerenter={debounce(onPointerEnterHandler, 100)}
	on:pointerleave={debounce(onPointerLeaveHandler, 100)}
	on:click={() => window.open("https://github.com/wst24365888", "_blank")}
	rotation={{ x: Math.PI / 2 }}
	scale={{ x: scale, y: scale, z: scale }}
	useDraco
/>

<DirectionalLight shadow position={{ x: 0, y: 100, z: 10 }} intensity={2} />
<DirectionalLight shadow position={{ x: 10, y: 100, z: 0 }} intensity={2} />
<DirectionalLight shadow position={{ x: 0, y: 100, z: -10 }} intensity={2} />
<DirectionalLight shadow position={{ x: -10, y: 100, z: 0 }} intensity={2} />
<AmbientLight intensity={0.5} />
