<script>
	import { invalidate } from "$app/navigation";
	import { onMount } from "svelte";

	let { data, children } = $props();
	let { session, supabase, user } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<nav class="d-flex navbar navbar-expand-lg navbar-dark bg-dark py-3 px-5">
	<a href="/" class="navbar-brand">RPS MMO ⚔️</a>
	<a href="/auth" class="nav-link text-secondary ms-auto"
		>{user ? user.email : "Sign in"}</a
	>
</nav>

{@render children()}
