import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types';

export const supabase = createClient('https://okvnnflokjogyhbcmwld.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdm5uZmxva2pvZ3loYmNtd2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTA0MDYsImV4cCI6MjA2MzY4NjQwNn0.K58IeWgqqt0SW_Gg-ozVVUrzY-EjOicKP9mZ0GY3M-o')


export enum Move {
    ROCK = "rock",
    PAPER = "paper",
    SCISSORS = "scissors",
}

export async function trySelecting(gameId: Number) {
    const { data: gameData, error: gameError } = await supabase
        .from('Game')
        .select('player_1_id, player_2_id, current_round_idx')
        .eq('id', gameId)
        .limit(1)
        .single();

    if (gameError) {
        console.error(gameError);
        return;
    }
    console.log(gameData);
}

export async function playMove(gameId: Number, playerId: Number, roundIdx: Number, move: Move | null) {
    // 1. Get game state and find out which player we are and what is the current round.
    const { data: gameData, error: gameError } = await supabase
        .from('Game')
        .select('player_1_id, player_2_id, current_round_idx')
        .eq('id', gameId)
        .limit(1)
        .single();

    if (gameError) {
        console.error(gameError);
        return;
    }

    const { player_1_id, player_2_id, current_round_idx } = gameData;

    let yourMoveColumn: string;
    let opponentMoveColumn: string;

    if (playerId === player_1_id) {
        yourMoveColumn = 'player_1_move';
        opponentMoveColumn = 'player_2_move';
    } else if (playerId === player_2_id) {
        yourMoveColumn = 'player_2_move';
        opponentMoveColumn = 'player_1_move';
    } else {
        throw new Error('Invalid player ID');
    }

    let isNowOver = false;

    // 2A. If the current round is after the one we are playing, we were too late.
    if (current_round_idx > roundIdx) {
        console.error('Too late to play move');
        return;
    }

    // 2B. If the DB's current round is the one we are playing, fetch the current round from DB.
    else if (current_round_idx === roundIdx) {
        const { data: roundData, error: roundError } = await supabase
            .from('Round')
            .select('player_1_move, player_2_move, is_over')
            .eq('game_id', gameId)
            .eq('round_idx', roundIdx)
            .limit(1)
            .single();

        if (roundError?.code == 'PGRST116') {
            // The round does not exist yet, so we need to create it.
            createRound(gameId, roundIdx, yourMoveColumn, move);
            return;
        }

        else if (roundError) {
            console.error(roundError);
            return;
        }

        const { player_1_move, player_2_move, is_over } = roundData;

        // 2B1. If the round is over, we were too late.
        if (is_over) {
            console.error('Round is over');
            return;
        }

        // 2B2. Will the round be over after we play our move?
        if (yourMoveColumn === 'player_1_move') {
            if (player_2_move) {
                isNowOver = true;
            }
        } else if (yourMoveColumn === 'player_2_move') {
            if (player_1_move) {
                isNowOver = true;
            }
        }

        // 2B3. We can play our move.
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
        pushNotificationForGame(gameId);
    }
}

export async function createRound(gameId: Number, roundIdx: Number, moveColumn: string, move: Move | null) {
    const { data: createData, error: createError } = await supabase
        .from('Round')
        .insert({
            game_id: gameId,
            round_idx: roundIdx,
            [moveColumn]: move,
        });

    if (createError) {
        console.error(createError);
        return;
    }
}

export async function pushNotificationForGame(gameId: Number) {
    const { data, error } = await supabase
            .rpc(
                'realtime.send',
                {
                    topic: `game_${gameId}`,
                    event: 'updateGameState',
                    payload: {},
                }
            );

    if (error) {
        console.error(error);
    }
}

export function subscribeToNotificationsForGame(gameId: Number) {
    const gameChannel = supabase.channel(`game_${gameId}`);
    gameChannel.on(
        'broadcast',
        {event: 'updateGameState'},
        (payload) => {
            console.log(payload);
        }
    ).subscribe();
}


// Testing

// trySelecting(1);
// playMove(1, 1, 0, Move.ROCK);
