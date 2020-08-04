import React, { useState, useEffect, memo, useMemo } from 'react';
import useGame from './useGame';

import { Container, Header, CardBase, Title, Button, CardZone, Card, HintArea } from '../Styled';
import { to } from 'react-spring';
import { images } from './func';

function Game() {
  const {
    magnifier,
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

  const Hint = useMemo(() => {
    return hintProps.map(({ x, y, display }, i) => {
      return <HintArea key={i} style={{ display, top: y, left: x }} magnifier={magnifier} />;
    });
  }, [magnifier]);

  const Cardset = useMemo(() => {
    return cardsProps.map(({ x, y, shadow, zIndex }, i) => {
      const card = flatCards.find(c => c.springId == i);
      return (
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
          magnifier={magnifier}
        />
      );
    });
  }, [flatCards, magnifier]);

  return (
    <Container magnifier={magnifier}>
      <Title magnifier={magnifier}>Freecell</Title>
      <Button style={{ position: 'absolute', right: 0, top: 0 }} magnifier={magnifier} onClick={newGame}>
        <img src={require('../../assets/icon/Menu.svg')} />
      </Button>
      <Button style={{ position: 'absolute', left: 0, bottom: 0 }} magnifier={magnifier}>
        <img src={require('../../assets/icon/Hint.svg')} />
      </Button>
      <Button style={{ position: 'absolute', right: 0, bottom: 0 }} magnifier={magnifier} onClick={undo}>
        <img src={require('../../assets/icon/Back.svg')} />
      </Button>
      <Header magnifier={magnifier}>
        <div style={{ flex: '0 1 50%', textAlign: 'right' }}>
          {cardsRecRef.current.length === 0 ? 0 : cardsRecRef.current.length - 1}
        </div>
        <img src={require('../../assets/icon/Diamond.svg')} style={{ height: '16px', margin: '0 .625rem' }} />
        <div style={{ flex: '0 1 50%' }}>
          {Math.floor(timer / 60)} : {timer % 60}
        </div>
      </Header>

      <CardZone magnifier={magnifier}>
        {cells.map((_, ci) => (
          <CardBase key={ci} magnifier={magnifier} />
        ))}

        {foundation.map((_, ci) => (
          <CardBase key={ci} magnifier={magnifier} text="A" />
        ))}
      </CardZone>
      <CardZone ref={cardZoneRef} magnifier={magnifier}>
        {Hint}
        {Cardset}
      </CardZone>
    </Container>
  );
}

// const Hint = memo(({ hintProps }) => {
//   return hintProps.map(({ x, y, display }, i) => {
//     return <HintArea key={i} style={{ display, top: y, left: x }} />;
//   });
// });

// const Cardset = memo(({ cardsProps = [], flatCards, bindGesture, handleAutoMove }) => {
//   console.log('rendering', cardsProps);
//   return cardsProps.map(({ x, y, shadow, zIndex }, i) => {
//     const card = flatCards.find(c => c.springId == i);
//     return (
//       <>
//         <Card
//           className="card"
//           key={i}
//           {...bindGesture(card)}
//           onDoubleClick={() => handleAutoMove(card)}
//           style={{
//             // backgroundImage: `url(${images[card.cardname]})`,
//             transform: to([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
//             zIndex: zIndex.to(zIndex => zIndex * (card.seq + 1)),
//             filter: shadow.to(shadow => (shadow ? `drop-shadow(8px 8px 10px #000)` : '')),
//           }}
//         />
//       </>
//     );
//   });
// });

export default Game;
