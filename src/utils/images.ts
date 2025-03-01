import { MOON_IMGS } from "./constants";
import { Cell } from "../types";

// Preload all moon images
export const preloadImages = () => {
    Object.values(MOON_IMGS).forEach(url => {
        const img = new Image();
        img.src = url;
    });
    const img = new Image();
    img.src = "/img/guide.png";
}; 

// Get moon image for a cell
export const getMoonImage = (
    lunar: number,
    phase: string,
    board?: Cell[][],
    pos?: number[]
  ): string => {
    if (phase in MOON_IMGS) {
      if (
        lunar === 10 &&
        pos &&
        board &&
        board[pos[0]] &&
        board[pos[0]][pos[1]] &&
        board[pos[0]][pos[1]].owner !== "Player"
      ) {
        let test = true;
        if (pos && board) {
          const [x, y] = pos;
          const neighborsPos = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ].map(([dx, dy]) => [x + dx, y + dy]);
          for (const [nx, ny] of neighborsPos) {
            if (board[nx] && board[nx][ny] && board[nx][ny].owner === "Player") {
              test = false;
              break;
            }
          }
        }
        if (test && board[pos[0]][pos[1]].phase !== "Empty") {
          return "/img/unknown.png";
        }
      }
      return MOON_IMGS[phase as keyof typeof MOON_IMGS];
    }
    return "/img/space.png";
  };