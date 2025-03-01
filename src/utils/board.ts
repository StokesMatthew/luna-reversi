import { Cell, Field, Player } from "../types";
import { ALL_DIRECTIONS, CARDINAL_DIRECTIONS, MOON_PHASES } from "./constants";
import { confirmBoard } from "./moves";

// Places a certain number of pieces on the board [For lunar 3, 6, 12]
export const presetPieces = (lunar: number, board: Cell[][], type: Cell, count: number, dis: number, min: [number, number], max: [number, number]): Cell[][] => {
    let placed = 0;
    let positions: [number, number][] = [];

    while (placed < count) {
        let x = Math.floor(min[0] + Math.random() * (max[0] - min[0] + 1));
        let y = Math.floor(min[1] + Math.random() * (max[1] - min[1] + 1));

        let isValid = true;

        for (const [placedX, placedY] of positions) {
            let distance = Math.sqrt(Math.pow(x - placedX, 2) + Math.pow(y - placedY, 2));
            if (distance < dis) {
                isValid = false;
                break;
            }
        }

        if (isValid && 
            x >= min[0] && x <= max[0] && 
            y >= min[1] && y <= max[1] && 
            board[x][y].phase === "Empty") {
            board[x][y] = { ...type };
            positions.push([x, y]);
            placed++;
        }
    }

    return board;
};

// Sets up the board for the game
export const setUpBoard = (
    lunar: number,
    setBoard: (board: Cell[][]) => void,
    setNeighbors: (neighbors: number[][]) => void,
    ) => {
    let newBoard: Cell[][] = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => ({ owner: "", phase: "Empty", trait: "" }))
    );

    if (lunar == 3) { // Place 6-10 mines [For lunar 3]
        newBoard = presetPieces(lunar, newBoard, {owner: "", phase: "Empty", trait: "Mine"}, 6+Math.floor(Math.random()*4), 0, [0, 0], [7, 7]);

        const newNeighbors: number[][] = newBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => countNeighbors(lunar, rowIndex, colIndex, newBoard))
        );
        setNeighbors(newNeighbors);

    }else if (lunar == 6) { // Place 4 planets [For lunar 6]
        newBoard = presetPieces(lunar, newBoard, {owner: "", phase: "Planet", trait: ""}, 4, 3, [1, 1], [6, 6]);

    }else if (lunar == 9) { // Place 8 pieces for player & AI on the board [For lunar 9]
        const distance = (x1: number, y1: number, x2: number, y2: number): number =>
          Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
      
          const isValidPlacement = (x: number, y: number, owner: Player): boolean => {
          for (let i = 0; i < 8; i++) {
              for (let j = 0; j < 8; j++) {
                if (newBoard[i][j].owner !== "" && newBoard[i][j].owner !== owner) {
                    if (distance(x, y, i, j) < 1.6) return false;
                }
              }
          }
          return true;
        };
        
        const placeCells = (owner: Player, count: number) => {
          let placed = 0;
          while (placed < count) {
              const x = Math.floor(Math.random() * 8);
              const y = Math.floor(Math.random() * 8);
      
              if (newBoard[x][y].owner === "" && isValidPlacement(x, y, owner)) {
              newBoard[x][y].owner = owner;
              newBoard[x][y].phase = MOON_PHASES[placed];
              placed++;
              }
          }
        };

        placeCells("Player", 8);
    
        placeCells("AI", 8);

    }else if (lunar == 12) { // Place 2 comets [For lunar 12]
        newBoard = presetPieces(lunar, newBoard, {owner: "", phase: "Comet", trait: ""}, 2, 0, [0, 0], [7, 7]);

    }

    setBoard(newBoard);
};

// Counts the number of mines around a cell [For lunar 3]
export const countNeighbors = (
    lunar: number,
    x: number,
    y: number,
    board: Cell[][]
    ): number => {
    let count = 0;
    if (board[x] && board[x][y]) {
        for (const [nx, ny] of getAdjacentSpots(x, y, board)) {
          if (
              board[nx] &&
              board[nx][ny] &&
              board[nx][ny].trait.includes("Mine")
          ) {
              count++;
          }
        }
    }
    return count;
};

// Rotates the board around the center1 unit counter-clockwise [For lunar 8]
export const rotateBoard = (board: Cell[][]): Cell[][] => {
    const size = board.length;
    const newBoard = board.map(row => [...row]);

    const layers = Math.floor(size / 2);

    for (let layer = 0; layer < layers; layer++) {
        let start = layer, end = size - layer - 1;

        for (let i = start; i < end; i++) {
          newBoard[start][i + 1] = board[start][i];
        }
        for (let i = start; i < end; i++) {
          newBoard[i + 1][end] = board[i][end];
        }
        for (let i = end; i > start; i--) {
          newBoard[end][i - 1] = board[end][i];
        }
        for (let i = end; i > start; i--) {
          newBoard[i - 1][start] = board[i][start];
        }
    }

    return newBoard;
};

