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

	let currentGameState: GameState = $state({
		opponent_id: 0,
		current_round_idx: 0,
		rounds: undefined,
	});

	function listenToGameState(gameState: GameState) {
		console.log("hello from svelte listenToGameState");
		console.log(gameState);
		currentGameState = gameState;
	}

	async function testButton() {
		console.log("testButton, getting user");
	}

	subscribeToGameStateUpdateNotifications(1, 1, listenToGameState);

	console.log("games are here!");
	$effect(() => {
		console.log("games, etc. are updated!");
		console.log(games);
		console.log(user);
		console.log(supabase);
		console.log(session);
	});
</script>

<svelte:head>
	<title>Rock Paper Scissors MMO</title>
	<meta name="description" content="Online Ranked Rock Paper Scissors Game" />
</svelte:head>

<div class="h-100 d-flex">
	<div class="w-25">
		<p>hey there~</p>
		<div>
			<h3>Stats for nerds</h3>
			<div>Your ID: {user ? user.id : "user not found"}</div>
			<div>Your Opponent ID: ...</div>
			<div>Game ID: ...</div>
			<button onclick={testButton}>test button</button>
			<div>Logs:</div>
			<ul>
				{#each logs as log}
					<li>{log}</li>
				{/each}
			</ul>
		</div>
	</div>

	<div
		class="d-flex flex-column justify-content-center align-items-center gap-2 border border-3 flex-grow-1"
	>
		<h2>Round #{currentGameState.current_round_idx}</h2>

		<div
			class="d-flex justify-content-center align-items-center gap-1 border border-3 rounded-pill p-2"
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
	</div>

	<div class="w-25 d-flex flex-column text-center p-3">
		<div class="flex-grow-1">
			<div class="h-50">
				<div>
					<h5>Game History</h5>
					<ul class="list-group overflow-auto">
						<li class="list-group-item">P - S</li>
						<li class="list-group-item">P - S</li>
						<li class="list-group-item">P - S</li>
						<li class="list-group-item">P - S</li>
						<li class="list-group-item">P - S</li>
						<li class="list-group-item">P - S</li>
					</ul>
				</div>
			</div>
			<div class="h-50 d-grid">
				<div class="row">
					<div class="col-6">
						<h5>You</h5>
						<ul class="list-group overflow-auto">
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
						</ul>
					</div>
					<div class="col-6">
						<h5>Enemy</h5>
						<ul class="list-group overflow-auto">
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
							<li class="list-group-item">P - S</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
