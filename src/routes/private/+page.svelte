<script lang="ts">
	let { data } = $props();
	let { user, supabase } = $derived(data);

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.log("logout failed!");
			console.error(error);
		}
	};
</script>

{#if user}
	<div>Private page for user: {user?.email}</div>
	<div>ID: {user.id}</div>
	<div>Created at: {user.created_at}</div>
	<button onclick={logout}>Logout</button>
{:else}
	<div>You are not logged in.</div>
	<div><a href="/auth">Please sign in</a></div>
{/if}
