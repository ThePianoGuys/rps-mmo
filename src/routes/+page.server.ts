// import { supabase } from "$lib/supabaseClient";

import type { PageServerLoad } from "./$types";

// export async function load() {
// 	// const { data } = await supabase.from("instruments").select();
// 	// return {
// 	// 	instruments: data ?? ["ROCK", "PAPER", "SCISSOR"],
// 	// };
//
// 	return {
// 		words: ["ROCK", "PAPER", "SCISSOR"],
// 	};
// }

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: games } = await supabase.from('Game').select("current_round_idx").limit(5).order('id');
	return { games: games ?? [] };
}
