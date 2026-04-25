/**
 * Surface-agnostic key/value storage. Each surface (web, extension) provides
 * its own implementation so the stores in `@pomotimer/store` stay portable.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  /**
   * Optional: notify when `key` changes externally (other tab, service
   * worker, etc.). Returns an unsubscribe fn. When unimplemented, the
   * caller is responsible for being the sole writer.
   */
  subscribe?<T>(
    key: string,
    listener: (value: T | undefined) => void,
  ): () => void;
}
