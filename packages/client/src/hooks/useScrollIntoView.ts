import { useEffect, useRef } from "react";

type OptionalRect = {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
};

export const isElementInViewport = (
  el: Element,
  thresholds: OptionalRect = {}
) => {
  const {
    top: elTop,
    left: elLeft,
    bottom: elBottom,
    right: elRight,
  } = el.getBoundingClientRect();

  const { top = 0, left = 0, bottom = 0, right = 0 } = thresholds;

  const vpTop = 0 + top;
  const vpLeft = 0 + left;
  const vpBottom =
    (window.innerHeight || document.documentElement.clientHeight) - bottom;
  const vpRight =
    (window.innerWidth || document.documentElement.clientWidth) - right;

  return (
    elTop >= vpTop &&
    elLeft >= vpLeft &&
    elBottom <= vpBottom &&
    elRight <= vpRight
  );
};

// TODO also allow to define an offset for when an element is considered
// to be in the viewport.
export const useScrollIntoView = <T extends Element = Element>(
  active: boolean,
  options: ScrollIntoViewOptions = {},
  thresholds: OptionalRect = {}
) => {
  const ref = useRef<T>(null!);
  const { behavior, block, inline } = options;
  const { top, left, right, bottom } = thresholds;
  useEffect(() => {
    if (
      ref.current &&
      active &&
      !isElementInViewport(ref.current, { top, left, right, bottom })
    ) {
      ref.current.scrollIntoView({
        behavior,
        block,
        inline,
      });
    }
  }, [active, behavior, block, inline, top, left, right, bottom]);

  return ref;
};
