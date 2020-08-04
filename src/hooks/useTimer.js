import { useState, useRef } from 'react';

function useTimer() {
  const [timer, setTimer] = useState(0);
  const p = useRef(0);

  const start = () => {
    console.log(p.current);
    p.current = setInterval(() => {
      setTimer(prevTime => prevTime + 1);
    }, 1000);
  };

  const pause = () => {};

  const returnTo0 = () => {
    console.log(p.current);
    clearInterval(p.current);
    setTimer(0);
  };

  return { timer, start, pause, returnTo0 };
}

export default useTimer;
