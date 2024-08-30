/**
 * This module creates global singleton instances of the various manager classes.
 */
import { ClientManager } from "./client-manager.ts";
import { SocketManager } from "./socket-manager.ts";

export const socketManager = new SocketManager({});
export const clientManager = new ClientManager(socketManager);
