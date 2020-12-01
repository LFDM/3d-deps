export const compact = <T>(list: (T | undefined | null)[]): T[] => {
  const result: T[] = [];
  for (const el of list) {
    if (el) {
      result.push(el);
    }
  }
  return result;
};
