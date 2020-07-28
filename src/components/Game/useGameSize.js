import { useResize } from '../../hooks/useResize';
import { useRef, useEffect, useState } from 'react';

function useGameSize() {
  const [cardPosition, setCardPosition] = useState({ x: '125px', y: '40px' });
  const cardZoneRef = useRef(null);
  const cardZoneOffsetRef = useRef(null);

  const handleResize = () => {
    // TODO Update CardPosition

    cardZoneOffsetRef.current = {
      offsetTop: cardZoneRef.current?.offsetTop,
      offsetLeft: cardZoneRef.current?.offsetLeft,
    };
  };

  useEffect(() => {
    handleResize();
  }, [cardZoneRef]);

  useResize(handleResize);

  return { cardPosition, cardZoneRef, cardZoneOffsetRef };
}

export default useGameSize;
