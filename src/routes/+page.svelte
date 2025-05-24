<script lang="ts">
	import PaperSVG from "$lib/images/paper.svg.svelte";
	import RockSVG from "$lib/images/rock.svg.svelte";
	import ScissorsSVG from "$lib/images/scissors.svg.svelte";

	import {
		subscribeToGameStateUpdateNotifications,
		pushGameStateUpdateNotification,
		playMove,
	} from "$lib/supabaseClient";

	async function callback(payload) {
		console.log(payload.payload);
		console.log(payload.payload.gameState);
	}

	subscribeToGameStateUpdateNotifications(1, 1, callback);

	//pushGameStateUpdateNotification(1, 1);
	//let { data } = $props();
	//let foo = $state("egg");
</script>

<svelte:head>
	<title>Rock Paper Scissors MMO</title>
	<meta name="description" content="Online Ranked Rock Paper Scissors Game" />
</svelte:head>

<!-- <section> -->
<!-- 	<div>Hello, world!</div> -->
<!-- 	<div>data.foo = {foo}</div> -->
<!-- 	<button onclick={addFoo}>add Foo</button> -->
<!-- 	<ul> -->
<!-- 		<li>test list element</li> -->
<!---->
<!-- 		{#each data.words as word} -->
<!-- 			<li>{word}</li> -->
<!-- 		{/each} -->
<!-- 	</ul> -->
<!-- </section> -->
<!---->
<!-- <div class="d-grid"> -->
<!-- 	<div class="row"> -->
<!-- 		<div class="col-6 border">asdf</div> -->
<!-- 		<div class="col-6 border">asdf</div> -->
<!-- 	</div> -->
<!-- </div> -->

<div
	class="d-flex justify-content-center align-items-center gap-2 border p-1 m-1"
>
	<button
		type="button"
		class="btn btn-outline-danger border border-5 rounded-circle p-3"
		aria-label="play paper"
	>
		<PaperSVG /></button
	>
	<button
		type="button"
		class="btn btn-outline-primary border border-5 rounded-circle p-3"
		aria-label="play rock"><RockSVG /></button
	>
	<button
		type="button"
		class="btn btn-outline-warning border border-5 rounded-circle p-3"
		aria-label="play scissors"><ScissorsSVG /></button
	>
</div>
