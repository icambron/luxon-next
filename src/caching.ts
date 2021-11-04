export type Cache = Map<any, any>;
const allCaches = new Map<string, Cache>()

// todo - make clearCaches accessible publicly but move the memo to somewhere private

export const clearCaches = () => {
  for (const cache of allCaches.values()) {
    cache.clear();
  }
};

export const memo = <TKey, TValue>(cacheName: string, builder: (key: TKey) => TValue): (key: TKey) => TValue => {
  const cache = new Map<TKey, TValue>();
  allCaches.set(cacheName, cache);
  return (key: TKey): TValue => {
    const cached = cache.get(key);
    if (cached) return cached;
    const fresh = builder(key);
    cache.set(key, fresh);
    return fresh;
  };
};