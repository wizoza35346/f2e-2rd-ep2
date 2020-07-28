import { importAll, enums, shuffle } from '../../utils';
export const images = importAll(require.context('../../assets/cards/', false, /\.(png)$/));
export const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
export const nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const suitType = suit => (suit.match(/(Hearts|Diamonds)/) === null ? 'black' : 'red');
export const isCardMatch = ({ suit: suitA, number: numA }, { suit: suitB, number: numB }) => {
  // * 判斷花色
  if (suitType(suitA) === suitType(suitB)) return false;
  // * 判斷數字
  if (nums.indexOf(numA) - nums.indexOf(numB) !== 1) return false;

  return true;
};
export const cardset = suits.reduce(
  (card, next) => [...card, ...nums.map(n => ({ cardname: `${n}_${next}.png`, number: n, suit: next }))],
  []
);
export const newGame = () => {
  const random = shuffle(enums(52, 0));
  return random.reduce(
    (cards, next, ri) => {
      cards.cardset = [
        ...cards.cardset.map((set, ci) =>
          // 依 ri 陸續編列  [[],[],[],[],[],[],[],[],]
          ri % 8 !== ci ? set : [...set, { ...cardset[next], cardId: next, springId: ri, group: ci, seq: set.length }]
        ),
      ];
      return cards;
    },
    {
      cardset: [[], [], [], [], [], [], [], []],
      foundation: [[], [], [], []],
      cells: [],
    }
  );
};

export const initfrom = _ => ({ x: 400, y: 500, shadow: false, zIndex: '10' });
export const initto = i => ({ x: (i % 8) * 125, y: Math.floor(i / 8) * 40, delay: i * 30 });

export const getCardPosition = ({ group, seq }, cardWidth = 100, padding = 25) => {
  const cardRange = cardWidth + padding;

  if (group === 'cells' || group === 'foundation')
    return {
      x: seq * cardRange,
      y: -178,
    };

  // cardset
  return {
    x: group * cardRange,
    y: seq * 40,
  };
};

export const getGroupRange = (groupId, cardWidth = 100, padding = 25) => {
  const fixedPositionValue = -(padding / 2);
  const cardRange = cardWidth + padding;
  const initCardRange = fixedPositionValue + cardRange;

  return groupId === 0
    ? [0, initCardRange]
    : [initCardRange + (groupId - 1) * cardRange, initCardRange + groupId * cardRange];
};

export const getMatchedGroup = (cardPosition, cardWidth = 100, padding = 25) => {
  const [x, y] = cardPosition;
  const maxWidth = (cardWidth + padding) * 8 - padding;

  const totalMatched = enums(8, 0)
    .filter(groupId => {
      const [groupRangeStart, groupRangeEnd] = getGroupRange(groupId);

      if (x < 0 && groupId === 0) return true;
      if (x > maxWidth && groupId === 7) return true;
      return [x, x + cardWidth].some(pos => groupRangeStart <= pos && pos <= groupRangeEnd);
    })
    .map(groupId => {
      const [groupRangeStart, groupRangeEnd] = getGroupRange(groupId);
      return {
        groupId,
        left: Math.min(x, groupRangeStart),
        right: Math.max(x + cardWidth, groupRangeEnd),
      };
    })
    .sort((m, m1) => m.right - m.left - (m1.right - m1.left));

  if (y > 0) return totalMatched;

  return totalMatched.map(t => ({
    ...t,
    groupId: t.groupId <= 4 ? 'cells' : 'foundation',
    seq: t.groupId,
  }));
};

// const card = event?.target ?? undefined;

// let [lox, loy] = dragOffset.current;
// if (lox === 0 && loy === 0) {
//   // TODO
//   // ? if(invalid move) return ;
//   // * invalid move => freecell.length + (cardset[].length === 0) < canMmoveCards
//   // * canMoveCards => culculate suits

//   lox = x - card?.getBoundingClientRect().left;
//   loy = y - card?.getBoundingClientRect().top;

//   dragOffset.current = [lox, loy];
// }

// if (!down) {
//   dragOffset.current = [0, 0];

//   // TODO
//   // ? if(card matched) Move card
//   // ? else restore position
// }

// console.log(x, lox, cardZoneOffsetRef.current?.offsetLeft, y, loy, cardZoneOffsetRef.current?.offsetTop);
