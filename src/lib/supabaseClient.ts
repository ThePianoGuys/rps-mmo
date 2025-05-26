import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Move } from './const';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);


function getMoveColumn(playerId: number, player_1_id: number, player_2_id: number) {
    if (playerId === player_1_id) {
        return {
            yourMoveColumn: 'player_1_move',
            opponentMoveColumn: 'player_2_move',
        }
    } else if (playerId === player_2_id) {
        return {
            yourMoveColumn: 'player_2_move',
            opponentMoveColumn: 'player_1_move',
        }
    } else {
        throw new Error('Invalid player ID');
    }
}

function getOpponentId(playerId: number, player_1_id: number, player_2_id: number) {
    if (playerId === player_1_id) {
        return player_2_id;
    } else if (playerId === player_2_id) {
        return player_1_id;
    } else {
        throw new Error('Invalid player ID');
    }
}

export async function getGameState(gameId: number, playerId: number) {
    const { player_1_id, player_2_id, current_round_idx } = await queryGetGame(gameId);
    const { yourMoveColumn, opponentMoveColumn } = getMoveColumn(playerId, player_1_id, player_2_id);

    const roundsData = await queryGetRounds(gameId);

    return {
        opponent_id: getOpponentId(playerId, player_1_id, player_2_id),
        current_round_idx: current_round_idx,
        rounds: roundsData?.map((round) => {
            return {
                your_move: round[yourMoveColumn as keyof typeof round],
                opponent_move: round[opponentMoveColumn as keyof typeof round],
            }
        }) || []
    }
}

export type GameState = Awaited<ReturnType<typeof getGameState>>;

export async function playMove(gameId: number, playerId: number, roundIdx: number, move: Move | null) {
    // 1. Get game state and find out which player we are and what is the current round.

    const { player_1_id, player_2_id, current_round_idx } = await queryGetGame(gameId);
    const { yourMoveColumn, opponentMoveColumn } = getMoveColumn(playerId, player_1_id, player_2_id);

    let isNowOver = false;

    // 2A. If the current round is after the one we are playing, we were too late.
    if (current_round_idx > roundIdx) {
        console.error('Too late to play move');
        return;
    }

    // 2B. If the DB's current round is the one we are playing, fetch the current round from DB.
    else if (current_round_idx === roundIdx) {
        const roundData = await queryGetRound(gameId, roundIdx);

        // 2B1. The round does not exist yet, so we need to create it.
        if (roundData === null) {
            createRound(gameId, roundIdx, yourMoveColumn, move);
            return;
        }

        const { player_1_move, player_2_move, is_over } = roundData!;

        // 2B2. The round is over, we were too late.
        if (is_over) {
            console.error('Round is over');
            return;
        }

        // 2B3. Will the round be over after we play our move?
        if (yourMoveColumn === 'player_1_move') {
            if (player_2_move) {
                isNowOver = true;
            }
        } else if (yourMoveColumn === 'player_2_move') {
            if (player_1_move) {
                isNowOver = true;
            }
        }

        // 2B4. We can play our move.
        const { data: updateData, error: updateError } = await supabase
            .from('Round')
            .update({ [yourMoveColumn]: move, is_over: isNowOver })
            .eq('game_id', gameId)
            .eq('round_idx', roundIdx)
            .select('');

        if (updateError) {
            console.error(updateError);
            return;
        }
    }

    // 2C. If the DB's current round is before the one we are playing, we will need to create it
    // in DB.
    else {
        createRound(gameId, roundIdx, yourMoveColumn, move);
    }

    // 3. If the round is over, we need to push the game state to the opponent.
    if (isNowOver) {
        const opponentId = getOpponentId(playerId, player_1_id, player_2_id);
        pushGameStateUpdateNotification(gameId, opponentId!);
    }
}

async function queryGetGame(gameId: number) {
    const { data: gameData, error: gameError } = await supabase
        .from('Game')
        .select('player_1_id, player_2_id, current_round_idx')
        .eq('id', gameId)
        .limit(1)
        .single();

    if (gameError) {
        console.error(gameError);
        throw gameError;
    }

    return {
        player_1_id: gameData.player_1_id,
        player_2_id: gameData.player_2_id,
        current_round_idx: gameData.current_round_idx,
    }
}

async function queryGetRound(gameId: number, roundIdx: number) {
    const { data: roundData, error: roundError } = await supabase
        .from('Round')
        .select('player_1_move, player_2_move, is_over')
        .eq('game_id', gameId)
        .eq('round_idx', roundIdx)
        .limit(1)
        .single();

    if (roundError?.code == 'PGRST116') {
        return null;
    }

    else if (roundError) {
        console.error(roundError);
        return;
    }

    return {
        player_1_move: roundData.player_1_move,
        player_2_move: roundData.player_2_move,
        is_over: roundData.is_over,
    }
}

async function queryGetRounds(gameId: number) {
    const { data: roundData, error: roundError } = await supabase
        .from('Round')
        .select('round_idx, player_1_move, player_2_move, is_over')
        .order('round_idx', { ascending: true })
        .eq('game_id', gameId)

    if (roundError?.code == 'PGRST116') {
        return null;
    }

    else if (roundError) {
        console.error(roundError);
        return;
    }

    return roundData
}

async function createRound(gameId: number, roundIdx: number, moveColumn: string, move: Move | null) {
    const { data: createData, error: createError } = await supabase
        .from('Round')
        .insert({
            game_id: gameId,
            round_idx: roundIdx,
            [moveColumn]: move,
        });

    if (createError) {
        console.error(createError);
        throw createError;
    }
}

export async function pushGameStateUpdateNotification(gameId: number, playerId: number) {
    const gameChannel = supabase.channel(`game_${gameId}_${playerId}`);
    gameChannel.send({
        type: 'broadcast',
        event: 'updateGameState',
        payload: {
            gameState: await getGameState(gameId, playerId),
        },
    });
}

export function subscribeToGameStateUpdateNotifications(gameId: number, playerId: number, listenToGameState: (gameState: GameState) => any) {
    const gameChannel = supabase.channel(`game_${gameId}_${playerId}`);
    gameChannel.on(
        'broadcast',
        { event: 'updateGameState' },
        (payload) => {
            listenToGameState(payload.payload.gameState);
        }
    ).subscribe();
}


// Testing

// playMove(1, 1, 0, Move.ROCK);
// pushNotificationForGame(1);
// console.log(await getGameState(1, 2));
// console.log(await queryGetRounds(1));
// console.log(await queryGetGame(1));
// console.log(await queryGetRound(1, 0));
