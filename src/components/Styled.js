import { animated } from 'react-spring';
import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Oleo Script';
    src: url(${require('../assets/font/Oleo_Script/OleoScript-Regular.ttf')});
  }

  body {
    font-family: 'Oleo Script', sans-serif;
    background-color: #162029;
    overflow: hidden;
    margin: 0;
  }
`;
export const Container = styled.div`
  margin: 3rem auto;
  width: 975px;
  user-select: none;
`;
export const FreeCardZone = styled.div`
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
export const CardZone = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  user-select: none;
`;
export const Card = styled(animated.div)`
  position: absolute;
  width: 100px;
  height: 154px;
  background-size: cover;
`;
