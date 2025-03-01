export type Player = "Player" | "AI" | "";

export type Cell = {
  owner: Player;
  phase: string;
  trait: string;
};

export type Field = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type Mode = {
  name: string;
  desc: string;
};