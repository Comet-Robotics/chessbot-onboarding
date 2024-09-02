import WebSocket from "ws";
import { Message } from "../../common/message/messages.ts";

/**
 * A class which maps client ids to their corresponding sockets (if any).
 */
export class SocketManager {
    constructor(private sockets: Record<string, WebSocket>) {}

    public registerSocket(id: string, socket: WebSocket): void {
        this.sockets[id] = socket;
    }

    public handleSocketClosed(id: string): void {
        delete this.sockets[id];
    }

    public getSocket(id: string): WebSocket {
        return this.sockets[id];
    }

    /**
     * Sends a message to a socket with the specified id.
     * Returns true if the message was sent successfully, and false otherwise.
     */
    public sendToSocket(id: string, message: Message): boolean {
        const socket = this.getSocket(id);
        if (socket !== undefined) {
            const json = message.toJson()
            socket.send(json);
            console.log("Sent message to socket id", id, json)
            return true;
        }
        return false;
    }
}
