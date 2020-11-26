import { useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

export const useQueryParam = (
  param: string
): [string, (nextValue: string) => void] => {
  const location = useLocation();
  const history = useHistory();

  return useMemo(() => {
    const u = new URL(window.location.toString());
    const v = u.searchParams.get(param) || "";

    return [
      v,
      (nextValue: string) => {
        const nextUrl = new URL(window.location.toString());
        nextUrl.searchParams.set(param, nextValue);
        return history.push(nextUrl.toString());
      },
    ];
  }, [param, location, history]);
};
