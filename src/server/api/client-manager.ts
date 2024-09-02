import { WebSocket } from "ws";
import { SocketManager } from "./socket-manager.ts";
import { ClientType } from "../../common/client-types.ts";
import { Message } from "../../common/message/messages.ts";

/**
 * A class which handles communication between clients
 */
export class ClientManager {
    constructor(
        private socketManager: SocketManager,
        private hostId?: string,
        private clientId?: string,
    ) {}

    public getHostSocket(): WebSocket | undefined {
        if (this.hostId !== undefined) {
            return this.socketManager.getSocket(this.hostId);
        }
        return undefined;
    }

    public sendToHost(message: Message): boolean {
        const socket = this.getHostSocket();
        if (socket !== undefined) {
            const json = message.toJson();
            socket.send(json);
            console.log("Sent to host socket: " + json);
        } else {
            console.log("Host socket undefined");
        }
        return socket !== undefined;
    }

    public sendToClient(message: Message): boolean {
        const socket = this.getClientSocket();
        if (socket !== undefined) {
            const json = message.toJson();
            socket.send(json);
            console.log("Sent to client socket: " + json);
        } else {
            console.log("Client socket undefined");
        }
        return socket !== undefined;
    }

    public getClientSocket(): WebSocket | undefined {
        if (this.clientId !== undefined) {
            return this.socketManager.getSocket(this.clientId);
        }
        return undefined;
    }

    public getClientType(id: string): ClientType {
        if (id === this.hostId) {
            return ClientType.HOST;
        } else if (id === this.clientId) {
            return ClientType.CLIENT;
        }
        return ClientType.SPECTATOR;
    }

    public assignPlayer(id: string): void {
        if (this.hostId === undefined || id === this.hostId) {
            this.hostId = id;
        } else if (this.clientId === undefined || id === this.clientId) {
            this.clientId = id;
        }
    }
}

