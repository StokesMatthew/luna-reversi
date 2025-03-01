import { MOON_PHASES } from "./constants";

// Initializes the deck. 8 cards of each phase
export const initializeDeck = (): string[] => {
    const deck: string[] = [];
    MOON_PHASES.forEach((phase) => {
        for (let i = 0; i < 8; i++) {
         deck.push(phase);
        }
    });
    return deck;
};

// Shuffles the deck
export const shuffleDeck = (deck: string[]): string[] => {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

// Draws 2 cards from the deck
export const drawFromDeck = (
    lunar: number,
    deck: string[],
    setDeck: (deck: string[]) => void
    ): string[] => {
    if (deck.length === 0) {
        return ["Empty", "Empty"];
    }
    const drawnPhase = [deck[deck.length - 1], deck[deck.length - 2]];
    setDeck(deck.slice(0, deck.length - 2));
    return drawnPhase;
};