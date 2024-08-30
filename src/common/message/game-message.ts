import { Message, MessageType } from "./message.ts";
import { PieceType, Placement } from "../game-types.ts";
import { GameInterruptedReason } from "../game-end-reasons.ts";

export class BoardMessage extends Message {
    constructor(public readonly board: PieceType[]) {
        super();
    }

    protected type = MessageType.BOARD;

    protected toObj(): object {
        return { ...super.toObj(), board: this.board };
    }
}

export class PlacementMessage extends Message {
    constructor(public readonly placement: Placement) {
        super();
    }

    protected type = MessageType.PLACEMENT;

    protected toObj(): object {
        return {
            ...super.toObj(),
            placement: this.placement,
        };
    }
}
export class GameStartedMessage extends Message {
    constructor() {
        super();
    }

    protected type = MessageType.GAME_STARTED;
}

export class GameInterruptedMessage extends Message {
    constructor(public readonly reason: GameInterruptedReason) {
        super();
    }

    protected type = MessageType.GAME_INTERRUPTED;

    protected toObj(): object {
        return {
            ...super.toObj(),
            reason: this.reason,
        };
    }
}
