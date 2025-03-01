import React, { useState, useEffect } from "react";
import { getMoonImage } from "../../utils/images";
import "./Hand.css";

interface HandProps {
  lunar: number;
  hand: string[];
  selected: number;
  selectCard: (index: number) => void;
}

const Hand: React.FC<HandProps> = ({ lunar, hand, selected, selectCard }) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = hand.map(card => {
        if (card !== "Empty") {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.src = getMoonImage(lunar, card);
          });
        }
        return Promise.resolve();
      });

      await Promise.all(imagePromises);
      setImagesLoaded(true);
    };

    loadImages();
  }, [hand, lunar]);

  return (
    <div className={`hand ${imagesLoaded ? 'loaded' : ''}`}>
      {hand.map((card, index) => (
        <div
          key={index}
          className={`card ${selected === index ? "selected" : ""}`}
          onClick={() => selectCard(index)}
        >
          {card !== "Empty" && (
            <div className="card-contain">
              {selected === index && (
                <div className="card-contain">
                  <img 
                    className="card background glower"
                    src={"/img/selected.png"} 
                    alt={card} 
                  />
                  <img 
                    className="card background"
                    src={"/img/selected.png"} 
                    alt={card} 
                  />
                </div>
              )}
              <img 
                className={`card foreground ${selected === index ? "selected" : ""}`}
                src={getMoonImage(lunar, card)}
                alt={card}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Hand;
