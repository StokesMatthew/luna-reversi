import React, { useState, useEffect } from "react";
import "./App.css";

// Components
import Board from "./components/board/Board";
import Hand from "./components/hand/Hand";
import Select from "./components/select/Select";
import Help from "./components/help/Help";
import DarkMode from "./components/dark-mode/DarkMode";

// Utils
import { initializeDeck, shuffleDeck, drawFromDeck } from "./utils/deck";
import { setUpBoard, pause, getAvailableSpots, getAdjacentSpots, copyBoard, generateNewField, handleSpecialBoardEffects } from "./utils/board";
import { checkFlip, checkPossible, setPiece, confirmBoard, handleDecay, AIMove, findBestAIMove, countPossible } from "./utils/moves";
import { Player, Cell, Field } from "./types";
import { applyTheme } from './utils/theme';
import { preloadImages } from './utils/images';

// Constants
import { HAND_SIZE, MODES } from "./utils/constants";

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false); // Whether the game has started
  const [lunar, setLunar] = useState<number>(-1); // The current lunar mode

  const [board, setBoard] = useState<Cell[][]>(
    Array(8)
      .fill(null)
      .map(() => Array(8).fill({ owner: "", phase: "Empty", trait: "" }))
  ); // The current board
  const [neighbors, setNeighbors] = useState<number[][]>(
    Array.from({ length: 8 }, () => Array(8).fill(0))
  ); // The mine neighbors of each cell
  const [field, setField] = useState<Field>({minX: 0, minY: 0, maxX: 7, maxY: 7}); // The current field range
  const [points, setPoints] = useState<number[]>([0, 0]); // The current points
  const [selected, setSelected] = useState<number>(-1); // The current selected card
  const [playerHand, setPlayerHand] = useState<string[]>([]); // The current player's hand
  const [enemyHand, setEnemyHand] = useState<string[]>([]); // The current enemy's hand
  const [currentPlayer, setCurrentPlayer] = useState<Player>("Player"); // The current player
  const [gameOver, setGameOver] = useState(false); // Whether the game is over
  const [deck, setDeck] = useState<string[]>([]); // The current deck

  useEffect(() => {
    applyTheme();
    preloadImages();
  }, []);

  const startGame = () => {
    const newDeck = initializeDeck();
    const shuffledDeck = shuffleDeck(newDeck);
    setNeighbors(Array.from({ length: 8 }, () => Array(8).fill(0)));
    setUpBoard(lunar, setBoard, setNeighbors);
    setDeck(shuffledDeck.slice(HAND_SIZE*2));
    setPlayerHand(shuffledDeck.slice(0, HAND_SIZE));
    setEnemyHand(shuffledDeck.slice(HAND_SIZE, HAND_SIZE * 2));

    setField({minX: 0, minY: 0, maxX: 7, maxY: 7});

    if (lunar == 9) {
      setSelected(-1);
      setPoints([8,8]);
    }else {
      setSelected(0);
      setPoints([0,0]);
    }
    setCurrentPlayer("Player");
    setGameOver(false);
    setGameStarted(true);
  }

  useEffect(() => {
    if (lunar === -1) return;
    startGame();

  }, [lunar]);

  const selectCard = (s: number) => {
    if (playerHand[s] !== "Empty") {
      setSelected(s);
    }
  };

  const handleCellClick = (x: number, y: number) => {

    if (lunar === 9) { // Movement-based turn [for lunar 9]
      if (gameOver ||
        currentPlayer !== "Player"
      ) {
        return;
      }

      if (board[x][y].owner === "Player") {
        if (Math.floor(selected/10) === x && selected%10 === y) {
          setSelected(-1);
        }else {
        setSelected((x*10)+y);
        }
      }else if (board[x][y].phase === "Empty" && selected != -1) {
        moveTurn(x, y);
      }

    }else { // Card placement-based turn [for not lunar 9]
      if (
        board[x][y].phase !== "Empty" ||
        gameOver ||
        playerHand[selected] === "Empty" ||
        selected >= HAND_SIZE ||
        currentPlayer !== "Player" ||
        selected < 0 ||
        !checkPossible(lunar, x, y, playerHand, selected, board, field)
      ) {
        return;
      }

      playTurn(x, y);
    }
  };

  const handleAITurn = async (
    currentBoard: Cell[][],
    newPoints: number[],
    isMovement: boolean,
    newPlayerHand: string[],
    playerMove?: { x: number, y: number },
  ): Promise<void> => {
    let newBoardAfterFlip = copyBoard(currentBoard);

    if (isMovement) { // Movement-based AI turn [for lunar 9]
      const aiPieces = currentBoard.flatMap((row, x) =>
        row.map((cell, y) => (cell.owner === "AI" ? [x, y] : null)).filter(Boolean)
      ) as [number, number][];

      const bestMoves = findBestAIMove(lunar, currentBoard, newPoints, true, aiPieces);
      
      if (bestMoves.length === 0) return;

      const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
      if (!selectedMove.from || !selectedMove.to) return;

      const [fromX, fromY] = selectedMove.from;
      const [toX, toY] = selectedMove.to;

      newBoardAfterFlip = setPiece(lunar, toX, toY, newBoardAfterFlip, "AI", newBoardAfterFlip[fromX][fromY].phase);
      newBoardAfterFlip[fromX][fromY] = { owner: "", phase: "Empty", trait: "" };
      newBoardAfterFlip = checkFlip(lunar, toX, toY, "AI", newBoardAfterFlip);
      newBoardAfterFlip = handleDecay(newBoardAfterFlip);

    } else if (enemyHand.some(card => card !== "Empty")) { // Card placement-based AI turn [for not lunar 9]
      const availableSpots = getAvailableSpots(currentBoard, field);
      
      if (availableSpots.length !== 0) {
        const bestMoves = findBestAIMove(
          lunar, 
          currentBoard, 
          newPoints, 
          false, 
          undefined, 
          availableSpots, 
          enemyHand
        );

        let selectedMove: AIMove;
        if (bestMoves.length === 0) {
          const firstValidCard = enemyHand.findIndex(card => card !== "Empty");
          selectedMove = {
            to: availableSpots[Math.floor(Math.random() * availableSpots.length)],
            cardIndex: firstValidCard,
            score: -Infinity
          };
        } else {
          selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        if (!selectedMove.to || selectedMove.cardIndex === undefined) return;
        const [x, y] = selectedMove.to;

        newBoardAfterFlip = setPiece(lunar, x, y, currentBoard, "AI", enemyHand[selectedMove.cardIndex]);
          
        if (lunar !== 1) {
          newBoardAfterFlip = checkFlip(lunar, x, y, "AI", newBoardAfterFlip);
        } else {
          if (playerMove && x === playerMove.x && y === playerMove.y) {
            newBoardAfterFlip = setPiece(lunar, x, y, currentBoard, "", "Empty");
            newBoardAfterFlip[x][y].trait += "Locked";
          } else {
            newBoardAfterFlip = checkFlip(lunar, x, y, "AI", newBoardAfterFlip);
            if (playerMove) {
              newBoardAfterFlip = checkFlip(
                lunar, 
                playerMove.x, 
                playerMove.y, 
                "Player", 
                setPiece(lunar, playerMove.x, playerMove.y, newBoardAfterFlip, "Player", playerHand[selected])
              );
            }
          }
        }

        const cards = drawFromDeck(lunar, deck, setDeck);
        const newEnemyHand = [...enemyHand];
        newEnemyHand[selectedMove.cardIndex] = cards[1];
        setEnemyHand(newEnemyHand);
      }
    }

    const { board: finalBoard, points: finalPoints } = await handleSpecialBoardEffects(
      lunar,
      newBoardAfterFlip,
      newPoints,
      "AI",
      setBoard,
      setPoints,
      pause
    );

    if (lunar === 4) { // Handle field changes for lunar modes 4 [for lunar 4]
      const newField = generateNewField();
      setField(newField);

      if (getAvailableSpots(finalBoard, newField).length === 0) {
        setGameOver(true);
        return;
      }
    }

    setCurrentPlayer("Player");
    setPoints(finalPoints);

    const playerCanMove = lunar === 9 
      ? finalBoard.some((row, x) => row.some((cell, y) => 
          cell.owner === "Player" && getAdjacentSpots(x, y, finalBoard).length > 0))
      : countPossible(lunar, finalBoard, newPlayerHand, selected, field) > 0;

    if (!playerCanMove) {
      setGameOver(true);
    }
  };

  // Movement-based turn [for lunar 9]
  const moveTurn = async (mx: number, my: number) => {
    const sx = Math.floor(selected/10);
    const sy = selected%10;

    if (Math.sqrt(Math.pow(mx - sx, 2) + Math.pow(my - sy, 2)) > 1.5) {
      return;
    }

    setSelected(-1);
    setCurrentPlayer("AI");
 
    let playerBoard = setPiece(lunar, mx, my, board, "Player", board[sx][sy].phase);
    playerBoard = setPiece(lunar, sx, sy, playerBoard, "", "Empty");

    let currentBoard = checkFlip(lunar, mx, my, "Player", playerBoard);
    currentBoard = handleDecay(currentBoard);
    let newPoints = confirmBoard(lunar, currentBoard, points, "Player", setBoard, setPoints);

    await pause(500);
    await handleAITurn(currentBoard, newPoints, true, playerHand);
  };

  // Card placement-based turn [for not lunar 9]
  const playTurn = async (mx: number, my: number) => {
    setCurrentPlayer("AI");
    const cards = drawFromDeck(lunar, deck, setDeck);

    let playerBoard = setPiece(lunar, mx, my, board, "Player", playerHand[selected]);
    setBoard(playerBoard);

    let currentBoard = lunar !== 1
      ? checkFlip(lunar, mx, my, "Player", playerBoard)
      : copyBoard(board);
    

    const newHand = [...playerHand];
    newHand[selected] = cards[0];
    setPlayerHand(newHand);
    let newSel = newHand.findIndex(card => card !== "Empty");
    setSelected(newSel);

    const { board: boardAfterEffects, points: newPoints } = await handleSpecialBoardEffects(
      lunar,
      currentBoard,
      points,
      "Player",
      (lunar != 1) ? setBoard : (board: Cell[][]) => setBoard(playerBoard),
      setPoints,
      pause
    );
    await handleAITurn(boardAfterEffects, newPoints, false, newHand,{ x: mx, y: my });

    if (!newHand.some(card => card !== "Empty")) {
      setGameOver(true);
    }
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div>
          <Select setLunar={setLunar} startGame={startGame} />
        </div>
      ):(
        <div className="gameScreen">
          <div className="header">
            <div className="button-container">
              <Help />
              <button onClick={() => setGameStarted(false)} className="button start">Return</button>
              <DarkMode />
            </div>
            <h1 className="gamemode">{MODES[(lunar)%MODES.length].name}</h1>
            <div className="stats">
              <h4 className="turn">{currentPlayer}'s Turn</h4>
              <h4 className="points">{points[0] + " vs " + points[1]}</h4>
              <h4 className="deck">{lunar == 9 ? "" : "Deck: " + deck.length}</h4>
            </div>
          </div>
          <Board
            lunar={lunar}
            board={board}
            neighbors={neighbors}
            field={field}
            playerHand={playerHand}
            selected={selected}
            handleCellClick={handleCellClick}
          />
          {gameOver ? (
            <div className="gameOver">
              <h2>Game Over</h2>
              <p>You {`${points[0]>points[1]?" Won": points[0]<points[1]?" Lost": " Tied"}`}</p>
            </div>
          ) : (
            lunar != 9 && (
              <Hand lunar={lunar} hand={playerHand} selected={selected} selectCard={selectCard} />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default App;
