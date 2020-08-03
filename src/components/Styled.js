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

  *{
    box-sizing: border-box;
  }
`;
export const Container = styled.div`
  margin: 3rem auto;
  width: ${props => props.width || '975px'};
  user-select: none;
`;
export const CardBase = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '154px'};
  position: relative;
  user-select: none;
  border: 2px solid #ffac4e;
  border-radius: 10px;
  font-size: 2rem;
  font-weight: 700;
  color: #545b61;

  &::before {
    content: '';
    display: block;
    width: 90%;
    height: 95%;
    position: absolute;
    border: 1px solid #c48743;
    border-radius: 5px;
  }

  &::after {
    content: "${props => props.text}";
  }
`;
export const CardZone = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 1.5rem;
  user-select: none;
`;
export const Card = styled(animated.div)`
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '154px'};
  background-size: cover;
  position: absolute;
`;
export const HintArea = styled(animated.div)`
  position: absolute;
  width: ${props => props.width || '100px'};
  height: ${props => props.height || '154px'};
  z-index: 130;
  box-shadow: 0 0 25px #ffb057;
  border: 1px solid #ffb057;
  border-radius: 10px;
`;
