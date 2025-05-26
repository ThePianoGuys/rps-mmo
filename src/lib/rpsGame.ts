import { Move, PlayerMove } from "$lib/const"


export function getRpsGameResult(playerMove: Move, opponentMove: Move) {
    if (playerMove == opponentMove) {
        return "draw";
    } else if (
        playerMove === Move.ROCK && opponentMove === Move.PAPER ||
        playerMove === Move.PAPER && opponentMove === Move.SCISSORS ||
        playerMove === Move.SCISSORS && opponentMove === Move.ROCK
    ) {
        return "lose";
    } else {
        return "win";
    }
}

export function getTotalScores(rounds: {}) {

}
