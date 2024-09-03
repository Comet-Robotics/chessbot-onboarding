import express, { RequestHandler, Express } from "express";
import ViteExpress from "vite-express";
import cookieParser from "cookie-parser";
import { v4 as uuuuuuuuid } from "uuid";
import { websocketHandler } from "./api/api.ts";
import expressWebSocket from "express-ws";
import { clientManager } from "./api/managers.ts";

const app = expressWebSocket(express()).app;

// app.use() is something called a middleware. This gets run before an api requests get sent to the api
app.use(express.json());
app.use(cookieParser());

/**
 * Attaches a unique clientId to req if it does not already exist.
 * The cookie is automatically sent back to the client, stored in the browser, and included by the client in all future requests.
 */
const checkAuthentication: RequestHandler = (req, res, next) => {
    if (!req.cookies.id) {
        res.cookie("id", uuid(), {
            // Expires after 1 day
            maxAge: 86400000,
            // Cookie isn't available to client
            httpOnly: true,
        });
    }
    return next();
};

// Ensure all requests have a clientId cookie.
app.use(checkAuthentication);

// Registers all players with the client manager.
app.use((req, _, next) => {
    clientManager.assignPlayer(req.cookies.id);
    return next();
});

// This basically just redirects your url to /home the moment you join. Useful for when you have a main menu
app.get("/", (_, res) => {
    return res.redirect("/home");
});

// This creates a websocket with the specified name
// (The name is viewable if you view the network traffic in your browser)
app.ws("/game-ws", websocketHandler);

// This sends any api requests to our api handler
app.use("/api", apiRouter);

// This starts the backend, and notifies vite to start the frontend
ViteExpress.listen(app as unknown as Express, 3000, () => {
    console.log("Server is listening on port 3000.");
});
