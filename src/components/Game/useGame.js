import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSprings } from 'react-spring';
import { useGesture } from 'react-use-gesture';
import useGameSize from './useGameSize';

import { nums, isCardMatch, newGame, initto, initfrom, getCardPosition, getMatchedGroup } from './func';
import { enums } from '../../utils';
import useTimer from '../../hooks/useTimer';

export default function useGame() {
  const { magnifier, cardZoneRef, cardZoneOffsetRef } = useGameSize();
  const { timer, start: startTimer, pause: pauseTimer, returnTo0: reTimer } = useTimer();

  //* 卡片設定區
  const dragOffset = useRef([0, 0]);
  const [cards, setCards] = useState(newGame);
  const cardsRecRef = useRef([]);

  const flatCards = useMemo(() => [...cards.cardset.flat(), ...cards.cells.flat(), ...cards.foundation.flat()], [
    cards,
  ]);
  const dragLength = useMemo(() => {
    const cells = 4 - cards.cells.filter(c => c.length !== 0).length;
    const cardset = cards.cardset.filter(g => g.length === 0).length;
    return cells + cardset + 1;
  }, [cards]);

  const isValidBeforeDrag = useCallback(
    ({ type, group, seq }) => {
      if (type.match(/(cells|foundation)/)) return true;

      // 驗證可移動張數
      if (seq + 1 <= cards[type][group].length - dragLength) return false;
      const groupset = cards.cardset[group];

      // * 最底一張可直接移動
      if (seq === groupset.length - 1) return true;
      // * 花色match 才可移動 => 產生一個 seq 依序開頭 需要比對 n -1 次長度的陣列 => 都matched ? true : false
      return enums(groupset.length - seq - 1, seq).every(i => isCardMatch(groupset[i], groupset[i + 1]));
    },
    [cards]
  );
  const isCellsEmpty = useCallback(({ type, group }) => cards[type][group].length === 0, [cards]);
  const isStackValid = useCallback(
    ({ dragCard, group }) => {
      const groupset = cards.foundation[group];
      if (dragCard.number === 'A' && groupset.length === 0) return true;

      const [compare] = groupset.slice(-1);
      if (!compare) return false;
      // 同花compare
      return isCardMatch(dragCard, compare, true);
    },
    [cards]
  );
  const getHintPosition = useCallback(
    ({ dragCards, dragPosition }) => {
      const [{ type, group, seq }] = getMatchedGroup(dragPosition, magnifier);
      const [firstDragCard] = dragCards;
      const groupset = cards.cardset[group];

      let isHint = false;
      let hintPosition = {};
      if (type === 'cardset') {
        const [hoverCard = { base: true, type: 'cardset', group, seq: 0 }] = groupset.slice(-1);
        hintPosition = getCardPosition(hoverCard, magnifier);
        if (hoverCard.base) {
          isHint = true;
          // * 移到空白卡區 可移動長度-1
          if (groupset.length === 0) isHint = dragCards.length < dragLength;
        } else isHint = isCardMatch(hoverCard, firstDragCard);
      }
      // * cells | foundation 1次只能移動1張
      else if (dragCards.length === 1) {
        hintPosition = getCardPosition({ type, group, seq }, magnifier);

        if (type === 'cells') isHint = isCellsEmpty({ type, group, seq });
        else isHint = isStackValid({ dragCard: firstDragCard, type, group, seq });
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
    [cards, dragLength, isCellsEmpty, isStackValid, magnifier]
  );
  const handleMoveCards = useCallback(
    ({ type, group, seq }, { type: toType, group: toGroup, seq: toSeq }) => {
      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      setCards(prevState => {
        const newState = { ...prevState };

        // remove original
        if (type === 'cardset')
          newState.cardset[group] = newState.cardset[group].slice(0, groupset.length - controlCards.length);
        else if (type === 'cells') newState.cells[group] = [];
        else if (type === 'foundation')
          newState.foundation[group] = newState.foundation[group].slice(0, newState.foundation[group].length - 1);

        // move to
        if (toType === 'cardset')
          newState.cardset[toGroup] = newState.cardset[toGroup].concat(
            controlCards.map((c, ci) => ({
              ...c,
              type: toType,
              group: toGroup,
              seq: newState.cardset[toGroup].length + ci,
            }))
          );
        else if (toType === 'cells')
          newState.cells[toGroup] = controlCards.map(c => ({
            ...c,
            type: toType,
            group: toGroup,
            seq: toSeq,
          }));
        else if (toType === 'foundation')
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
    },
    [cards]
  );
  const handleAutoMove = useCallback(
    card => {
      if (!isValidBeforeDrag(card)) return;

      const { type, group, seq, suit, number } = card;
      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      let target;

      if (type.match(/(cardset|cells)/)) {
        if (number === 'A' && controlCards.length === 1)
          target = {
            type: 'foundation',
            group: cards.foundation.findIndex(f => f.length === 0),
            seq: nums.indexOf(number),
          };
        else {
          target = cards.cardset
            .map((c, gi) => {
              const [compare] = c.slice(-1);
              return gi !== group && compare && isCardMatch(compare, card) ? compare : undefined;
            })
            .find(c => c);

          if (!target && controlCards.length === 1) {
            let targetGroup = cards.foundation.findIndex(ff => ff.every(f => f.suit === suit));
            const [compare] = cards.foundation[targetGroup].slice(-1);
            if (compare && isCardMatch(card, compare, true))
              target = {
                type: 'foundation',
                group: targetGroup,
                seq: nums.indexOf(number),
              };
            else {
              targetGroup = cards.cells.findIndex(c => c.length === 0);
              targetGroup !== -1 &&
                (target = {
                  type: 'cells',
                  group: targetGroup,
                  seq: 1,
                });
            }
          }
        }
      }

      target && handleMoveCards(card, target);
    },
    [cards]
  );

  // * 設定動畫
  const [cardsProps, setCardsProps] = useSprings(flatCards.length, i => ({ ...initfrom(i) }));
  const [hintProps, setHintProps] = useSprings(2, () => ({ display: 'none', x: 0, y: 0 }));

  // * 綁定手勢操作
  const bindGesture = useGesture({
    onDragStart: ({ args: [{ group, type, seq, springId }], xy: [x, y], event }) => {
      if (!isValidBeforeDrag({ type, group, seq })) return;

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
    onDrag: ({ down, args: [{ group, seq, type }], xy: [x, y], delta: [] }) => {
      const [lox, loy] = dragOffset.current;
      if (lox === 0 && loy === 0) return;

      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const { offsetLeft, offsetTop } = cardZoneOffsetRef.current;
      const fixedX = x - lox - offsetLeft;
      const fixedY = y - loy - offsetTop;

      const { spring } = getHintPosition({ dragCards: controlCards, dragPosition: [fixedX, fixedY] });

      setCardsProps(index => {
        const matchedMoveCard = controlCards.find(c => c.springId === index);

        if (matchedMoveCard)
          return {
            x: fixedX,
            y: fixedY + (matchedMoveCard.seq - seq) * (30 * magnifier),
            zIndex: '131',
            immediate: down,
          };
      });

      setHintProps(index => index === 0 && spring);
    },
    onDragEnd: ({ args: [{ group, seq, type }], xy: [x, y] }) => {
      const [dox, doy] = dragOffset.current;
      if (dox === 0 && doy === 0) return;

      const groupset = cards[type][group];
      const controlCards = groupset.filter(g => g.seq >= seq);

      const { offsetLeft, offsetTop } = cardZoneOffsetRef.current;
      const fixedX = x - dox - offsetLeft;
      const fixedY = y - doy - offsetTop;

      const { toType, toGroup, toSeq } = getHintPosition({ dragCards: controlCards, dragPosition: [fixedX, fixedY] });

      if (toType !== undefined) {
        handleMoveCards({ type, group, seq }, { type: toType, group: toGroup, seq: toSeq });
      } else {
        setCardsProps(index => {
          const matchedCard = controlCards.find(c => c.springId === index);

          if (matchedCard) {
            const { x: posX, y: posY } = getCardPosition(matchedCard, magnifier);
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

  const undo = () => {
    const [initState] = cardsRecRef.current;
    const lastState = cardsRecRef.current.pop();
    // console.log(JSON.parse(currentState), JSON.parse(lastState));
    setCards(JSON.parse(lastState ? lastState : initState));
  };

  const play = async () => {
    if (cardsRecRef.current.length !== 0) {
      cardsRecRef.current = [];
      setCards(newGame());
      await setCardsProps(i => ({ ...initfrom(i, magnifier) }));
    }
    await setCardsProps(i => ({ ...initto(i, magnifier), from: initfrom(i, magnifier) }));
    startTimer();
  };

  const reStart = async () => {
    const [originalGame] = cardsRecRef.current;

    if (originalGame) {
      reTimer();
      setCards(JSON.parse(originalGame));
      cardsRecRef.current = [];

      await setCardsProps(i => ({ ...initfrom(i) }));
      await setCardsProps(i => ({ ...initto(i), from: initfrom(i) }));
      startTimer();
    }
  };

  useEffect(() => {
    play();
  }, []);

  useEffect(() => {
    console.log(cards, cardsRecRef.current);
    cardsRecRef.current.push(JSON.stringify(cards));
    if (cardsRecRef.current.length !== 1) {
      setCardsProps(index => {
        const card = flatCards.find(c => c.springId === index);

        if (card) {
          const { x: posX, y: posY } = getCardPosition(card, magnifier);
          return { shadow: false, x: posX, y: posY, zIndex: '10' };
        }
      });
    }
  }, [cards, flatCards, magnifier]);

  return {
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
    newGame: play,
    reStart,
  };
}
