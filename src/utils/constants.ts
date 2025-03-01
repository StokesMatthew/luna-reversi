import { Mode } from "../types";


export const MOON_PHASES = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Third Quarter",
    "Waning Crescent",
];

export const CARDINAL_DIRECTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const;

export const ALL_DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

export const HAND_SIZE: number = 3;

export const MOON_IMGS: { [key: string]: string } = {
    "Full Moon": "/img/fmoon.png",
    "Waxing Crescent": "/img/wxcres.png",
    "First Quarter": "/img/1quat.png",
    "Waxing Gibbous": "/img/wxgibb.png",
    "Waning Crescent": "/img/wncres.png",
    "Third Quarter": "/img/3quat.png",
    "Waning Gibbous": "/img/wngibb.png",
    "New Moon": "/img/new.png",
    "Empty": "/img/space.png",
    "Comet": "/img/comet.png",
    "Locked": "/img/lock.png",
    "Planet": "/img/planet.png",
};

export const MODES: Mode[] = [
    {
        "name": "Blue Moon",
        "desc": "Default mode"
    },
    {
      "name": "Wolf Moon",
      "desc": "Player & AI select a spot at the same time. If they select the same spot, it permanently becomes empty"
    },
    {
      "name": "Snow Moon",
      "desc": "Player & AI can not place a phase if it already exists in the row and column"
    },
    {
      "name": "Worm Moon",
      "desc": "9 bombs are hidden randomly on the board, each one worth -5 points. Each phase piece states how many neighbors (corner-inclusive) are bombs"
    },
    {
      "name": "Pink Moon",
      "desc": "Only a subsection of the board is available to be played on, it moves every round"
    },
    {
      "name": "Flower Moon",
      "desc": "Each piece gives 1 point per turn, but only last for 8 turns"
    },
    {
      "name": "Strawberry Moon",
      "desc": "4 Planet pieces are added to the board. Neighbor pieces (corner-exclusive) are worth double. Neighbors also spin clockwise"
    },
    {
      "name": "Buck Moon",
      "desc": "If a phase is placed and its opposing phase is adjacent (corner-exclusive), they both lock in place and can no longer flip"
    },
    {
      "name": "Sturgeon Moon",
      "desc": "All the pieces orbit around the center of the border"
    },
    {
      "name": "Corn Moon",
      "desc": "All the player & AI's pieces are already on the board. Instead of placing a piece on the board, they move one of their pieces to an adjacent cell"
    },
    {
      "name": "Hunter's Moon",
      "desc": "Player is unable to see the phase of the pieces played by AI, unless they have a piece neighboring it (corner-inclusive)"
    },
    {
      "name": "Beaver Moon",
      "desc": "Flipping a full moon sets all of its neighbors (corner-exclusive) to yours. Flipping a new moon sets all of its neighbors (corner-exclusive) to the opponent's"
    },
    {
      "name": "Cold Moon",
      "desc": "2 Comet pieces are added to the board, they move every round and destroy any piece in their way"
    }
  ]

export let DARK_MODE = true;

export const THEMES = {
  dark: {
    background: "#1a1a1a",
    primary: "#4a90e2",
    primaryHover: "#357ab7",
    text: "#ffffff",
    border: "#333333",
    shadow: "rgba(0, 0, 0, 0.3)"
  },
  light: {
    background: "#f4f4f4",
    primary: "#4a90e2",
    primaryHover: "#357ab7",
    text: "#333333",
    border: "#cccccc",
    shadow: "rgba(0, 0, 0, 0.1)"
  }
};
  