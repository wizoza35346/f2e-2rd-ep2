import React from 'react';
import Game from './components/Game';
import { hot } from 'react-hot-loader/root';

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @font-face {
      font-family: Oleo Script;
      src: url(${require('./assets/font/Oleo_Script/OleoScript-Regular.ttf')});
  }

  body{
    font-family: 'Oleo Script',  sans-serif;
    background-color:#162029;
    overflow:hidden;
    margin:0;
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <Game />
    </>
  );
}

export default hot(App);
