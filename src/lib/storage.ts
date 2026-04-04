export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function createSettingsService<T>(key: string, defaults: T) {
  return {
    load(): T {
      const raw = localStorage.getItem(key);
      if (!raw) return defaults;
      return { ...defaults, ...(JSON.parse(raw) as Partial<T>) };
    },
    save(value: T): void {
      localStorage.setItem(key, JSON.stringify(value));
    },
  };
}

export function createListStorage<T>(key: string) {
  return {
    load(): T[] {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    },
    save(items: T[]): void {
      localStorage.setItem(key, JSON.stringify(items));
    },
  };
}
