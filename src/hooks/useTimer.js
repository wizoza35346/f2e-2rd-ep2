import { useState, useRef } from 'react';
import useInterval from '../hooks/useInterval';

function useTimer() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const returnTo0 = () => {
    setTimer(0);
  };

  useInterval(
    () => {
      setTimer(timer + 1);
    },
    isRunning ? 1000 : null
  );

  return { timer, start, pause, returnTo0 };
}

export default useTimer;
