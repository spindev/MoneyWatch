/**
 * Generic localStorage service factories.
 * Reduces boilerplate across all sub-apps.
 */

/** Generates a short unique ID for new records. */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Creates a typed settings service for a given localStorage key. */
export function createSettingsService<T>(key: string, defaults: T) {
  return {
    load(): T {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaults;
        return { ...defaults, ...(JSON.parse(raw) as Partial<T>) };
      } catch {
        return defaults;
      }
    },
    save(value: T): void {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

/** Creates a typed list storage service for a given localStorage key. */
export function createListStorage<T>(key: string) {
  return {
    load(): T[] {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T[]) : [];
      } catch {
        return [];
      }
    },
    save(items: T[]): void {
      localStorage.setItem(key, JSON.stringify(items));
    },
  };
}
