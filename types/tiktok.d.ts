declare global {
  interface Window {
    ttq: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      instance: (pixelId: string) => void;
      identify: (userId: string) => void;
      logout: () => void;
    };
  }
}

export {};