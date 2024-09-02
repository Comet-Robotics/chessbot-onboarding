/**
 * Defines messages sent across web sockets between the server and the client (and/or the client and the server).
 *
 * To add a new message, first add a member to MessageType, then create a corresponding class which extends `Message` and implements the `type` method and the `toObj` method.
 * Finally, add a corresponding case to `parseMessage` in `./parse-message`.
 */

/**
 * A collection of WebSocket message types.
 */
export enum MessageType {
    /**
     * A client-server message used to register a websocket with the server.
     */
    REGISTER_WEBSOCKET = "register-websocket",
    /**
     * A two-way message containing a single placement.
     */
    PLACEMENT = "placement",
    /**
     * A server-client message used to tell player two a game has started.
     */
    GAME_STARTED = "game-started",
    /**
     * A server-client message used to tell both players a game has finished due to normal flow.
     */
    GAME_FINISHED = "game-finished",
    /**
     * A two-way message indicating a game has been interrupted.
     *
     * Note this does not include the game ending as a part of the normal flow of moves.
     */
    GAME_INTERRUPTED = "game-interrupted",
}