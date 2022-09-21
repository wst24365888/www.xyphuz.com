<script lang="ts">
	import { goto } from "$app/navigation";
	import type { AboutPreview } from "src/models/about_preview";

	export let about: AboutPreview;

	function onAboutClick() {
		goto(about.url);
	}
</script>

<div class="about-card" on:click={onAboutClick}>
	<h2>{about.attributes.title}</h2>
	<div class="card-info">
		<p>{about.attributes.description}</p>
		<p>{about.attributes.dateString ?? ""}</p>
	</div>
</div>

<style>
	.about-card {
		padding: 0.75em 1.5em;
		border: 1px solid #ccc;
		transition: 0.5s;
	}

	.about-card:hover {
		border: 1px solid #000;
		cursor: pointer;
	}

	.card-info {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	h2 {
		margin-top: 0.75em 0;
	}

	p {
		font-weight: 300;
		color: #666;
	}
</style>
