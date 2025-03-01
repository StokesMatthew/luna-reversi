import { Cell, Field, Player } from "../types";
import { CARDINAL_DIRECTIONS, MOON_PHASES } from "./constants";
import { isWithinBounds, copyBoard, getAdjacentSpots } from "./board";

// Checks if a cell can be flipped
export const checkFlip = (
  lunar: number,
  x: number,
  y: number,
  player: Player,
  board: Cell[][]
): Cell[][] => {
  let newBoard = copyBoard(board);
  
  if (lunar === 7) { // If adjacent cell has opposing phase, lock both cells [For lunar 7]
    for (const [dx, dy] of CARDINAL_DIRECTIONS) {
      const adjX = x + dx;
      const adjY = y + dy;

      if (isWithinBounds(adjX, adjY)) {
        const adjCell = newBoard[adjX][adjY];
        if (adjCell.phase === MOON_PHASES[(MOON_PHASES.indexOf(newBoard[x][y].phase) + 4) % 8] && !adjCell.trait.includes("Locked")) {
          newBoard[adjX][adjY].owner = player;
          newBoard[adjX][adjY].trait += "Locked";
          newBoard[x][y].trait += "Locked";
        }
      }
    }
  }

  let flippedCells: [number, number][] = [];

  for (const [dx, dy] of CARDINAL_DIRECTIONS) {
    let curX = x;
    let curY = y;
    let curPhase = newBoard[x][y].phase;
    let progression: 1 | -1 | null = null;

    while (true) {
      curX += dx;
      curY += dy;
      
      if (!isWithinBounds(curX, curY)) break;
      
      const cell = newBoard[curX][curY];
      
      if (
        cell.owner === player ||
        cell.phase === "Empty" ||
        cell.phase === "Comet" ||
        cell.phase === "Planet" ||
        cell.trait.includes("Locked")
      ) {
        break;
      }

      const currentIndex = MOON_PHASES.indexOf(curPhase);
      const nextIndex = MOON_PHASES.indexOf(cell.phase);
      
      if (progression === null) {
        if (currentIndex - nextIndex === 1 || (currentIndex === 0 && nextIndex === 7)) {
          progression = 1;
        } else if (currentIndex - nextIndex === -1 || (currentIndex === 7 && nextIndex === 0)) {
          progression = -1;
        } else {
          break;
        }
      } else {
        const isValidProgression = progression === 1
          ? (currentIndex - nextIndex === 1 || (currentIndex === 0 && nextIndex === 7))
          : (currentIndex - nextIndex === -1 || (currentIndex === 7 && nextIndex === 0));
          
        if (!isValidProgression) break;
      }
      
      newBoard[curX][curY] = {
        owner: player,
        phase: cell.phase,
        trait: cell.trait,
      };

      flippedCells.push([curX, curY]);
      curPhase = cell.phase;
    }
  }

  // If a full moon or new moon is flipped, flip all adjacent cells [For lunar 11]
  if (lunar === 11) { 
    for (const [fx, fy] of flippedCells) {
      const fCell = newBoard[fx][fy];
      
      if (fCell.phase === "Full Moon" || fCell.phase === "New Moon") {
        const newOwner = fCell.phase === "Full Moon" ? player : player === "Player" ? "AI" : "Player";
        newBoard[fx][fy].owner = newOwner;
      
        for (const [dx, dy] of CARDINAL_DIRECTIONS) {
          const adjX = fx + dx;
          const adjY = fy + dy;
      
          if (isWithinBounds(adjX, adjY)) {
            const adjCell = newBoard[adjX][adjY];
            if (
              adjCell.phase !== "Empty" &&
              adjCell.phase !== "Comet" &&
              !adjCell.trait.includes("Locked")
            ) {
              newBoard[adjX][adjY].owner = newOwner;
            }
          }
        }
      }
    }
  }

  return newBoard;
};

