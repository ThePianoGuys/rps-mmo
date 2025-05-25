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

<header class="border">
	<nav><a href="/">Home</a></nav>
	<button onclick={logout}>Logout</button>
</header>

<div>Private page for user: {user?.email}</div>
