export function maybeArray<T>(thing: T | T[]) {
  return Array.isArray(thing) ? thing : [thing];
}

export function bestBy<T, U>(arr: T[], by: (_: T) => U, compare: (_: U, __: U) => U): T | null {
  const best = arr.reduce<[U, T] | undefined>((best, next) => {
    const pair: [U, T] = [by(next), next];
    if (best === undefined) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, undefined);

  if (best === undefined) return null;

  return best[1];
}
