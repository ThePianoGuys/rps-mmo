<script lang="ts">
	import RPSSVG from "$lib/images/rps.svg.svelte";

	import {
		subscribeToGameStateUpdateNotifications,
		pushGameStateUpdateNotification,
		playMove,
	} from "$lib/supabaseClient";
	import type { GameState } from "$lib/supabaseClient";

	let logs: String[] = $state([]);
	let { data } = $props();
	let { games, user, supabase, session } = $derived(data);

	function listenToGameState(gameState: GameState) {
		console.log("hello from svelte listenToGameState");
		console.log(gameState);
	}

	async function testButton() {
		console.log("testButton, getting user");
		// pushGameStateUpdateNotification(1, 1);

		// const {
		// 	data: { user },
		// } = await supabase.auth.getUser();
		// console.log(user);
		//
		// if (user === null) {
		// 	console.log("user is null");
		// 	const { data, error } = await supabase.auth.signInWithOAuth({
		// 		provider: "google",
		// 	});
		// 	console.log(data);
		// 	console.log(error);
		// }
	}

	subscribeToGameStateUpdateNotifications(1, 1, listenToGameState);

	console.log("games are here!");
	$effect(() => {
		console.log("games, etc. are updated!");
		console.log(games);
		console.log(user);
		console.log(supabase);
		console.log(session);
		// console.table({});
	});
	// console.log(games);
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
<div>Your ID: {user?.id}</div>
<div>Your Opponent ID: ...</div>
<div>Game ID: ...</div>
<button onclick={testButton}>test button</button>
<div>Logs:</div>
<ul>
	{#each logs as log}
		<li>{log}</li>
	{/each}
</ul>
