import "./App.css";

import { useReducer, useState } from "react";

import { PieceType } from "../common/game-types";

function App() {
  const [boardState, setBoardState] = useState<PieceType[]>(Array(9).fill(PieceType.BLANK))

  return (
    <div className="App">
      <div className="board-grid">
        {boardState.map((piece, pieceIndex) => {
          return (
            <BoardPieceComponent
              key={`piece-${pieceIndex}`}
              piece={piece}
              onClick={() => {
                console.log("clicked", {piece, pieceIndex});
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
    <button className="board-piece" onClick={props.onClick}>
      <p>{props.piece}</p>
    </button>
  );
}

export default App;
