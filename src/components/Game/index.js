import React, { useState, useEffect, memo } from 'react';
import useGame from './useGame';

import { CardBase, CardZone, Card, HintArea } from '../Styled';
import { to } from 'react-spring';
import { images } from './func';

function Game() {
  const {
    timer,
    cards,
    cardsRecRef,
    cardZoneRef,
    cardsProps,
    flatCards,
    hintProps,
    handleAutoMove,
    bindGesture,
    undo,
    newGame,
    reStart,
  } = useGame();

  const { cardset, cells, foundation } = cards;

  return (
    <>
      <button onClick={reStart}>CLICK ME</button>
      {timer}
      <CardZone>
        {cells.map((_, ci) => (
          <CardBase key={ci} />
        ))}

        {foundation.map((_, ci) => (
          <CardBase key={ci} text="A" />
        ))}
      </CardZone>
      <CardZone ref={cardZoneRef}>
        <Hint hintProps={hintProps} />
        <Cardset
          cardsProps={cardsProps}
          flatCards={flatCards}
          bindGesture={bindGesture}
          handleAutoMove={handleAutoMove}
        />
      </CardZone>
    </>
  );
}

const Hint = memo(({ hintProps }) => {
  return hintProps.map(({ x, y, display }, i) => {
    return <HintArea key={i} style={{ display, top: y, left: x }} />;
  });
});

const Cardset = memo(({ cardsProps = [], hintProps = [], flatCards, bindGesture, handleAutoMove }) => {
  return cardsProps.map(({ x, y, shadow, zIndex }, i) => {
    const card = flatCards.find(c => c.springId == i);

    return (
      <>
        <Card
          className="card"
          key={i}
          {...bindGesture(card)}
          onDoubleClick={() => handleAutoMove(card)}
          style={{
            backgroundImage: `url(${images[card.cardname]})`,
            transform: to([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
            zIndex: zIndex.to(zIndex => zIndex * (card.seq + 1)),
            filter: shadow.to(shadow => (shadow ? `drop-shadow(8px 8px 10px #000)` : '')),
          }}
        />
      </>
    );
  });
});

export default Game;
