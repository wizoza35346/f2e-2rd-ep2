import React from 'react';
import Game from './components/Game/';
import { hot } from 'react-hot-loader/root';

import { GlobalStyle, Container } from './components/Styled';

function App() {
  return (
    <>
      <GlobalStyle />
      <Container>
        <Game />
      </Container>
    </>
  );
}

export default hot(App);
