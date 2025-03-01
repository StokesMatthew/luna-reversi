import React, { useState } from 'react';
import './Help.css';

const Help: React.FC = () => {
    const [showInstructions, setShowInstructions] = useState(false);

    return (
        <>
            {showInstructions && (
                <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-button" onClick={() => setShowInstructions(false)}>×</button>
                        <h2>How to Play</h2>
                        <div className="instructions-content">
                            <ul className="instructions-list">
                                <li>Take turns placing moon phase pieces on the 8x8 board against an AI opponent</li>
                                <li>When a sequence in the moon phase cycle is made, all opponent pieces within the sequence are captured</li> 
                                <li>Each mode adds unique rules and challenges that modify these base mechanics</li>
                            </ul>
                            <img src={"/img/guide.png"} alt="Guide" style={{ width: "100%", height: "auto" }}/>
                            <p>Select a game mode and click Start to begin!</p>
                        </div>
                    </div>
                </div>
            )}
            <button className="button" onClick={() => setShowInstructions(true)}>
                ❔
            </button>
        </>
    );
};

export default Help; 