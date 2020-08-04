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

export const primary = '#ffac4e';
export const secondary = '#ffb057';
export const container = {
  width: 960,
  height: 768,
};
export const zone = 820;
export const card = {
  width: 81.5,
  height: 125.5,
  padding: 24,
};
export const Container = styled.div`
  display: block;
  margin: 3rem auto;
  width: ${props => props.magnifier * container.width + 'px'};
  height: ${container.height + 'px'};
  user-select: none;
  position: relative;
`;
export const Title = styled.div`
  position: absolute;
  color: ${primary};
  font-size: ${props => props.magnifier}rem;
`;
export const Header = styled.div`
  display: flex;
  justify-content: center;
  color: white;
  font-size: ${props => props.magnifier}rem;
  line-height: 1rem;
  margin-bottom: 1rem;
`;
export const Button = styled.button`
  border: ${props => props.magnifier * 2}px solid ${primary};
  border-radius: 0.5rem;
  background: transparent;
  width: ${props => props.magnifier * 54}px;
  height: ${props => props.magnifier * 54}px;

  img {
    width: ${props => props.magnifier * 1.5}rem;
  }
`;
export const CardZone = styled.div`
  display: flex;
  width: ${props => props.magnifier * zone + 'px'};
  position: relative;
  user-select: none;
  margin: 0 auto ${props => props.magnifier * 1.25}rem auto;
`;
export const CardBase = styled.div`
  width: ${props => props.magnifier * card.width + 'px'};
  height: ${props => props.magnifier * card.height + 'px'};
  position: relative;
  user-select: none;
  border: ${props => props.magnifier * 2}px solid ${primary};
  border-radius: 10px;
  font-size:${props => props.magnifier * 2}rem;
  font-weight: 700;
  color: #545b61;
  flex-shrink: 0;
  padding:.25rem;

  &:not(:last-child){
    margin-right:${props => props.magnifier * card.padding + 'px'};
  }

  &::before {
    content: '';
    display: block;
    width: calc(100% - .25rem - .25rem - 2px);
    height: calc(100% - .25rem - .25rem - 2px);
    position: absolute;
    border: ${props => props.magnifier}px solid #c48743;
    border-radius: 5px;
  }

  &::after {
    content: "${props => props.text}";
    position: absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%)
  }
`;
export const Card = styled(animated.div)`
  width: ${props => props.magnifier * card.width + 'px'};
  height: ${props => props.magnifier * card.height + 'px'};
  background-size: cover;
  position: absolute;
`;
export const HintArea = styled(animated.div)`
  position: absolute;
  width: ${props => props.magnifier * card.width + 'px'};
  height: ${props => props.magnifier * card.height + 'px'};
  z-index: 130;
  box-shadow: 0 0 ${props => props.magnifier * card.padding}px ${secondary};
  border: ${props => props.magnifier}px solid ${secondary};
  border-radius: 10px;
`;
