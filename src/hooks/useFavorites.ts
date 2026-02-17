import { useState, useEffect, useCallback } from 'react';
import { WaifuImage } from './useWaifu';

const FAVORITES_KEY = 'swipewaifu_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<WaifuImage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const saveFavorites = useCallback((newFavorites: WaifuImage[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  }, []);

  const addFavorite = useCallback((image: WaifuImage) => {
    const exists = favorites.some(f => f.url === image.url);
    if (!exists) {
      saveFavorites([image, ...favorites]);
    }
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((url: string) => {
    saveFavorites(favorites.filter(f => f.url !== url));
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((url: string) => {
    return favorites.some(f => f.url === url);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites,
  };
};
