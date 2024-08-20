/**
 * Defines a specific piece.
 * Values are defined to be consistent with the chess.js library.
 */
export enum PieceType {
    X = "x",
    O = "o"
}

export class Piece {
    constructor(
        public readonly pieceType: PieceType,
        public square: Number
    ) {}
}

export class Placement {
    constructor(
        public readonly pieceType: PieceType,
        public square: number
    ) {}
}
