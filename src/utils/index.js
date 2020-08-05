export function importAll(r) {
  return r.keys().reduce((res, item) => ({ ...res, [item.replace('./', '')]: r(item) }), {});
}
export const enums = (n, startWith = 1) =>
  Array(n)
    .join('_')
    .split('_')
    .map((_, i) => i + startWith);

// Fisher–Yates Shuffle洗牌演算法
// Ref: https://www.jianshu.com/p/7cb95ad7d5d5
export function shuffle(array) {
  let m = array.length;

  while (m) {
    const i = Math.floor(Math.random() * m--);
    [array[i], array[m]] = [array[m], array[i]];
  }

  return array;
}

export function debounce(func, delay = 250) {
  let p = null;

  return () => {
    let context = this;
    let args = arguments;

    clearTimeout(p);

    p = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

export function throttle(func, timeout = 250) {
  let last;
  let timer;

  return function () {
    const context = this;
    const args = arguments;
    const now = +new Date();

    if (last && now < last + timeout) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        last = now;
        func.apply(context, args);
      }, timeout);
    } else {
      last = now;
      func.apply(context, args);
    }
  };
}
