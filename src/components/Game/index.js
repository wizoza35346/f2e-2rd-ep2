import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSprings, animated, to, useSpring, config } from 'react-spring';
import { useDrag, useScroll, useGesture } from 'react-use-gesture';

import { suitType, nums, isCardMatch, cardset, images, newGame, initto, initfrom, getCardPosition } from './func';
import { FreeCardZone, CardZone, Card, HintArea } from '../Styled';
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
      // * 最底一張可直接移動
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
  const handleHintCard = card => {
    console.log(card);
  };
  useEffect(() => {
    // TODO Fixed Position
    // set(index => {})
    console.log('Card changes,new card = ', cards);
  }, [cards]);

  // * 設定動畫
  const [cardsProps, setCardsProps] = useSprings(cardsFlat.length, i => ({ ...initto(i), from: initfrom(i) }));
  const [hintProps, setHintProps] = useSprings(2, i => ({ display: 'none', x: 0, y: 0 }));

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

      setCardsProps(
        index =>
          index === springId && {
            shadow: true,
          }
      );
    },
    onDrag: ({ down, args: [{ group, seq, springId }], xy: [x, y], event, delta: [deltaX] }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      const groupset = cards.cardset[group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - lox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - loy - cardZoneOffsetRef.current?.offsetTop;

      const matchedPosition = ((posX, posY) => {
        // TODO 固定的參數 改成RWD時要改
        let groupX = 0;
        let groupId = 0;
        let groupRange = 0;
        let totalMatchedGroup = [];
        const cardRange = [posX, posX + 100];
        do {
          if (groupId === 0 || groupId === 7) groupRange = groupX + 112.5;
          else groupRange = groupX + 125;

          cardRange.forEach(pos => {
            if (groupX <= pos && pos <= groupRange) {
              totalMatchedGroup = [
                ...totalMatchedGroup,
                {
                  groupId,
                  left: Math.min(cardRange[0], groupX),
                  right: Math.max(cardRange[1], groupRange),
                },
              ];
            }
          });

          groupId += 1;
          groupX = groupRange;
        } while (groupX < 975);
        // console.log(totalMatchedGroup);

        const [result] = totalMatchedGroup.sort((m, m1) => m.right - m.left - (m1.right - m1.left));
        const [hoverCard] = cards.cardset[result.groupId].slice(-1);
        if (isCardMatch(hoverCard, controlCards[0]))
          return {
            x: result.groupId * 125,
            y: (cards.cardset[result.groupId].length - 1) * 30,
            display: 'block',
            immediate: true,
          };

        return { display: 'none' };
      })(fixedX, fixedY);

      setCardsProps(index => {
        const matchedMoveCard = controlCards.find(c => c.springId === index);

        const matchedPosition = ((posX, posY) => {
          // TODO 固定的參數 改成RWD時要改
          let groupX = 0;
          let groupId = 0;
          let groupRange = 0;
          let totalMatchedGroup = [];
          const cardRange = [posX, posX + 100];
          do {
            if (groupId === 0 || groupId === 7) groupRange = groupX + 112.5;
            else groupRange = groupX + 125;

            cardRange.forEach(pos => {
              if (groupX <= pos && pos <= groupRange) {
                totalMatchedGroup = [
                  ...totalMatchedGroup,
                  {
                    groupId,
                    left: Math.min(cardRange[0], groupX),
                    right: Math.max(cardRange[1], groupRange),
                  },
                ];
              }
            });

            groupId += 1;
            groupX = groupRange;
          } while (groupX < 975);
          // console.log(totalMatchedGroup);

          const [result] = totalMatchedGroup.sort((m, m1) => m.right - m.left - (m1.right - m1.left));
          const [hoverCard] = cards.cardset[result.groupId].slice(-1);
          if (isCardMatch(hoverCard, controlCards[0]))
            return {
              x: result.groupId * 125,
              y: (cards.cardset[result.groupId].length - 1) * 30,
              display: 'block',
              immediate: true,
            };

          return { display: 'none' };
        })(fixedX, fixedY);

        if (matchedMoveCard)
          return {
            x: fixedX,
            y: fixedY + (matchedMoveCard.seq - seq) * 30,
            zIndex: '1200',
            immediate: down,
          };
        // else return { zIndex: '10' };
      });
      setHintProps(index => {
        return index === 0 && matchedPosition;
      });
    },
    onDragEnd: ({ down, args: [{ group, seq, springId }], xy: [x, y], event }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      const groupset = cards.cardset[group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const fixedX = x - lox - cardZoneOffsetRef.current?.offsetLeft;
      const fixedY = y - loy - cardZoneOffsetRef.current?.offsetTop;

      const matchedPosition = ((posX, posY) => {
        // TODO 固定的參數 改成RWD時要改
        let groupX = 0;
        let groupId = 0;
        let groupRange = 0;
        let totalMatchedGroup = [];
        const cardRange = [posX, posX + 100];
        do {
          if (groupId === 0 || groupId === 7) groupRange = groupX + 112.5;
          else groupRange = groupX + 125;

          cardRange.forEach(pos => {
            if (groupX <= pos && pos <= groupRange) {
              totalMatchedGroup = [
                ...totalMatchedGroup,
                {
                  groupId,
                  left: Math.min(cardRange[0], groupX),
                  right: Math.max(cardRange[1], groupRange),
                },
              ];
            }
          });

          groupId += 1;
          groupX = groupRange;
        } while (groupX < 975);

        const [result] = totalMatchedGroup.sort((m, m1) => m.right - m.left - (m1.right - m1.left));
        const [hoverCard] = cards.cardset[result.groupId].slice(-1);
        if (isCardMatch(hoverCard, controlCards[0]))
          return {
            toGroup: result.groupId,
            spring: {
              x: result.groupId * 125,
              y: (cards.cardset[result.groupId].length - 1) * 30,
              display: 'block',
              immediate: true,
            },
          };

        return { toGroup: result.groupId, spring: { display: 'none' } };
      })(fixedX, fixedY);

      if (matchedPosition.toGroup) {
        console.log(matchedPosition);
        try {
          setCards(prevState => ({
            ...prevState,
            cardset: [
              ...prevState.cardset.map((g, gi) => {
                if (gi + 1 === group) return g.slice(0, groupset.length - controlCards.length);
                else if (gi + 1 == matchedPosition.toGroup) return [...g, ...controlCards];
              }),
            ],
          }));
        } catch {
          console.log(cards.cardset, controlCards);
        }
      } else {
        const groupset = cards.cardset[group];
        const controlCards = groupset.filter(g => g.seq >= seq);
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
        {hintProps.map(({ x, y, display }, i) => {
          return <HintArea style={{ display, top: y, left: x }} />;
        })}

        {cardsProps.map(({ x, y, shadow, zIndex }, i) => {
          const card = cardsFlat.find(c => c.springId == i);
          return (
            <Card
              className="card"
              key={i}
              {...bind(card)}
              onDoubleClick={e => handleHintCard(card)}
              style={{
                zIndex: to([zIndex], s => s),
                transform: to([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`),
                backgroundImage: `url(${images[card?.cardname]})`,
                filter: to([shadow], s => (s ? `drop-shadow(8px 8px 10px #000)` : '')),
              }}
            />
          );
        })}
      </CardZone>
    </>
  );
}

export default Game;
