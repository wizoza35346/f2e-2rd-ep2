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
