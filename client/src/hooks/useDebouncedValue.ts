import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";

export const useDebouncedValue = <T>(value: T, ms: number): T => {
  const [v, setV] = useState(value);
  const debouncedSetV = useMemo(() => (ms ? debounce(setV, ms) : setV), [ms]);

  useEffect(() => {
    debouncedSetV(value);
  }, [value, debouncedSetV]);

  return v;
};
