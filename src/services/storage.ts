const STORAGE_KEYS = {
  SECRET_KEY: 'secret_key'
} as const;

export const storage = {
  getSecretKey: (): string | null => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SECRET_KEY);
    } catch (error) {
      console.error('Error reading secret key from localStorage:', error);
      return null;
    }
  }
}; 