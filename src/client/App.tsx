import "./App.css";

import { useEffect, useState } from "react";

import { PieceType, Placement } from "../common/game-types";
import { MessageType } from "../common/message/message-types";
import { GameEngine } from "../common/game-engine";
import {
  PlacementMessage,
  RegisterWebsocketMessage,
} from "../common/message/messages";
import { ClientType } from "../common/client-types";
import { GameFinishedReason } from "../common/game-end-reasons";

function useWebSocket() {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  // Use effect is a special react function. As far as I know, It basically gets run anytime the component
  // it's attached to get re-rendered. In this case, whatever component calls the useWebSocket function
  useEffect(() => {
    const useSecure = window.location.protocol === "https:";
    const wsProtocol = useSecure ? "wss" : "ws";
    const ws = new WebSocket(
      wsProtocol + "://" + window.location.host + "/game-ws"
    );
    setWebSocket(ws);

    ws.onopen = () => {
      ws.send(new RegisterWebsocketMessage().toJson());
    };

    return () => {
      if (webSocket) webSocket.close();
    };
  }, []);

  return { webSocket };
}

type ClientInfo = {
  isGameActive: boolean;
  clientType: ClientType;
};

type InitialGameState = {
  hostPiece: PieceType;
  game: {
    board: PieceType[];
    currentTurn: PieceType;
  };
  gameEndReason: GameFinishedReason | undefined;
};

function App() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [initialGameState, setInitialGameState] =
    useState<InitialGameState | null>(null);
  const { webSocket } = useWebSocket();

  const getInitialGameState = async () => {
    const query = new URLSearchParams();
    const res = await fetch("/api/game-state");

    const json = (await res.json()) as InitialGameState;
    setInitialGameState(json);
  };

  // When this is run, a an api request is sent to the backend to start a game
  const startGame = async (hostPiece: PieceType) => {
    const query = new URLSearchParams();
    query.set("hostPiece", hostPiece);
    const startGameRes = await fetch(
      "/api/start-game?" + query.toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!startGameRes.ok) {
      alert("Failed to start game");
    }


    await getInitialGameState();
  };

  useEffect(() => {
    fetch("/api/client-information")
      .then((res) => {
        if (!res.ok) {
          alert("Failed to get client information");
          return;
        }
        return res.json();
      })
      .then((json) => {
        setClientInfo(json);
      });
  }, []);

  useEffect(() => {
    if (clientInfo === null || clientInfo.isGameActive === false) {
      return;
    }

    const run = async () => {
      await getInitialGameState();
    };

    run();
  }, [clientInfo]);

  useEffect(() => {
    if (!webSocket) {
      return;
    }
    const listener = (event: MessageEvent) => {
      const parsedMessage = JSON.parse(event.data) as Record<string, any> & {
        type?: MessageType;
      };

      if (!parsedMessage.type) {
        console.error("Received message without type", parsedMessage);
        return;
      }

      if (parsedMessage.type == MessageType.GAME_STARTED) {
        const run = async () => {
          await getInitialGameState();
        };
    
        run();
      } else if (parsedMessage.type == MessageType.GAME_FINISHED) {
        alert(parsedMessage.reason);
      }
    }
    
    webSocket.addEventListener('message', listener)
    return () => {
      webSocket.removeEventListener('message', listener)
    }
  }, [webSocket]);

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      {clientInfo === null ? (
        <p>Loading...</p>
      ) : initialGameState !== null ? (
        <TicTacToe
          currentPlayer={initialGameState.game.currentTurn}
          initialBoardState={initialGameState.game.board}
          localPlayer={
            clientInfo.clientType === ClientType.HOST
              ? PieceType.X
              : PieceType.O
          }
          spectating={clientInfo.clientType === ClientType.SPECTATOR}
          webSocket={webSocket}
        />
      ) : clientInfo.clientType !== ClientType.HOST ? (
        <p>
          There is no active game, but you are a {clientInfo.clientType} and
          cannot start a game. Please wait for the host to start a game.
        </p>
      ) : (
        <button
          type="button"
          onClick={async () => {
            if (!clientInfo) {
              alert("No client info");
              return;
            }
            const hostPiece = PieceType.X;
            await startGame(hostPiece);
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
}

function TicTacToe(props: {
  initialBoardState: PieceType[];
  currentPlayer: PieceType;
  localPlayer: PieceType;
  spectating: boolean;
  webSocket: WebSocket | null;
}) {
  const { initialBoardState, currentPlayer, localPlayer, spectating, webSocket } = props;
  const [boardState, setBoardState] = useState<PieceType[]>(initialBoardState);
  const [player, setPlayer] = useState<PieceType>(currentPlayer);

  useEffect(() => {
    if (!webSocket) {
      return;
    }
    
    const listener = (event: MessageEvent) => {
      const parsedMessage = JSON.parse(event.data) as Record<string, any> & {
        type?: MessageType;
      };

      if (!parsedMessage.type) {
        console.error("Received message without type", parsedMessage);
        return;
      }

      if (parsedMessage.type == MessageType.PLACEMENT) {
        const placementMsg = parsedMessage.placement as Placement;
        const updatedBoardState = boardState;
        updatedBoardState[placementMsg.square] = placementMsg.pieceType;
        setBoardState(updatedBoardState);
        setPlayer(GameEngine.oppositePiece(placementMsg.pieceType));
      } 
    }
    
    webSocket.addEventListener('message', listener)
    return () => {
      webSocket.removeEventListener('message', listener)
    }
  }, [webSocket]);

  return (
    <>
      <p>Current Player Turn: {player}</p>
      <p>You Are: {localPlayer}</p>
      <div className="board-grid">
        {boardState.map((piece, pieceIndex) => {
          return (
            <BoardTile
              key={`tile-${pieceIndex}`}
              piece={piece}
              disabled={
                spectating ||
                player !== localPlayer ||
                piece !== PieceType.BLANK
              }
              onClick={() => {
                const placement: Placement = {
                  pieceType: localPlayer,
                  square: pieceIndex,
                };

                const newBoardState = boardState;
                newBoardState[pieceIndex] = localPlayer;
                setBoardState(newBoardState);
                
                if (!webSocket) {
                  console.error("No websocket connection");
                  return;
                }

                const msg = new PlacementMessage(placement);
                webSocket.send(msg.toJson());
                setPlayer(GameEngine.oppositePiece(player));
              }}
            />
          );
        })}
      </div>
    </>
  );
}

function BoardPieceComponent(props: {
  piece: PieceType;
  onClick: () => void;
  disabled: boolean;
}) {
  const { piece, onClick, disabled } = props;
  return (
    <button
      type="button"
      className="board-piece"
      disabled={disabled}
      onClick={onClick}
    >
      <p>{piece}</p>
    </button>
  );
}

export default App;
