import React, { useState } from "react";
import { MODES } from "../../utils/constants";
import { Mode } from "../../types";
import Help from "../help/Help";
import "./Select.css";
import DarkMode from "../dark-mode/DarkMode";
const DISPLAY: number = 3;

interface SelectProps {
    setLunar: (lunar: number) => void;
    startGame: () => void;
}

const Select: React.FC<SelectProps> = ({ setLunar, startGame }) => {
    const disSet = (DISPLAY-1)*2+1;
    const [startIndex, setStartIndex] = useState((MODES.length - DISPLAY + 1) % MODES.length);

    const handleMoveLeft = () => {
        setStartIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : MODES.length - 1));
    };

    const handleMoveRight = () => {
        setStartIndex((prevIndex) => (prevIndex < MODES.length - 1 ? prevIndex + 1 : 0));
    };

    const handleStartGame = () => {
        setLunar((startIndex+(Math.floor(disSet/2)))%MODES.length);
        startGame();
    };

    const getDisplayedModes = () => {
        const totalModes = MODES.length;
        const endIndex = startIndex + disSet;
        
        if (endIndex <= totalModes) {
            return MODES.slice(startIndex, endIndex);
        } else {
            const firstPart = MODES.slice(startIndex);
            const secondPart = MODES.slice(0, (startIndex + disSet) % totalModes);
            return [...firstPart, ...secondPart];
        }
    };

    return (
        <div className="start-screen">
            <h1 className="title">Luna Reversi</h1>
            <h1 className="subtitle">Select Game Mode</h1>
            <div className="arrow-container">
                <button className="arrow left" onClick={handleMoveLeft}>←</button>
            </div>
            <div className="square-container">
                {getDisplayedModes().map((mode: Mode, index: number) => (
                    <div
                        key={index}
                        className={`square ${index === Math.floor(disSet / 2) ? 'center' : ''}`}
                        style={{
                            opacity: (1-Math.abs(index-Math.floor(disSet/2))*(1/disSet*2)),
                            position: 'relative',
                            top: (`${Math.abs(index-Math.floor(disSet/2))*55}px`)
                          }}
                    >
                        <div className="square-name">{mode.name}</div>
                        <div className="square-desc">{mode.desc}</div>
                    </div>
                ))}
            </div>
            <div className="arrow-container">
                <button className="arrow right" onClick={handleMoveRight}>→</button>
            </div>
            <div className="button-container">
                <Help />
                <button className="button start" onClick={handleStartGame}>
                    Start
                </button>
                <DarkMode />
            </div>
        </div>
    );
};

export default Select;
