import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSprings, animated, interpolate, useSpring, config } from 'react-spring';
import { useDrag, useScroll, useGesture } from 'react-use-gesture';

import { suitType, nums, isCardMatch, cardset, images, newGame, initto, initfrom, getCardPosition } from './func';
import { FreeCardZone, CardZone, Card } from '../Styled';
import { useResize } from '../../hooks/useResize';

function Game() {
  // * 計算頁面補差值
  const cardZoneRef = useRef(null);
  const cardZoneOffsetRef = useRef({
    offsetTop: cardZoneRef.current?.offsetTop,
    offsetLeft: cardZoneRef.current?.offsetLeft,
  });

  useEffect(() => {
    handleResize();
  }, [cardZoneRef]);

  const handleResize = useCallback(() => {
    cardZoneOffsetRef.current = {
      offsetTop: cardZoneRef.current?.offsetTop,
      offsetLeft: cardZoneRef.current?.offsetLeft,
    };
  }, []);
  useResize(handleResize);

  //* 卡片設定區
  const dragOffset = useRef([0, 0]);
  const [cards, setCards] = useState(newGame);
  const cardsFlat = useMemo(() => cards.cardset.flat(), [cards.cardset]);
  const maxDragLength = useMemo(() => {
    const cell = 4 - cards.cells.length;
    const group = cards.cardset.filter(g => g.length === 0).length;
    return cell + group + 1;
  }, [cards]);
  const isSuitValidBeforeDrag = useCallback(
    (group, seq) => {
      const groupset = cards.cardset[group];
      // * 最底一張可移動
      if (seq === groupset.length) return true;
      // * 花色match 才可移動
      for (let i = seq; i < groupset.length; i++) {
        const isMatched = isCardMatch(groupset[i - 1], groupset[i]);
        if (isMatched && i === groupset.length - 1) return true;
      }
      return false;
    },
    [cards]
  );
  useEffect(() => {
    // TODO Fixed Position
    // set(index => {})
    console.log('Card changes');
  }, [cards]);

  // * 設定動畫
  const [props, set, stop] = useSprings(cardsFlat.length, i => ({ ...initto(i), from: initfrom(i) }));

  // * 綁定手勢操作
  const bind = useGesture({
    // onHover: ({ hovering, down, args: [fromCard], xy: [x, y], event }) => {},
    onDragStart: ({ down, args: [{ group, seq, springId }], xy: [x, y], event }) => {
      if (seq <= cards.cardset[group].length - maxDragLength) return;
      if (!isSuitValidBeforeDrag(group, seq)) return;

      const card = event?.target ?? undefined;
      const lox = x - card?.getBoundingClientRect().left;
      const loy = y - card?.getBoundingClientRect().top;
      dragOffset.current = [lox, loy];

      set(
        index =>
          index === springId && {
            shadow: true,
          }
      );
    },
    onDrag: ({ down, args: [{ group, seq, springId }], xy: [x, y], event }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      // TODO when hover && matched => hightlight
      // const card = event?.target ?? undefined;
      // card.hidden = true;
      // const el = document.elementFromPoint(x, y);
      // card.hidden = false;
      // const hoverCard = el.closest('.card');
      // // console.log(x, y, hoverCard);
      // if (hoverCard && hoverCard !== card) {
      //   console.log(hoverCard);
      // }

      const groupset = cards.cardset[group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      set(index => {
        const matchedCard = controlCards.find(c => c.springId === index);

        return (
          matchedCard && {
            x: x - lox - cardZoneOffsetRef.current?.offsetLeft,
            y: y - loy - cardZoneOffsetRef.current?.offsetTop + (matchedCard.seq - seq) * 30,
            immediate: down,
          }
        );
      });
    },
    onDragEnd: ({ down, args: [{ group, seq, springId }], xy: [x, y], event }) => {
      dragOffset.current = [0, 0];

      if (false) {
        // TODO  move matched
        // setCards();
      } else {
        const groupset = cards.cardset[group];
        const controlCards = groupset.filter(g => g.seq >= seq);
        set(index => {
          const matchedCard = controlCards.find(c => c.springId === index);

          if (matchedCard) {
            const { x: posX, y: posY } = getCardPosition(matchedCard);
            return { shadow: false, x: posX, y: posY, delay: 20 * (matchedCard.seq - seq) };
          }
        });
      }
    },
  });

  return (
    <>
      <CardZone>
        <FreeCardZone />
        <FreeCardZone />
        <FreeCardZone />
        <FreeCardZone />
        <FreeCardZone>A</FreeCardZone>
        <FreeCardZone>A</FreeCardZone>
        <FreeCardZone>A</FreeCardZone>
        <FreeCardZone>A</FreeCardZone>
      </CardZone>
      <CardZone ref={cardZoneRef}>
        {console.log(cards)}
        {props.map(({ x, y, shadow }, i) => {
          const card = cardsFlat.find(c => c.springId == i);

          return (
            <Card
              className="card"
              key={i}
              {...bind(card)}
              style={{
                transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                backgroundImage: `url(${images[card?.cardname]})`,
                filter: interpolate([shadow], s => (s ? `drop-shadow(8px 8px 10px #000)` : '')),
              }}
            />
          );
        })}
      </CardZone>
    </>
  );
}

export default Game;
