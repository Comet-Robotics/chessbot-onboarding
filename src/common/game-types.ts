/**
 * Defines a specific piece.
 */
export enum PieceType {
    X = "x",
    O = "o",
    BLANK = "blank"
}

export class Placement {
    constructor(
        public readonly pieceType: PieceType,
        public square: number
    ) {}
}
