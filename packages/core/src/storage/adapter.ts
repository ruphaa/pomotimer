/**
 * Surface-agnostic key/value storage. Each surface (web, extension) provides
 * its own implementation so the stores in `@pomotimer/store` stay portable.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
