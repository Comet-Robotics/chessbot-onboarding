import { Message, MessageType, RegisterWebsocketMessage } from "./message";
import {
    GameInterruptedMessage,
    GameStartedMessage,
    BoardMessage,
    PlacementMessage,
} from "./game-message";

/**
 * Parses sent messages into Message instances.
 *
 * @param text - A string received from the server or the client.
 * @returns the parsed Message class.
 */
export function parseMessage(text: string): Message {
    const obj = JSON.parse(text);

    switch (obj.type) {
        case MessageType.REGISTER_WEBSOCKET:
            return new RegisterWebsocketMessage();
        case MessageType.GAME_STARTED:
            return new GameStartedMessage();
        case MessageType.GAME_INTERRUPTED:
            return new GameInterruptedMessage(obj.reason);
        case MessageType.BOARD:
            return new BoardMessage(obj.board);
        case MessageType.PLACEMENT:
            return new PlacementMessage(obj.placement);
    }
    throw new Error("Failed to parse message.");
}
