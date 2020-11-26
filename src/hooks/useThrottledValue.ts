import { throttle } from "lodash";
import { useEffect, useMemo, useState } from "react";

export const useThrottledValue = <T>(value: T, ms: number): T => {
  const [v, setV] = useState(value);
  const throttledSetValue = useMemo(() => (ms ? throttle(setV, ms) : setV), [
    ms,
  ]);

  useEffect(() => {
    throttledSetValue(value);
  }, [value, throttledSetValue]);

  return v;
};
