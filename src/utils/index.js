export function importAll(r) {
  return r.keys().reduce((res, item) => ({ ...res, [item.replace('./', '')]: r(item) }), {});
}

export function generateSetOfRandoms(start, end, length, repeat = false) {
  const _newRandom = () => Math.floor(Math.random() * end) + start;
  const _setOfRandom = func => Array(length).join().split(',').map(func);

  if (repeat) return _setOfRandom(_newRandom);
  else {
    let randoms = [];
    return _setOfRandom(_ => {
      let newRandom;
      (function j() {
        newRandom = _newRandom();
        if (randoms.indexOf(newRandom) === -1) randoms = [...randoms, newRandom];
        else j();
      })();
      return newRandom;
    });
  }
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
