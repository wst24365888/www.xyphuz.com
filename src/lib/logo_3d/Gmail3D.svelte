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
		if (!started || 1 / delta < 1) {
			return;
		}

		smoothDelta = smoothDelta * 0.9 + delta * 0.1;

		rotation += 0.002 * (144 / (1 / smoothDelta));
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

	function debounce(func: () => void, wait: number) {
		let timeout: NodeJS.Timeout;
		return function executedFunction() {
			const later = () => {
				clearTimeout(timeout);
				func();
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
	url={"/logo_3d/gmail_3d.gltf"}
	interactive
	on:pointerenter={debounce(onPointerEnterHandler, 100)}
	on:pointerleave={debounce(onPointerLeaveHandler, 100)}
	on:click={() => window.open("mailto:xyphuzu@gmail.com", "_blank")}
	rotation={{ x: Math.PI / 2 }}
	scale={{ x: scale, y: scale, z: scale }}
	useDraco
/>

<DirectionalLight shadow position={{ x: 0, y: 100, z: 10 }} intensity={1} />
<DirectionalLight shadow position={{ x: 10, y: 100, z: 0 }} intensity={1} />
<DirectionalLight shadow position={{ x: 0, y: 100, z: -10 }} intensity={1} />
<DirectionalLight shadow position={{ x: -10, y: 100, z: 0 }} intensity={1} />
<AmbientLight intensity={0.75} />
