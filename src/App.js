import React from 'react';
import Game from './components/Game/';
import { hot } from 'react-hot-loader/root';

import { GlobalStyle, Container } from './components/Styled';

function App() {
  return (
    <>
      <GlobalStyle />
      <Game />
    </>
  );
}

export default hot(App);
