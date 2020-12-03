import { useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

export const useQueryParam = (
  param: string,
  defaultValue = ""
): [string, (nextValue: string | null) => void] => {
  const history = useHistory();
  const location = useLocation();

  return useMemo(() => {
    const u = new URL(window.location.toString());
    const v = u.searchParams.get(param) || defaultValue;

    return [
      v,
      (nextValue: string | null) => {
        const nextUrl = new URL(window.location.toString());
        if (!nextValue) {
          nextUrl.searchParams.delete(param);
        } else {
          nextUrl.searchParams.set(param, nextValue);
        }
        return history.push(nextUrl.search);
      },
    ];
    // location is only here to trigger updated, we need to use
    // window location inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, location, history]);
};