// Checks if a cell can be played
export const checkPossible = (
  lunar: number,
  x: number,
  y: number,
  hand: string[],
  selected: number,
  board: Cell[][],
  field: Field
): boolean => {
  
  // Only allow moves to empty cells adjacent to the selected piece [For lunar 9]
  if (lunar === 9 && selected !== -1) {
    const selectedX = Math.floor(selected / 10);
    const selectedY = selected % 10;
    
    if (board[x][y].phase !== "Empty") return false;

    return Math.abs(x - selectedX) <= 1 && Math.abs(y - selectedY) <= 1;
  }

  // If a phase is played and it already exists in the row or column, it can't be played [For lunar 2]
  if (lunar === 2) {
    const rowPhases = board[x].map(cell => cell.phase).filter(Boolean);
    const colPhases = board.map(row => row[y].phase).filter(Boolean);
    
    if (rowPhases.includes(hand[selected]) || colPhases.includes(hand[selected])) {
      return false;
    }
  }

  // If a cell is locked, a comet, a planet, or outside the field, it can't be played
  return !(board[x][y].trait.includes("Locked") || 
           board[x][y].phase === "Comet" ||
           board[x][y].phase === "Planet" ||
           x < field.minX || 
           x > field.maxX || 
           y < field.minY || 
           y > field.maxY);
};

// Counts the number of possible moves
export const countPossible = (
  lunar: number,
  board: Cell[][],
  hand: string[],
  selected: number,
  field: Field
): number => {
  let count = 0;
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      if (!board[x][y].trait.includes("Mine") && 
          board[x][y].phase === "Empty" && 
          checkPossible(lunar, x, y, hand, selected, board, field)) {
        count++;
      }
    }
  }
  return count;
};

// Sets a piece on the board
export const setPiece = (
  lunar: number,
  x: number,
  y: number,
  board: Cell[][],
  who: Player,
  what: string
): Cell[][] => {
  return handleDecay(copyBoard(board).map((row, rowIndex) => 
    rowIndex === x ? row.map((cell, colIndex) => 
      colIndex === y ? {
        owner: who,
        phase: what,
        trait: lunar === 5 ? cell.trait + "Decay16" : cell.trait,
      } : cell
    ) : row
  ));
};

// Handles decay [For lunar 5]
export const handleDecay = (board: Cell[][]): Cell[][] => {
  const newBoard = copyBoard(board);
  
  for (const row of newBoard) {
    for (const cell of row) {
      if (cell.trait.includes("Decay")) {
        const match = cell.trait.match(/Decay(\d+)/);
        if (match) {
          const number = Number(match[1]);
          if (number <= 0) {
            cell.owner = "";
            cell.phase = "Empty";
            cell.trait = cell.trait.replace(/Decay\d+/g, "").trim();
          } else {
            cell.trait = cell.trait.replace(/Decay\d+/g, `Decay${number - 1}`);
          }
        }
      }
    }
  }
  return newBoard;
};

// Confirms the board
export const confirmBoard = (
  lunar: number,
  board: Cell[][],
  points: number[],
  who: Player | "",
  setBoard: (board: Cell[][]) => void,
  setPoints: (points: number[]) => void
): number[] => {
  const [playerCount, aiCount] = getPoints(lunar, board, points, who);
  setPoints([playerCount, aiCount]);
  setBoard(board);

  return [playerCount, aiCount];
};

