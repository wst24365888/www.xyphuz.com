<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ProjectPreview } from 'src/models/project_preview';

	export let project: ProjectPreview;

	function onProjectClick() {
		goto(project.url);
	}
</script>

<div class="project-card" on:click="{onProjectClick}">
	<h2>{project.attributes.title}</h2>
	<div class="card-info">
        <p>{project.attributes.description}</p>
		<p>{project.attributes.dateString ?? ""}</p>
	</div>
</div>

<style>
	.project-card {
		padding: 0.75em 1.5em;
		border: 1px solid #ccc;
    	transition: 0.5s;
	}

	.project-card:hover {
		border: 1px solid #000;
		cursor: pointer;
	}

	.card-info {
		display: flex;
		justify-content: space-between;
	}

	h2 {
		margin-top: 0.75em 0;
	}

	p {
		font-weight: 300;
		color: #666;
	}
</style>