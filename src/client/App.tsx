import "./App.css";

import { useEffect, useState } from "react";

import { PieceType, Placement } from "../common/game-types";
import { MessageType, RegisterWebsocketMessage } from "../common/message/message";
import { GameEngine } from "../common/game-engine";
import { PlacementMessage } from "../common/message/game-message";

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


function App() {
  const [boardState, setBoardState] = useState<PieceType[]>(Array(9).fill(PieceType.BLANK))
  const [player, setPlayer] = useState<PieceType>(PieceType.X);
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
    <div className="App">
      <h1>Tic Tac Toe</h1>
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
    </div>
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
