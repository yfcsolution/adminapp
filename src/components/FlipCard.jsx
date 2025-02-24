import React, { useState } from "react";

const FlipCard = () => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => setFlipped(!flipped);

  return (
    <div
      className={`card w-40 h-40 perspective cursor-pointer`}
      onClick={handleFlip}
    >
      <div
        className={`card__content relative p-20 transition-transform duration-700 ${
          flipped ? "rotate-y-180" : ""
        } text-white font-bold text-center`}
      >
        {/* Front Side */}
        <div className="card__front absolute inset-0 bg-pink-600 flex items-center justify-center">
          <h2>Front</h2>
        </div>
        {/* Back Side */}
        <div className="card__back absolute inset-0 bg-teal-500 flex items-center justify-center rotate-y-180">
          <h2>Back</h2>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
