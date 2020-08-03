import { useState, useRef } from 'react';

function useTimer() {
  const [timer, setTimer] = useState(0);
  const p = useRef(0);

  const start = () => {
    p.current = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
  };

  const pause = () => {
    clearInterval(p.current);
  };

  const reStart = () => {
    pause();
    setTimer(0);
    start();
  };

  return { timer, start, pause, reStart };
}

export default useTimer;
