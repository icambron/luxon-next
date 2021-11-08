export const pick = <T, K extends keyof T>(obj: T, keys: K[]) => (keys.reduce<Partial<Pick<T, K>>>((a, k) => {
  a[k] = obj[k];
  return a;
}, {}) as Pick<T, K>);
