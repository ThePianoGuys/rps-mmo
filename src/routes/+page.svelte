<script lang="ts">
	import RPSSVG from "$lib/images/rps.svg.svelte";

	import {
		subscribeToGameStateUpdateNotifications,
		pushGameStateUpdateNotification,
		playMove,
	} from "$lib/supabaseClient";
	import type { GameState } from "$lib/supabaseClient";

	function listenToGameState(gameState: GameState) {
		console.log("hello from svelte listenToGameState");
		console.log(gameState);
	}

	function testButton() {
		console.log("testButton");
		pushGameStateUpdateNotification(1, 1);
	}

	subscribeToGameStateUpdateNotifications(1, 1, listenToGameState);

	//pushGameStateUpdateNotification(1, 1);
	//let { data } = $props();
	//let foo = $state("egg");
</script>

<svelte:head>
	<title>Rock Paper Scissors MMO</title>
	<meta name="description" content="Online Ranked Rock Paper Scissors Game" />
</svelte:head>

<div
	class="d-flex justify-content-center align-items-center gap-2 border p-1 m-1"
>
	<button
		type="button"
		class="btn btn-outline-primary border border-5 rounded-circle p-3"
		aria-label="play rock"
	>
		<RPSSVG path="rock" /></button
	>
	<button
		type="button"
		class="btn btn-outline-danger border border-5 rounded-circle p-3"
		aria-label="play paper"
	>
		<RPSSVG path="paper" /></button
	>
	<button
		type="button"
		class="btn btn-outline-warning border border-5 rounded-circle p-3"
		aria-label="play scissors"
	>
		<RPSSVG path="scissors" /></button
	>
</div>

<h3>Stats for nerds</h3>
<div>Your ID: ...</div>
<div>Your Opponent ID: ...</div>
<div>Game ID: ...</div>
<button onclick={testButton}>test button</button>
