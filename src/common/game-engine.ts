import { GameFinishedReason } from "./game-end-reasons.ts";
import { Piece, PieceType, Placement } from "./game-types.ts";

export class GameEngine {
    private game: Piece[];

    constructor() {
        this.game = new Array<Piece>;
    }

    /**
     * Copies the chess engine, optionally with an extra move on the copy.
     * @param move - A move to make.
     */
    copy(placement?: Placement): GameEngine {
        const copy = new GameEngine();
        if (placement !== undefined) {
            copy.makePlacement(placement);
        }
        return copy;
    }

    place(placement: Placement): boolean {
        if (this.game[placement.square] == undefined) {
            this.game[placement.square] = new Piece(placement.pieceType, placement.square);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns if a square has a piece on it.
     * @param square - The square of the board to check.
     * @returns true if the square has a piece on it.
     */
    hasPiece(square: number) {
        return this.game[square] !== undefined;
    }

    /**
     * Places a piece on the tic-tac-toe board
     * @returns the move that was made.
     */
    makePlacement(placement: Placement): Placement {
        this.place(placement);
        return placement;
    }

    isRowWin(pieceType: PieceType, offset: number): boolean {
        const first = this.game[offset*3].pieceType == pieceType;
        const second= this.game[1+(offset*3)].pieceType == pieceType;
        const third = this.game[2+(offset*3)].pieceType == pieceType;
        return first && second && third;
    }

    isColumnWin(pieceType: PieceType, offset: number): boolean {
        const first = this.game[offset].pieceType == pieceType;
        const second= this.game[3+offset].pieceType == pieceType;
        const third = this.game[6+offset].pieceType == pieceType;
        return first && second && third;
    }

    isDiagonalWin(pieceType: PieceType): boolean {
        const first = this.game[0].pieceType == pieceType;
        const second= this.game[4].pieceType == pieceType;
        const third = this.game[8].pieceType == pieceType;
        return first && second && third;
    }

    isAntiDiagonalWin(pieceType: PieceType): boolean {
        const first = this.game[2].pieceType == pieceType;
        const second= this.game[4].pieceType == pieceType;
        const third = this.game[6].pieceType == pieceType;
        return first && second && third;
    }

    isXWin(): boolean {
        let rowWin = false;
        let columnWin = false;
        let diagonalWin = false;
        for (let i = 0; i < 3; i++) {
            if (this.isRowWin(PieceType.X, i)) {
                rowWin = true;
            }
        }
        for (let i = 0; i < 3; i++) {
            if (this.isColumnWin(PieceType.X, i)) {
                columnWin = true;
            }
        }
        if (this.isDiagonalWin(PieceType.X) || this.isAntiDiagonalWin(PieceType.X)) {
            diagonalWin = true;
        }
        return rowWin || columnWin || diagonalWin;
    }

    isOWin(): boolean {
        let rowWin = false;
        let columnWin = false;
        let diagonalWin = false;
        for (let i = 0; i < 3; i++) {
            if (this.isRowWin(PieceType.O, i)) {
                rowWin = true;
            }
        }
        for (let i = 0; i < 3; i++) {
            if (this.isColumnWin(PieceType.O, i)) {
                columnWin = true;
            }
        }
        if (this.isDiagonalWin(PieceType.O) || this.isAntiDiagonalWin(PieceType.O)) {
            diagonalWin = true;
        }
        return rowWin || columnWin || diagonalWin;
    }

    isTie(): boolean {
        for (let i = 0; i < this.game.length; i++) {
            if (this.game[i] == undefined) {
                return false;
            }
        }
        return true;
    }

    getGameFinishedReason(): GameFinishedReason | undefined {
        if (this.isXWin()) {
            return GameFinishedReason.X_WON;
        } else if (this.isOWin()) {
            return GameFinishedReason.O_WON;
        } else if (this.isTie()) {
            return GameFinishedReason.TIE;
        }
        return undefined;
    }

    /**
     * Returns true if `getGameFinishedReason` does not return undefined.
     */
    isGameFinished(): boolean {
        return this.getGameFinishedReason() !== undefined;
    }
}
