import "./App.css";

import { useEffect, useState } from "react";

import { PieceType, Placement } from "../common/game-types";
import { MessageType, RegisterWebsocketMessage } from "../common/message/message";
import { GameEngine } from "../common/game-engine";
import { PlacementMessage } from "../common/message/game-message";
import { ClientType } from "../common/client-types";
import { GameFinishedReason } from "../common/game-end-reasons";

function useWebSocket() {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    setWebSocket(ws);

    ws.onopen = () => {
      ws.send(new RegisterWebsocketMessage().toJson())
    };
    
    return () => {
      if (webSocket) webSocket.close();
    };
  }, []);

  return {webSocket};
}


type ClientInfo = {
  isGameActive: boolean;
  clientType: ClientType;
}

type InitialGameState = {
  pieceType: PieceType,
  game: {
    game: PieceType[],
  },
  gameEndReason: GameFinishedReason | undefined
}

function App() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [initialGameState, setInitialGameState] = useState<InitialGameState | null>(null)
  
  const getInitialGameState = async () => {
    const query = new URLSearchParams();
    const res = await fetch("http://localhost:3000/api/game-state");
    
    const json = await res.json() as InitialGameState;
    setInitialGameState(json);
  }
  
  const startGame = async (pieceType: PieceType) => {
    const query = new URLSearchParams();
    query.set("pieceType", pieceType);
    const startGameRes = await fetch("http://localhost:3000/api/start-human-game?" + query.toString() , {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    })
    if (!startGameRes.ok) {
      alert("Failed to start game");
    }
    
    await getInitialGameState();
  }
  
  
  
  useEffect(() => {
    const run = async () => {
      const res = await fetch("http://localhost:3000/api/client-information")
      const json = await res.json() as ClientInfo;
      setClientInfo(clientInfo)
      
      if (!json.isGameActive) {
        const canCreateNewGame = json.clientType != ClientType.SPECTATOR
        const shouldCreateNewGame = canCreateNewGame && confirm("No game is active - do you want to start a new game?");
        if (shouldCreateNewGame) {
          const pieceType = json.clientType === ClientType.HOST ? PieceType.X : PieceType.O;
          await startGame(pieceType);
        };
      } else {
        await getInitialGameState();
      }
    }
      
    run();
  }, []);
  
  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>
      {
        clientInfo === null ? <p>Loading...</p> : initialGameState !== null ? <TicTacToe initialPlayer={initialGameState.pieceType} initialBoardState={initialGameState.game.game} /> : <button type="button" onClick={async () => {
          if (!clientInfo) {
            alert("No client info");
            return;
          }
          const pieceType = clientInfo.clientType === ClientType.HOST ? PieceType.X : PieceType.O;
          await startGame(pieceType);
        }}>
          Start Game
        </button>
      }

    </div>
  )
}

function TicTacToe(props: {initialBoardState: PieceType[], initialPlayer: PieceType}) {
  const {initialBoardState, initialPlayer} = props;
  const [boardState, setBoardState] = useState<PieceType[]>(initialBoardState)
  const [player, setPlayer] = useState<PieceType>(initialPlayer);
  const {webSocket} = useWebSocket();
  
  useEffect(() => {
    if (!webSocket) {
      return;
    }

    webSocket.onmessage = (event) => {
      const parsedMessage = JSON.parse(event.data) as Record<string, any> & { type?: MessageType };
      
      if (!parsedMessage.type) {
        console.error("Received message without type", parsedMessage);
        return;
      }
      
      switch (parsedMessage.type) {
        case MessageType.PLACEMENT:
          const placementMsg = parsedMessage.placement as Placement;
          const updatedBoardState = [...boardState];
          updatedBoardState[placementMsg.square] = placementMsg.pieceType;
          setBoardState(updatedBoardState);
          setPlayer(GameEngine.oppositePiece(placementMsg.pieceType))
          break;
        default:
          console.error("Received unknown message type", parsedMessage);
          break;
      }
      
    };
  }, [webSocket]);
  
  return (
    <>
      <p>Player: {player}</p>
      <div className="board-grid">
        {boardState.map((piece, pieceIndex) => {
          return (
            <BoardPieceComponent
              key={`piece-${pieceIndex}`}
              piece={piece}
              onClick={() => {
                const placement: Placement = {
                  pieceType: player,
                  square: pieceIndex,
                };
                const msg = new PlacementMessage(placement);
                
                if (!webSocket) {
                  console.error("No websocket connection");
                  return;
                }  
                webSocket.send(msg.toJson());
              }}
            />
          );
        })
      }
      </div>
</>
);
}

function BoardPieceComponent(props: {
  piece: PieceType;
  onClick: () => void;
}) {
  return (
    <button type="button" className="board-piece" onClick={props.onClick}>
      <p>{props.piece}</p>
    </button>
  );
}

export default App;
