<script lang="ts">
	import Marquee from "svelte-fast-marquee";
</script>

<svelte:head>
	<title>Official Website - Xyphuz</title>
	<meta name="description" content="This is the official website of Xyphuz." />
</svelte:head>

<section>
	<div id="background-text-container">
		<p id="background-text">
			<Marquee speed={10}>
				Official Website - Xyphuz
				<div id="divider"></div>
			</Marquee>
		</p>
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

	#background-text-container {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0 0 5em 0;
		padding: 0;
		width: 100%;
		height: 100%;
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
</style>
