import { useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

export const useQueryParam = (
  param: string,
  defaultValue = ""
): [string, (nextValue: string | null) => void] => {
  const location = useLocation();
  const history = useHistory();

  return useMemo(() => {
    const u = new URL(window.location.toString());
    const v = u.searchParams.get(param) || defaultValue;

    return [
      v,
      (nextValue: string | null) => {
        const nextUrl = new URL(window.location.toString());
        if (nextValue === null) {
          nextUrl.searchParams.delete(param);
        } else {
          nextUrl.searchParams.set(param, nextValue);
        }
        return history.push(nextUrl.search);
      },
    ];
  }, [param, location, history]);
};