import { card as cardSize } from '../Styled';
import { importAll, enums, shuffle } from '../../utils';

let { width: cardWidth, padding } = cardSize;

export const images = importAll(require.context('../../assets/cards/', false, /\.(png)$/));
export const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
export const nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const suitType = suit => (suit.match(/(Hearts|Diamonds)/) === null ? 'black' : 'red');
export const isCardMatch = ({ seq, suit: suitA, number: numA }, { suit: suitB, number: numB }, isStraight = false) => {
  // * 判斷花色 -> 不是同花 但顏色一樣; 是同顏 但花色不一樣
  if (!isStraight && suitType(suitA) === suitType(suitB)) return false;
  else if (isStraight && suitA !== suitB) return false;

  if (nums.indexOf(numA) - nums.indexOf(numB) !== 1)
    // * 判斷數字
    return false;

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
          ri % 8 !== ci
            ? set
            : [...set, { ...cardset[next], cardId: next, springId: ri, group: ci, type: 'cardset', seq: set.length }]
        ),
      ];
      return cards;
    },
    {
      cardset: [[], [], [], [], [], [], [], []],
      foundation: [[], [], [], []],
      cells: [[], [], [], []],
    }
  );
};

export const initfrom = (_, magnifier = 1) => ({ x: 400, y: 500, shadow: false, zIndex: '10' });
export const initto = (i, magnifier = 1) => ({
  x: (i % 8) * (cardWidth + padding) * magnifier,
  y: Math.floor(i / 8) * 30 * magnifier,
  delay: i * 30,
});

export const getCardPosition = ({ type, group, seq }, magnifier = 1) => {
  const cardRange = (cardWidth + padding) * magnifier;
  const cardCollectZone = -145.5;
  const fixedGroup = type === 'foundation' ? group + 4 : group;

  return {
    x: fixedGroup * cardRange,
    y: (type.match(/(cell|foundation)/) ? cardCollectZone : seq * 30) * magnifier,
  };
};

export const getGroupRange = (groupId, magnifier = 1) => {
  const fixedPositionValue = -(padding / 2) * magnifier;
  const cardRange = (cardWidth + padding) * magnifier;
  const initCardRange = fixedPositionValue + cardRange;

  return groupId === 0
    ? [0, initCardRange]
    : [initCardRange + (groupId - 1) * cardRange, initCardRange + groupId * cardRange];
};

export const getMatchedGroup = ([x, y], magnifier = 1) => {
  const maxWidth = ((cardWidth + padding) * 8 - padding) * magnifier;
  const fixedCardWidth = cardWidth * magnifier;

  const totalMatched = enums(8, 0)
    .filter(groupId => {
      const [groupRangeStart, groupRangeEnd] = getGroupRange(groupId, magnifier);

      if (x < 0 && groupId === 0) return true;
      if (x > maxWidth && groupId === 7) return true;
      return [x, x + fixedCardWidth].some(pos => groupRangeStart <= pos && pos <= groupRangeEnd);
    })
    .map(groupId => {
      const [groupRangeStart, groupRangeEnd] = getGroupRange(groupId, magnifier);
      return {
        type: 'cardset',
        group: groupId,
        left: Math.min(x, groupRangeStart),
        right: Math.max(x + fixedCardWidth, groupRangeEnd),
      };
    })
    .sort((m, m1) => m.right - m.left - (m1.right - m1.left));

  // 1rem;
  if (y > -16) return totalMatched;

  return totalMatched.map(t => ({
    ...t,
    group: t.group % 4,
    type: t.group < 4 ? 'cells' : 'foundation',
    seq: 1,
  }));
};

export const getMagnifier = () => {
  // if (window.innerWidth >= 1920) return 2;
  if (window.innerWidth > 1200) return 1.2;
  else if (window.innerWidth > 992) return 1;
  else if (window.innerWidth > 768) return 0.8;
  else return 0.6;
};
