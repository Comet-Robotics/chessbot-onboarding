export type GameEndReason = GameFinishedReason | GameInterruptedReason;

export enum GameFinishedReason {
    X_WON = "x-won",
    O_WON = "o-won",
    TIE = "tie"
}

/**
 * A reason for a game to be stopped outside the normal flow of moves.
 */
export enum GameInterruptedReason {
    X_RESIGNED = "white-resigned",
    O_RESIGNED = "black-resigned",
    ABORTED = "aborted",
}