// Gets the points
export const getPoints = (
  lunar: number,
  board: Cell[][],
  points: number[],
  who: Player | ""
): number[] => {
  let playerCount = 0;
  let aiCount = 0;

  const planetNeighbors = board.flatMap((row, i) => 
    row.flatMap((val, j) => 
      val.phase === "Planet" 
        ? CARDINAL_DIRECTIONS.map(([dx, dy]) => [i + dx, j + dy])
          .filter(([ni, nj]) => isWithinBounds(ni, nj))
        : []
    )
  );

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const cell = board[x][y];
      let value = cell.trait.includes("Mine") ? -5 : 1;

      if (planetNeighbors.some(([ni, nj]) => ni === x && nj === y)) {
        value += 1;
      }

      if (cell.owner === "Player") playerCount += value;
      else if (cell.owner === "AI") aiCount += value;
    }
  }

  if (lunar === 5) {
    playerCount = who === "Player" ? playerCount + points[0] : points[0];
    aiCount = who === "AI" ? aiCount + points[1] : points[1];
  }

  return [playerCount, aiCount];
};

// Counts the pieces by owner
export const countPiecesByOwner = (board: Cell[][]): Record<Player, number> => {
  const scores = { "Player": 0, "AI": 0, "": 0 } as Record<Player, number>;
  
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const cell = board[x][y];
      if (cell.owner === "") continue;

      const isNextToPlanet = CARDINAL_DIRECTIONS.some(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        return isWithinBounds(newX, newY) && board[newX][newY].phase === "Planet";
      });

      let points = 1;
      if (cell.trait.includes("Mine")) {
        points = -5;
      } else if (isNextToPlanet) {
        points = 2;
      }

      scores[cell.owner] += points;
    }
  }

  return scores;
};

// Evaluates the board state
export const evaluateBoard = (board: Cell[][], player: Player): number => {
  const counts = countPiecesByOwner(board);
  const opponent = player === "Player" ? "AI" : "Player";
  return counts[player] - counts[opponent];
};

// Finds the best AI move
export interface AIMove {
  from?: [number, number];
  to: [number, number];
  cardIndex?: number;
  score: number;
}

export const findBestAIMove = (
  lunar: number,
  currentBoard: Cell[][],
  points: number[],
  isMovement: boolean,
  aiPieces?: [number, number][],
  availableSpots?: [number, number][],
  enemyHand?: string[]
): AIMove[] => {
  let bestScore = -Infinity;
  let bestMoves: AIMove[] = [];

  // Movement-based AI logic [for lunar  9]
  if (isMovement && aiPieces) {
    for (const [fromX, fromY] of aiPieces) {
      const adjacentSpots = getAdjacentSpots(fromX, fromY, currentBoard);

      for (const [toX, toY] of adjacentSpots) {
        const boardCopy = copyBoard(currentBoard);
        boardCopy[toX][toY] = { ...boardCopy[fromX][fromY] };
        boardCopy[fromX][fromY] = { owner: "", phase: "Empty", trait: "" };
        
        const simulatedBoard = checkFlip(lunar, toX, toY, "AI", boardCopy);
        const score = evaluateBoard(simulatedBoard, "AI");

        if (score >= bestScore) {
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [];
          }
          bestMoves.push({ from: [fromX, fromY], to: [toX, toY], score });
        }
      }
    }
    
  } else if (availableSpots && enemyHand) { // Card placement-based AI logic [for not lunar 9]
    const field = { minX: 0, minY: 0, maxX: 7, maxY: 7 };
    
    for (const [x, y] of availableSpots) {
      enemyHand.forEach((card, index) => {
        if (card === "Empty") return;
        
        // Check if the move is valid according to all game rules, including lunar 2
        if (!checkPossible(lunar, x, y, enemyHand, index, currentBoard, field)) return;
        
        const boardCopy = copyBoard(currentBoard);
        boardCopy[x][y] = { owner: "AI", phase: card, trait: boardCopy[x][y].trait };
        const simulatedBoard = checkFlip(lunar, x, y, "AI", boardCopy);
        const score = evaluateBoard(simulatedBoard, "AI");

        if (score >= bestScore) {
          if (score > bestScore) {
            bestScore = score;
            bestMoves = [];
          }
          bestMoves.push({ to: [x, y], cardIndex: index, score });
        }
      });
    }
  }

  return bestMoves;
};
  