import { useState, useCallback } from 'react';

export type WaifuCategory = string;

export const SFW_CATEGORIES: string[] = [
  'waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug',
  'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile',
  'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill',
  'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'
];

export const NSFW_CATEGORIES: string[] = [
  'waifu'
];

const getCategory = (nsfw: boolean, selectedCategory: string | null): string => {
  // NSFW mode always uses 'waifu' category
  if (nsfw) {
    return 'waifu';
  }
  // SFW uses selected category or defaults to 'waifu'
  return selectedCategory || 'waifu';
};

export interface WaifuImage {
  url: string;
  category: string;
  timestamp: number;
  isNsfw: boolean;
}

export const useWaifu = () => {
  const [currentImage, setCurrentImage] = useState<WaifuImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WaifuImage[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchWaifu = useCallback(async (nsfw: boolean = false, selectedCategory: string | null = null) => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);
    setHistoryIndex(-1);

    // Simulate progress while fetching
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    try {
      const type = nsfw ? 'nsfw' : 'sfw';
      const category = getCategory(nsfw, selectedCategory);
      const response = await fetch(`https://api.waifu.pics/${type}/${category}`);

      if (!response.ok) {
        throw new Error('Failed to fetch waifu image');
      }

      const data = await response.json();

      const newImage: WaifuImage = {
        url: data.url,
        category,
        timestamp: Date.now(),
        isNsfw: nsfw,
      };

      setLoadingProgress(100);
      setCurrentImage(newImage);
      setHistory(prev => [newImage, ...prev.slice(0, 49)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  }, []);

  const goBack = useCallback(() => {
    if (history.length < 2) return false;
    const newIndex = historyIndex === -1 ? 0 : historyIndex + 1;
    if (newIndex >= history.length - 1) return false;
    setHistoryIndex(newIndex);
    setCurrentImage(history[newIndex + 1]);
    return true;
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex <= 0) return false;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    if (newIndex === -1) {
      setCurrentImage(history[0]);
    } else {
      setCurrentImage(history[newIndex]);
    }
    return true;
  }, [history, historyIndex]);

  const canGoBack = history.length >= 2 && (historyIndex === -1 ? 0 : historyIndex) < history.length - 2;
  const canGoForward = historyIndex > -1;

  return {
    currentImage,
    isLoading,
    error,
    history,
    historyIndex,
    loadingProgress,
    fetchWaifu,
    setCurrentImage,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  };
};