// Moves the comets to an adjacent empty spot
export const moveComets = (board: Cell[][]): Cell[][] => {
    const numRows = board.length;
    const numCols = board[0].length;

    const getAdjacentPositions = (x: number, y: number): [number, number][] => {
        const adjacentPositions: [number, number][] = [];
        for (const [dx, dy] of ALL_DIRECTIONS) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols && board[newX][newY].phase !== "Comet") {
              adjacentPositions.push([newX, newY]);
          }
        }
        return adjacentPositions;
    };

    const cometPositions: [number, number][] = [];
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
        if (board[i][j].phase === "Comet") {
            cometPositions.push([i, j]);
        }
        }
    }

    let newBoard = [...board];
    cometPositions.forEach(([x, y]) => {
        const adjacentPositions = getAdjacentPositions(x, y);
        if (adjacentPositions.length > 0) {
        const [newX, newY] = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
        newBoard[x][y] = {owner: "", phase: "Empty", trait: board[x][y].trait};
        newBoard[newX][newY] = {owner: "", phase: "Comet", trait: board[newX][newY].trait};
        }
    });

    return newBoard;
};

// Rotates the neighbors of the planet cells
export const rotatePlanetNeighbors = (board: Cell[][]): Cell[][] => {
    const rows = board.length;
    const cols = board[0].length;
  
    const rotateClockwise = (surrounding: Cell[]): Cell[] => {
      const rotated: Cell[] = [];
      rotated.push(surrounding[1], surrounding[2], surrounding[4], surrounding[0], surrounding[7], surrounding[3], surrounding[5], surrounding[6]);
      return rotated;
    };
  
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (board[i][j].phase === "Planet") {
          const surrounding: Cell[] = [];
          for (let x = i - 1; x <= i + 1; x++) {
            for (let y = j - 1; y <= j + 1; y++) {
              if (
                x >= 0 && x < rows &&
                y >= 0 && y < cols &&
                (x !== i || y !== j)
              ) {
                surrounding.push(board[x][y]);
              }
            }
          }
  
          const rotatedSurrounding = rotateClockwise(surrounding);
  
          let idx = 0;
          for (let x = i - 1; x <= i + 1; x++) {
            for (let y = j - 1; y <= j + 1; y++) {
              if (
                x >= 0 && x < rows &&
                y >= 0 && y < cols &&
                (x !== i || y !== j)
              ) {
                newBoard[x][y] = { ...rotatedSurrounding[idx] };
                idx++;
              }
            }
          }
        }
      }
    }
  
    return newBoard;
  };
  
// Common utility to check if coordinates are within board bounds
export const isWithinBounds = (x: number, y: number, boardSize: number = 8): boolean => {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
};

// Common utility to get adjacent spots
export const getAdjacentSpots = (x: number, y: number, board: Cell[][], diagonals: boolean = true): [number, number][] => {
  const directions = diagonals ? ALL_DIRECTIONS : CARDINAL_DIRECTIONS;
  
  return directions
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(([newX, newY]) => 
      isWithinBounds(newX, newY) && 
      board[newX][newY].phase === "Empty"
    ) as [number, number][];
};

// Common utility to get available spots within a field
export const getAvailableSpots = (board: Cell[][], field: Field): [number, number][] => {
  let availableSpots: [number, number][] = [];
  for (let x = field.minX; x <= field.maxX; x++) {
    for (let y = field.minY; y <= field.maxY; y++) {
      if (board[x][y].owner === "") {
        availableSpots.push([x, y]);
      }
    }
  }
  return availableSpots;
};

// Common utility to copy board state
export const copyBoard = (board: Cell[][]): Cell[][] => {
  return board.map(row => row.map(cell => ({ ...cell })));
};

// Utility to generate new field dimensions
export const generateNewField = (): Field => {
  let x1, x2, y1, y2;
  do {
    x1 = Math.floor(Math.random() * 7);
    x2 = Math.floor(Math.random() * (7 - x1)) + x1;
    y1 = Math.floor(Math.random() * 7);
    y2 = Math.floor(Math.random() * (7 - y1)) + y1;
  } while ((x2 - x1 + 1) * (y2 - y1 + 1) < 16);

  return { minX: x1, minY: y1, maxX: x2, maxY: y2 };
};

// Utility for animation pauses
export const pause = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Utility to handle special board effects after a turn
export interface SpecialEffectResult {
  board: Cell[][];
  points: number[];
}

export const handleSpecialBoardEffects = async (
  lunar: number,
  board: Cell[][],
  points: number[],
  who: Player,
  setBoard: (board: Cell[][]) => void,
  setPoints: (points: number[]) => void,
  pause: (ms: number) => Promise<void>
): Promise<SpecialEffectResult> => {
  let currentBoard = copyBoard(board);
  let currentPoints = [...points];

  setBoard(currentBoard);
  currentPoints = confirmBoard(lunar, currentBoard, currentPoints, who, setBoard, setPoints);
  setPoints(currentPoints);

  if (lunar === 12) {
    await pause(500);
    currentBoard = moveComets(currentBoard);
    currentPoints = confirmBoard(lunar, currentBoard, currentPoints, who, setBoard, setPoints);
  }

  if (lunar === 8) {
    await pause(500);
    currentBoard = rotateBoard(currentBoard);
    currentPoints = confirmBoard(lunar, currentBoard, currentPoints, who, setBoard, setPoints);
  }

  if (lunar === 6) {
    await pause(500);
    currentBoard = rotatePlanetNeighbors(currentBoard);
    currentPoints = confirmBoard(lunar, currentBoard, currentPoints, who, setBoard, setPoints);
  }

  if (who === "Player") { // Don't pause after AI's turn. just makes the game faster
    await pause(500);
  }

  return { board: currentBoard, points: currentPoints };
};
  