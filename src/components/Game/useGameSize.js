import { useResize } from '../../hooks/useResize';
import { useRef, useEffect, useState } from 'react';
import { getMagnifier } from './func';

function useGameSize() {
  const [magnifier, setMagnifier] = useState(getMagnifier);

  const cardZoneRef = useRef(null);
  const cardZoneOffsetRef = useRef(null);

  const handleResize = () => {
    setMagnifier(getMagnifier());

    cardZoneOffsetRef.current = {
      offsetTop: cardZoneRef.current?.offsetTop + cardZoneRef.current.offsetParent?.offsetTop,
      offsetLeft: cardZoneRef.current?.offsetLeft + cardZoneRef.current.offsetParent?.offsetLeft,
    };
  };

  useEffect(() => {
    handleResize();
  }, [cardZoneRef]);

  useResize(handleResize);

  return { magnifier, cardZoneRef, cardZoneOffsetRef };
}

export default useGameSize;
