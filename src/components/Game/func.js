import { importAll, generateSetOfRandoms } from '../../utils';
export const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];

export const suitType = suit => (suit.match(/(Hearts|Diamonds)/) === null ? 'black' : 'red');
export const nums = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
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
export const images = importAll(require.context('../../assets/cards/', false, /\.(png)$/));
export const newGame = () => {
  const random = generateSetOfRandoms(1, 52, 52);
  return random.reduce(
    (cards, next, idx) => {
      cards.cardset = [
        ...cards.cardset.map((set, i) =>
          idx % 8 !== i
            ? set
            : [...set, { ...cardset[next - 1], cardId: next, springId: idx, group: i, seq: set.length + 1 }]
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

export const initfrom = _ => ({ x: 400, y: 500, shadow: false });
export const initto = i => ({ x: (i % 8) * 125, y: Math.floor(i / 8) * 30, delay: i * 0 });

export const getCardPosition = ({ group, seq }) => ({
  x: group * 125,
  y: (seq - 1) * 30,
});

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
