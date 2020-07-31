import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSprings, to } from 'react-spring';
import { useGesture } from 'react-use-gesture';
import { CardBase, CardZone, Card, HintArea } from '../Styled';
import { enums } from '../../utils';
import useGameSize from './useGameSize';

import { nums, isCardMatch, images, newGame, initto, initfrom, getCardPosition, getMatchedGroup } from './func';

function Game() {
  const { cardZoneRef, cardZoneOffsetRef } = useGameSize();

  //* 卡片設定區
  const dragOffset = useRef([0, 0]);
  const [cards, setCards] = useState(newGame);
  const flatCards = useMemo(() => [...cards.cardset.flat(), ...cards.cells.flat(), ...cards.foundation.flat()], [
    cards,
  ]);
  const maxDragLength = useMemo(() => {
    const cells = 4 - cards.cells.filter(c => c.length !== 0).length;
    const cardset = cards.cardset.filter(g => g.length === 0).length;
    return cells + cardset + 1;
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
    ({ type, group }) => {
      return cards[type][group].length === 0;
    },
    [cards]
  );

  const isCardBaseValid = useCallback(
    (dragCards, { group }) => {
      if (dragCards.number === 'A') return true;

      const [compare] = cards.foundation[group].slice(-1);
      if (!compare) return false;
      return isCardMatch(dragCards, compare, true);
    },
    [cards]
  );

  const getHintPosition = useCallback(
    (dragCards, cardPosition) => {
      const [result] = getMatchedGroup(cardPosition);
      const { type, group, seq } = result;
      const [dragCard] = dragCards;

      let isHint = false;
      let hintPosition = {};

      const groupset = cards.cardset[group];

      if (type === 'cardset') {
        const [hoverCard = { base: true, type: 'cardset', group, seq: 0 }] = groupset.slice(-1);
        hintPosition = getCardPosition(hoverCard);
        if (hoverCard.base) {
          isHint = true;

          console.log(groupset.length, dragCards, maxDragLength);

          if (groupset.length === 0) {
            isHint = dragCards.length < maxDragLength;
          }
        } else isHint = isCardMatch(hoverCard, dragCard);
      } else if (dragCards.length === 1) {
        hintPosition = getCardPosition({ type, group, seq });

        if (type === 'cells') isHint = isCardBaseFree({ type, group, seq });
        else isHint = isCardBaseValid(dragCard, { type, group, seq });
      }

      return isHint
        ? {
            toType: type,
            toGroup: group,
            toSeq: seq,
            spring: {
              ...hintPosition,
              display: 'block',
              immediate: true,
            },
          }
        : { toType: undefined, toGroup: undefined, spring: { display: 'none' } };
    },
    [cards, maxDragLength]
  );
  const handleHintCard = card => {
    console.log(card);
  };
  useEffect(() => {
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
  const [hintProps, setHintProps] = useSprings(2, () => ({ display: 'none', x: 0, y: 0 }));

  // * 綁定手勢操作
  const bind = useGesture({
    onDragStart: ({ args: [{ group, type, seq, springId }], xy: [x, y], event }) => {
      if (!type.match(/(cells|foundation)/)) {
        // console.log(seq, cards[type][group].length, maxDragLength);
        if (seq + 1 <= cards[type][group].length - maxDragLength)
          // 驗證可移動張數
          return;
        // 驗證花色
        if (!isSuitValidBeforeDrag(group, seq)) return;
      }

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
    onDrag: ({ down, args: [card], xy: [x, y], delta: [] }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      const { group, seq, type } = card;
      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - lox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - loy - cardZoneOffsetRef.current?.offsetTop;

      const { toType, spring } = getHintPosition(controlCards, [fixedX, fixedY]);

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

      if (toType?.match(/(cell|foundation)/) && controlCards.length > 1) return;
      setHintProps(index => index === 0 && spring);
    },
    onDragEnd: ({ args: [card], xy: [x, y] }) => {
      const [dox, doy] = dragOffset.current;
      if (dox === 0 && doy === 0) return;

      const { group, seq, type } = card;
      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - dox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - doy - cardZoneOffsetRef.current?.offsetTop;

      const { toType, toGroup, toSeq } = getHintPosition(controlCards, [fixedX, fixedY]);

      if (toType !== undefined) {
        setCards(prevState => {
          const newState = { ...prevState };

          // remove original
          if (type === 'cardset')
            newState.cardset[group] = newState.cardset[group].slice(0, groupset.length - controlCards.length);
          if (type === 'cells') newState.cells[group] = [];
          if (type === 'foundation')
            newState.foundation[group] = newState.foundation[group].slice(0, newState.foundation[group].length - 1);

          if (toType === 'cardset')
            newState.cardset[toGroup] = newState.cardset[toGroup].concat(
              controlCards.map((c, ci) => ({
                ...c,
                type: toType,
                group: toGroup,
                seq: newState.cardset[toGroup].length + ci,
              }))
            );

          // move to
          if (toType === 'cells')
            newState.cells[toGroup] = controlCards.map(c => ({
              ...c,
              type: toType,
              group: toGroup,
              seq: toSeq,
            }));

          if (toType === 'foundation')
            newState.foundation[toGroup] = [
              ...newState.foundation[toGroup],
              ...controlCards.map(c => ({
                ...c,
                type: toType,
                group: toGroup,
                seq: nums.indexOf(c.number),
              })),
            ];

          return newState;
        });
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
        {console.log(flatCards)}

        {cardsProps.map(({ x, y, shadow, zIndex }, i) => {
          const card = flatCards.find(c => c?.springId == i);
          return (
            <Card
              className="card"
              key={i}
              {...bind(card)}
              onDoubleClick={() => handleHintCard(card)}
              style={{
                backgroundImage: `url(${images[card?.cardname]})`,
                transform: to([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                zIndex: zIndex.to(zIndex => zIndex * (card.seq + 1)),
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
