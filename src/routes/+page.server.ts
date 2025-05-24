// import { supabase } from "$lib/supabaseClient";

export async function load() {
	// const { data } = await supabase.from("instruments").select();
	// return {
	// 	instruments: data ?? ["ROCK", "PAPER", "SCISSOR"],
	// };

	return {
		words: ["ROCK", "PAPER", "SCISSOR"],
	};
}
