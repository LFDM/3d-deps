export const scrollElementIntoView = (
  container: HTMLElement,
  element: HTMLElement
) => {
  const o = container.getBoundingClientRect();
  const i = element.getBoundingClientRect();
  if (
    o.top <= i.top &&
    o.left <= i.left &&
    o.bottom >= i.bottom &&
    o.right >= i.right
  ) {
    // element is fully visible
    return;
  }
  let yDiff = 0;
  if (o.top >= i.top) {
    // need to go up
    yDiff = i.top - o.top;
  }
  if (o.bottom <= i.bottom) {
    // need to go down
    yDiff = i.bottom - o.bottom;
  }
  container.scrollBy(0, yDiff);
};
