import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSprings, animated, to, useSpring, config } from 'react-spring';
import { useDrag, useScroll, useGesture } from 'react-use-gesture';
import { CardBase, CardZone, Card, HintArea } from '../Styled';
import { useResize } from '../../hooks/useResize';
import { enums } from '../../utils';
import useGameSize from './useGameSize';

import {
  suitType,
  nums,
  isCardMatch,
  cardset,
  images,
  newGame,
  initto,
  initfrom,
  getCardPosition,
  getGroupRange,
  getMatchedGroup,
} from './func';

function Game() {
  const { cardPosition, cardZoneRef, cardZoneOffsetRef } = useGameSize();

  //* 卡片設定區
  const dragOffset = useRef([0, 0]);
  const [cards, setCards] = useState(newGame);
  const flatCards = useMemo(() => cards.cardset.flat(), [cards.cardset]);
  const maxDragLength = useMemo(() => {
    const cell = 4 - cards.cells.length;
    const group = cards.cardset.filter(g => g?.length === 0).length;
    return cell + group + 1;
  }, [cards]);
  const isSuitValidBeforeDrag = useCallback(
    (group, seq) => {
      const groupset = cards.cardset[group];
      // * 最底一張可直接移動
      if (seq === groupset.length - 1) return true;
      // * 花色match 才可移動 => 產生一個 seq 依序開頭 需要比對 n -1 次長度的陣列 => 都matched ? true : false
      return enums(groupset.length - seq - 1, seq).every(i => isCardMatch(groupset[i], groupset[i + 1]));
    },
    [cards]
  );

  const isCardBaseFree = useCallback(
    ({ group, seq }) => {
      console.log(group);
      return true;
    },
    [cards]
  );
  const getHintPosition = useCallback(
    (dragCard, cardPosition) => {
      const [x, y] = cardPosition;
      const [result] = getMatchedGroup(cardPosition);
      const { groupId, seq } = result;

      if (y > 0) {
        const [hoverCard] = cards.cardset[groupId].slice(-1);
        const hintPosition = getCardPosition(hoverCard);

        if (isCardMatch(hoverCard, dragCard))
          return {
            toGroup: groupId,
            toSeq: null,
            spring: {
              ...hintPosition,
              display: 'block',
              immediate: true,
            },
          };
      } else {
        const hintPosition = getCardPosition({ group: groupId, seq });
        if (isCardBaseFree({ group: groupId, seq }))
          return {
            toGroup: groupId,
            toSeq: seq,
            spring: {
              ...hintPosition,
              display: 'block',
              immediate: true,
            },
          };
      }
      return { toGroup: undefined, spring: { display: 'none' } };
    },
    [cards]
  );
  const handleHintCard = card => {
    console.log(card);
  };
  useEffect(() => {
    console.log(cards);
    setCardsProps(index => {
      const card = flatCards.find(c => c.springId === index);

      if (card) {
        const { x: posX, y: posY } = getCardPosition(card);
        return { shadow: false, x: posX, y: posY, zIndex: '10' };
      }
    });
  }, [cards, flatCards]);

  // * 設定動畫
  const [cardsProps, setCardsProps] = useSprings(flatCards.length, i => ({ ...initto(i), from: initfrom(i) }));
  const [hintProps, setHintProps] = useSprings(2, i => ({ display: 'none', x: 0, y: 0 }));

  // * 綁定手勢操作
  const bind = useGesture({
    // onHover: ({ hovering, down, args: [fromCard], xy: [x, y], event }) => {},
    onDragStart: ({ down, args: [{ group, seq, springId }], xy: [x, y], event }) => {
      if (seq + 1 <= cards.cardset[group].length - maxDragLength) return;
      if (!isSuitValidBeforeDrag(group, seq)) return;

      const card = event?.target ?? undefined;
      const lox = x - card?.getBoundingClientRect().left;
      const loy = y - card?.getBoundingClientRect().top;
      dragOffset.current = [lox, loy];

      setCardsProps(
        index =>
          index === springId && {
            shadow: true,
          }
      );
    },
    onDrag: ({ down, args: [card], xy: [x, y], event, delta: [deltaX] }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      const { group, seq, springId } = card;
      const groupset = cards.cardset[group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - lox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - loy - cardZoneOffsetRef.current?.offsetTop;

      const { spring } = getHintPosition(card, [fixedX, fixedY]);

      setCardsProps(index => {
        const matchedMoveCard = controlCards.find(c => c.springId === index);

        if (matchedMoveCard)
          return {
            x: fixedX,
            y: fixedY + (matchedMoveCard.seq - seq) * 40,
            zIndex: '131',
            immediate: down,
          };
      });
      setHintProps(index => index === 0 && spring);
    },
    onDragEnd: ({ down, args: [card], xy: [x, y], event }) => {
      const [dox, doy] = dragOffset.current;
      if (dox === 0 && doy === 0) return;

      const { group, seq, springId } = card;
      const groupset = cards.cardset[group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - dox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - doy - cardZoneOffsetRef.current?.offsetTop;

      const { toGroup, toSeq } = getHintPosition(card, [fixedX, fixedY]);

      if (toGroup !== undefined) {
        if (toGroup.toString().match(/(cells|foundation)/)) {
        }
        setCards(prevState => ({
          ...prevState,
          cardset: [
            ...prevState.cardset.map((g, gi) => {
              // remove original
              if (gi === group) return g.slice(0, groupset.length - controlCards.length);
              else if (gi == toGroup)
                return [...g, ...controlCards.map((c, ci) => ({ ...c, group: gi, seq: g.length + ci }))];
              return g;
            }),
          ],
        }));
      } else {
        setCardsProps(index => {
          const matchedCard = controlCards.find(c => c.springId === index);

          if (matchedCard) {
            const { x: posX, y: posY } = getCardPosition(matchedCard);
            return { shadow: false, x: posX, y: posY, delay: 30 * (matchedCard.seq - seq), zIndex: '10' };
          }
        });
      }

      setHintProps(_ => ({
        display: 'none',
      }));
      dragOffset.current = [0, 0];
    },
  });

  return (
    <>
      <CardZone>
        <CardBase />
        <CardBase />
        <CardBase />
        <CardBase />
        <CardBase text="A" />
        <CardBase text="A" />
        <CardBase text="A" />
        <CardBase text="A" />
      </CardZone>
      <CardZone ref={cardZoneRef}>
        {hintProps.map(({ x, y, display }, i) => {
          return <HintArea key={i} style={{ display, top: y, left: x }} />;
        })}

        {cardsProps.map(({ x, y, shadow, zIndex }, i) => {
          const card = flatCards.find(c => c.springId == i);
          return (
            <Card
              className="card"
              key={i}
              {...bind(card)}
              onDoubleClick={e => handleHintCard(card)}
              style={{
                backgroundImage: `url(${images[card?.cardname]})`,
                transform: to([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                zIndex: zIndex.to(zIndex => zIndex * card.seq),
                filter: shadow.to(shadow => (shadow ? `drop-shadow(8px 8px 10px #000)` : '')),
              }}
            />
          );
        })}
      </CardZone>
    </>
  );
}

export default Game;
