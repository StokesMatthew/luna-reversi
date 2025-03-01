import React, { useState, useEffect } from "react";
import { Cell, Field } from "../../types";
import { getMoonImage } from "../../utils/images";
import { checkPossible } from "../../utils/moves";
import "./Board.css";

interface BoardProps {
  lunar: number;
  board: Cell[][];
  neighbors: number[][];
  field: Field;
  playerHand: string[];
  selected: number;
  handleCellClick: (x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({
  lunar,
  board,
  neighbors,
  field,
  playerHand,
  selected,
  handleCellClick,
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = board.flat().map(cell => {
        if (cell.phase !== "Empty") {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.src = getMoonImage(lunar, cell.phase, board, [0, 0]);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    loadImages();
  }, [board, lunar]);

  return (
    <div className={`board ${imagesLoaded ? 'loaded' : ''}`}>
    {board.map((row, x) => (
      <div key={x} className="row">
        {row.map((cell, y) => (
          <div
            key={y}
            className={`cell ${
              cell.owner === "Player"
                ? "player"
                : cell.owner === "AI"
                ? "ai"
                : "empty"
            } ${checkPossible(lunar, x, y, playerHand, selected, board, field) ? "" : "no"}
            ${lunar === 9 && selected === x * 10 + y ? "selected-piece" : ""}
            ${lunar === 9 ? "clickable" : ""}`}
            onClick={() => handleCellClick(x, y)}
          >
            <div className="moon-contain">
              <img
                src="/img/lock.png"
                alt="Lock"
                className={`lock ${!cell.trait.includes("Locked") ? "hide" : ""}`}
              />
              <div
                className="mine-count"
                style={{ color: cell.phase === "Empty" ? "#DDD" : "#222" }}
              >
                {cell.phase === "Empty" || lunar != 3 || cell.trait.includes("Mine") || neighbors[x][y] === 0 ? "" : neighbors[x][y]}
              </div>
              <img
                src="/img/mine.png"
                alt="Mine"
                className={`mine ${!cell.trait.includes("Mine") || board[x][y].phase === "Empty" ? "hide" : ""}`}
              />
              <img
                src={getMoonImage(lunar, cell.phase, board, [x, y])}
                alt="Moon"
                className={`cellmoon ${
                  cell.owner === "Player"
                    ? "player"
                    : cell.owner === "AI"
                    ? "ai"
                    : "empty"
                } ${cell.trait.includes("Locked") ? "show" : ""}`}
              />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
  );
};

export default Board;
