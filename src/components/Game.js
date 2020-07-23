import React, { useState, useEffect, useRef, useCallback } from 'react';
import { debounce, throttle } from '../utils/';

import { useSprings, animated, interpolate, useSpring } from 'react-spring';
import { useDrag, useScroll, useGesture } from 'react-use-gesture';
import styled from 'styled-components';

const Container = styled.div`
  margin: 3rem auto;
  width: 975px;
  user-select: none;
`;

const FreeCardZone = styled.div`
  width: 100px;
  height: 154px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #ffac4e;
  border-radius: 10px;
  font-size: 2rem;
  color: #545b61;
  font-weight: 700;
  position: relative;
  user-select: none;

  &::before {
    content: '';
    border: 1px solid #c48743;
    border-radius: 5px;
    width: 90%;
    height: 95%;
    display: block;
    position: absolute;
  }
`;

const CardZone = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  user-select: none;
`;
const Card = styled(animated.div)`
  position: absolute;
  width: 100px;
  height: 154px;
  background-size: cover;
`;

function importAll(r) {
  return r.keys().reduce((res, item) => ({ ...res, [item.replace('./', '')]: r(item) }), {});
}

const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const from = _ => ({ x: 400, y: 500 });
const to = i => ({ x: (i % 8) * 125, y: Math.floor(i / 8) * 30, delay: i * 50 });

const images = importAll(require.context('../assets/cards/', false, /\.(png)$/));

function getRandom(start, end, length, repeat = false) {
  const generateRandom = () => Math.floor(Math.random() * end) + start;

  if (repeat) return Array(length).join().split(',').map(generateRandom);
  else {
    let randoms = [];
    for (let i = start; i <= end; i++) {
      (function j() {
        const newRandom = generateRandom();
        if (randoms.indexOf(newRandom) === -1) randoms = [...randoms, newRandom];
        else j();
      })();
    }

    return randoms;
  }
}

function Game() {
  const lastPosition = useRef([0, 0]);
  const [cards, setCards] = useState(() => {
    const random = getRandom(1, 52, 52);
    return suits
      .reduce((all, next) => [...all, ...nums.map(n => `${n}_${next}.png`)], [])
      .map((c, i) => ({
        cardName: c,
        key: random[i],
      }));
  });
  console.log(cards);
  const [props, set, stop] = useSprings(Object.keys(images).length, (i, ...other) => {
    return { ...to(i), from: from(i) };
  });

  const bind = useDrag(({ down, args: [fromIndex], xy: [x, y], offset: [ox, oy], movement: [mx, my], event }) => {
    const card = event?.target ?? undefined;

    let [lox, loy] = lastPosition.current;
    if (lox === 0 && loy === 0) {
      lox = x - card?.getBoundingClientRect().left;
      loy = y - card?.getBoundingClientRect().top;

      lastPosition.current = [lox, loy];
    }

    if (!down) lastPosition.current = [0, 0];

    set(index => index === fromIndex && { x: x - lox - 113, y: y - loy - 230 });
  });

  return (
    <Container>
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
      <CardZone>
        {props.map(({ x, y }, i) => (
          <Card
            key={i}
            {...bind(i)}
            style={{
              top: y,
              left: x,
              backgroundImage: `url(${images[cards.find(c => c.key == i + 1)?.cardName]})`,
            }}
          />
        ))}
      </CardZone>
    </Container>
  );
}

export default Game;
