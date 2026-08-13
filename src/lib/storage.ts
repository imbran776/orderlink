// Safe localStorage wrapper to prevent crashes in iframe environments
const memoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[storage] localStorage is blocked, falling back to memory storage');
      return memoryStorage[key] || null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[storage] localStorage is blocked, falling back to memory storage');
      memoryStorage[key] = value;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[storage] localStorage is blocked, falling back to memory storage');
      delete memoryStorage[key];
    }
  }
};
