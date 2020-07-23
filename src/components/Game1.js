import React, { useState } from 'react';
import styled from 'styled-components';
import { useDrag, useScroll, useGesture } from 'react-use-gesture';

const Card = styled.div`
  position: absolute;
  width: 100px;
  height: 154px;
  background-size: cover;
  background-color: red;
`;

function Game1(props) {
  const [state, setState] = useState({ x: 0, y: 0 });

  const bind = useDrag(({ down, args: [fromIndex], xy: [x, y], offset: [ox, oy], movement: [mx, my], event }) => {
    setState({ x, y });
  });

  const { x, y } = state;
  console.log(state);
  return <Card {...bind()} style={{ transform: `translate3d(${x}px,${y}px,0)` }} />;
}

export default Game1;
