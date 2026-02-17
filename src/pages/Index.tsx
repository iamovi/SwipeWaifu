import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Menu, X, Heart, Trash2, EyeOff, Eye, HelpCircle, MessageCircle, Volume2, VolumeX, ChevronLeft, ChevronRight, Play, Pause, Sun, Moon, Keyboard, Download, BarChart3 } from 'lucide-react';
import { useWaifu, WaifuImage } from '@/hooks/useWaifu';
import { useFavorites } from '@/hooks/useFavorites';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Progress } from '@/components/ui/progress';
import { useAutoSlideTimer } from '@/hooks/useAutoSlideTimer';
import { ResetConfirmDialog } from '@/components/ResetConfirmDialog';
import { CategoryPicker } from '@/components/CategoryPicker';
import { useIsMobile } from '@/hooks/use-mobile';
import initWaifuImage from '@/assets/init-waifu.jpg';

const NOTIFICATIONS = [
  'waifu appeared!',
  'new waifu~',
  'here she is!',
  'waifu incoming!',
  'another one!',
  'caught one!',
  'waifu get!',
];

const shuffleVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15,
    x: 100,
  },
  animate: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1] as const,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    rotateY: 15,
    x: -100,
    transition: {
      duration: 0.3,
      ease: 'easeIn' as const,
    }
  },
};

const Index = () => {
  const isMobile = useIsMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showTalks, setShowTalks] = useState(false);
  const [talksLoading, setTalksLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [autoSlide, setAutoSlide] = useState(false);
  const [autoSlideInterval, setAutoSlideInterval] = useState(3);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });
  const [viewCount, setViewCount] = useState(() => {
    return parseInt(localStorage.getItem('waifu-view-count') || '0', 10);
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('nsfw-age-verified') === 'true';
  });
  const [imageLoaded, setImageLoaded] = useState(true);
  const [isInitialState, setIsInitialState] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isNsfw, setIsNsfw] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('waifu');
  const [lastTap, setLastTap] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('sound-muted') === 'true';
  });

  const { currentImage, isLoading, loadingProgress, fetchWaifu, setCurrentImage, goBack, goForward, canGoBack, canGoForward } = useWaifu();
  const { favorites, addFavorite, removeFavorite, isFavorite, clearFavorites } = useFavorites();
  const { playSwipeSound, playFavoriteSound, playUnfavoriteSound, playMenuSound } = useSoundEffects();
  const { timeRemaining, isRunning } = useAutoSlideTimer({
    interval: autoSlideInterval,
    enabled: autoSlide && !isLoading && imageLoaded,
    onComplete: () => handleNext(),
    resetKey: currentImage?.url,
  });

  const playSoundIfEnabled = useCallback((soundFn: () => void) => {
    if (!isMuted) soundFn();
  }, [isMuted]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('sound-muted', String(newMuted));
    setNotification(newMuted ? '🔇 muted' : '🔊 unmuted');
    setTimeout(() => setNotification(null), 1500);
  }, [isMuted]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setNotification('📱 installed!');
      setTimeout(() => setNotification(null), 1500);
    }
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // View counter
  useEffect(() => {
    if (imageLoaded && currentImage) {
      const newCount = viewCount + 1;
      setViewCount(newCount);
      localStorage.setItem('waifu-view-count', String(newCount));
      showNotification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage?.url, imageLoaded]);

  const showNotification = useCallback(() => {
    const msg = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const showFavoriteNotification = useCallback((added: boolean) => {
    setNotification(added ? '♥ saved!' : '♥ removed');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  const handleNext = useCallback(() => {
    setIsInitialState(false);
    setImageLoaded(false);
    playSoundIfEnabled(playSwipeSound);
    fetchWaifu(isNsfw, selectedCategory);
  }, [fetchWaifu, isNsfw, selectedCategory, playSwipeSound, playSoundIfEnabled]);

  const handlePrev = useCallback(() => {
    if (goBack()) {
      setImageLoaded(false);
      playSoundIfEnabled(playSwipeSound);
    }
  }, [goBack, playSwipeSound, playSoundIfEnabled]);

  const handleSwipe = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Allow swipe on initial state, otherwise check loading
    if (!isInitialState && (isLoading || !imageLoaded)) return;
    if (Math.abs(info.offset.x) > 50 || Math.abs(info.offset.y) > 50) {
      handleNext();
    }
  }, [handleNext, isLoading, imageLoaded, isInitialState]);

  const handleNsfwToggle = useCallback(() => {
    if (!isNsfw && !ageVerified) {
      setShowAgeVerification(true);
    } else {
      const newNsfw = !isNsfw;
      setIsNsfw(newNsfw);
      // Reset to 'waifu' when switching modes (always available in both)
      setSelectedCategory('waifu');
      setNotification(newNsfw ? '🔞 NSFW on' : '✓ SFW on');
      setTimeout(() => setNotification(null), 1500);
    }
  }, [isNsfw, ageVerified]);

  const handleAgeConfirm = useCallback(() => {
    setAgeVerified(true);
    localStorage.setItem('nsfw-age-verified', 'true');
    setShowAgeVerification(false);
    setIsNsfw(true);
    setSelectedCategory('waifu');
    setNotification('🔞 NSFW on');
    setTimeout(() => setNotification(null), 1500);
  }, []);

  const handleAgeCancel = useCallback(() => {
    setShowAgeVerification(false);
  }, []);

  const handleFavoriteToggle = useCallback(() => {
    if (!currentImage) return;
    const wasFavorite = isFavorite(currentImage.url);
    if (wasFavorite) {
      removeFavorite(currentImage.url);
      playSoundIfEnabled(playUnfavoriteSound);
    } else {
      addFavorite(currentImage);
      playSoundIfEnabled(playFavoriteSound);
    }
    showFavoriteNotification(!wasFavorite);
  }, [currentImage, isFavorite, addFavorite, removeFavorite, playFavoriteSound, playUnfavoriteSound, playSoundIfEnabled, showFavoriteNotification]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleFavoriteToggle();
    }
    setLastTap(now);
  }, [lastTap, handleFavoriteToggle]);

  const handleImageSelect = (image: WaifuImage) => {
    setCurrentImage(image);
    setImageLoaded(false);
    playSoundIfEnabled(playSwipeSound);
    setIsMenuOpen(false);
  };

  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setNotification(newTheme === 'dark' ? '🌙 dark mode' : '☀️ light mode');
    setTimeout(() => setNotification(null), 1500);
  }, [theme]);

  const handleAutoSlideToggle = useCallback(() => {
    setAutoSlide(prev => {
      const next = !prev;
      setNotification(next ? '▶ auto-slide on' : '⏸ stopped');
      setTimeout(() => setNotification(null), 1500);
      return next;
    });
  }, []);

  // Keyboard controls - ArrowLeft/Up = prev, ArrowRight/Down = next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMenuOpen || showTalks || showAgeVerification) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        // Always allow next (starts from initial state or fetches new)
        if (isInitialState || (!isLoading && imageLoaded)) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (isInitialState) {
          handleNext(); // First action from initial state
        } else if (!isLoading && imageLoaded) {
          handlePrev();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        if (!isInitialState) handleFavoriteToggle();
      } else if (e.key === '?') {
        setShowShortcuts(prev => !prev);
      } else if (e.key === 'a') {
        handleAutoSlideToggle();
      } else if (e.key === 'm') {
        handleMuteToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, showTalks, showAgeVerification, isLoading, imageLoaded, isInitialState, handleNext, handlePrev, handleFavoriteToggle, handleAutoSlideToggle, handleMuteToggle]);


  return (
    <div className="h-dvh w-screen bg-background fixed inset-0 flex items-center justify-center">
      {/* Fullscreen Waifu Image with Swipe */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        {...(isMobile ? {
          drag: true as const,
          dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
          dragElastic: 0.2,
          onDragEnd: handleSwipe,
        } : {})}
        onClick={handleDoubleTap}
        style={{ touchAction: isMobile ? 'none' : 'auto' }}
      >
        <AnimatePresence mode="wait">
          {(isLoading || !imageLoaded) && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 gap-4"
            >
              <div className="w-48 flex flex-col items-center gap-2">
                <Progress value={loadingProgress} className="h-1" />
                <span className="text-xs text-foreground/50 font-mono">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Initial Welcome Screen */}
        <AnimatePresence mode="wait">
          {isInitialState && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <img
                src={initWaifuImage}
                alt="Welcome"
                className="w-full h-full object-contain select-none md:max-w-3xl md:max-h-[85vh]"
                draggable={false}
              />
              {/* Overlay Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-20 md:bottom-28 left-0 right-0 flex flex-col items-center gap-2"
              >
                <span className="text-lg md:text-xl font-medium text-foreground/90">
                  {isMobile ? 'hi, swipe for waifu' : 'hi, press → for waifu'}
                </span>

                {/* Mobile: Swipe direction arrows */}
                {isMobile ? (
                  <div className="relative w-20 h-20 flex items-center justify-center mt-2">
                    {/* Up arrow */}
                    <motion.span
                      animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      className="absolute top-0 text-xl text-foreground"
                    >↑</motion.span>
                    {/* Down arrow */}
                    <motion.span
                      animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                      className="absolute bottom-0 text-xl text-foreground"
                    >↓</motion.span>
                    {/* Left arrow */}
                    <motion.span
                      animate={{ x: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                      className="absolute left-0 text-xl text-foreground"
                    >←</motion.span>
                    {/* Right arrow */}
                    <motion.span
                      animate={{ x: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.9, ease: "easeInOut" }}
                      className="absolute right-0 text-xl text-foreground"
                    >→</motion.span>
                  </div>
                ) : (
                  /* Desktop: Keyboard key hints */
                  <div className="flex items-center gap-4 mt-4">
                    <motion.div
                      animate={{ x: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="flex items-center gap-2 text-foreground/70"
                    >
                      <kbd className="px-2.5 py-1 bg-foreground/10 border border-foreground/20 text-sm font-mono">←</kbd>
                      <span className="text-xs">prev</span>
                    </motion.div>
                    <motion.div
                      animate={{ x: [0, 4, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                      className="flex items-center gap-2 text-foreground/70"
                    >
                      <kbd className="px-2.5 py-1 bg-foreground/10 border border-foreground/20 text-sm font-mono">→</kbd>
                      <span className="text-xs">next</span>
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.8, ease: "easeInOut" }}
                      className="flex items-center gap-2 text-foreground/50"
                    >
                      <kbd className="px-2.5 py-1 bg-foreground/10 border border-foreground/20 text-sm font-mono">Space</kbd>
                      <span className="text-xs">favorite</span>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isInitialState && currentImage && (
            <motion.img
              key={currentImage.url}
              src={currentImage.url}
              alt="Anime Waifu"
              className="w-full h-full object-contain select-none md:max-w-3xl md:max-h-[85vh]"
              variants={shuffleVariants}
              initial="initial"
              animate={imageLoaded ? "animate" : "initial"}
              exit="exit"
              onLoad={() => setImageLoaded(true)}
              draggable={false}
              style={{ perspective: 1000 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop Navigation Arrows */}
      {!isMobile && !isMenuOpen && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onClick={() => isInitialState ? handleNext() : handlePrev()}
            disabled={!isInitialState && !canGoBack}
            className="fixed left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center bg-foreground/5 hover:bg-foreground/15 border border-foreground/10 hover:border-foreground/25 transition-all duration-300 group disabled:opacity-10 disabled:pointer-events-none"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6 text-foreground/40 group-hover:text-foreground/90 transition-colors duration-200" />
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onClick={handleNext}
            disabled={!isInitialState && (isLoading || !imageLoaded)}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center bg-foreground/5 hover:bg-foreground/15 border border-foreground/10 hover:border-foreground/25 transition-all duration-300 group disabled:opacity-10 disabled:pointer-events-none"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6 text-foreground/40 group-hover:text-foreground/90 transition-colors duration-200" />
          </motion.button>
        </>
      )}

      {/* Minimal UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 md:px-8 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-3">
            {/* History Navigation - mobile only (desktop uses side arrows) */}
            {isMobile && (
              <button
                onClick={handlePrev}
                disabled={!canGoBack}
                className={`p-1.5 transition-colors ${canGoBack ? 'hover:bg-foreground/10' : 'opacity-30 cursor-not-allowed'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span className="text-xs uppercase tracking-widest text-foreground/40">
              {currentImage?.category || 'waifu'}
            </span>
            {isMobile && (
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-foreground/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Auto-slide indicator */}
            {autoSlide && isRunning && (
              <div className="flex items-center gap-1.5">
                <Play className="w-3 h-3 fill-foreground/40 text-foreground/40" />
                <div className="relative w-8 h-5 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={timeRemaining}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute text-sm font-mono text-foreground/60 tabular-nums"
                    >
                      {timeRemaining}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            )}
            {/* View counter */}
            <span className="text-xs text-foreground/40 tabular-nums">
              #{viewCount}
            </span>
            <button
              onClick={() => {
                playSoundIfEnabled(playMenuSound);
                setIsMenuOpen(true);
              }}
              className="p-2 hover:bg-foreground/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Bottom Toolbar */}
      {!isMobile && !isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          drag
          dragMomentum={false}
          dragElastic={0}
          whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
          style={{ cursor: 'grab' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-2 py-1.5 bg-background border border-foreground/[0.12] select-none"
        >
          {/* Favorite */}
          <button
            onClick={handleFavoriteToggle}
            disabled={!currentImage || isInitialState}
            className={`p-2.5 transition-all duration-200 ${currentImage && isFavorite(currentImage.url)
              ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
              : 'hover:bg-foreground/10 text-foreground/40 hover:text-foreground/80'
              } disabled:opacity-20 disabled:pointer-events-none`}
            title="Toggle Favorite (Space)"
          >
            <Heart className={`w-4 h-4 ${currentImage && isFavorite(currentImage.url) ? 'fill-current' : ''}`} />
          </button>

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* Category */}
          <span className="px-3 text-[11px] uppercase tracking-widest text-foreground/35 select-none">
            {selectedCategory}
          </span>

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* NSFW */}
          <button
            onClick={handleNsfwToggle}
            className={`p-2.5 transition-all duration-200 ${isNsfw
              ? 'bg-foreground/15 text-foreground'
              : 'hover:bg-foreground/10 text-foreground/40 hover:text-foreground/80'
              }`}
            title={isNsfw ? 'Switch to SFW' : 'Switch to NSFW'}
          >
            {isNsfw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* Sound */}
          <button
            onClick={handleMuteToggle}
            className={`p-2.5 transition-all duration-200 ${isMuted
              ? 'bg-foreground/15 text-foreground'
              : 'hover:bg-foreground/10 text-foreground/40 hover:text-foreground/80'
              }`}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* Theme */}
          <button
            onClick={handleThemeToggle}
            className="p-2.5 hover:bg-foreground/10 text-foreground/40 hover:text-foreground/80 transition-all duration-200"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* Auto-slide */}
          <button
            onClick={handleAutoSlideToggle}
            className={`p-2.5 transition-all duration-200 ${autoSlide
              ? 'bg-foreground/15 text-foreground'
              : 'hover:bg-foreground/10 text-foreground/40 hover:text-foreground/80'
              }`}
            title="Toggle Auto-slide (A)"
          >
            {autoSlide ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Auto-slide speed selector */}
          {autoSlide && (
            <>
              <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />
              <div className="flex items-center gap-0.5 px-1">
                {[2, 3, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setAutoSlideInterval(s)}
                    className={`px-2 py-1 text-[10px] font-mono transition-all duration-200 ${autoSlideInterval === s
                      ? 'bg-foreground/15 text-foreground'
                      : 'text-foreground/30 hover:text-foreground/60'
                      }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="w-px h-5 bg-foreground/[0.08] mx-0.5" />

          {/* Keyboard shortcut hint */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-foreground/10 transition-all duration-200 group"
            title="Keyboard Shortcuts (?)"
          >
            <kbd className="px-1.5 py-0.5 bg-foreground/[0.06] border border-foreground/[0.08] text-[10px] text-foreground/30 font-mono group-hover:text-foreground/60 transition-colors">?</kbd>
            <span className="text-[10px] text-foreground/25 group-hover:text-foreground/50 tracking-wide transition-colors">shortcuts</span>
          </button>
        </motion.div>
      )}

      {/* Notification */}
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 md:bottom-20 md:right-8 px-4 py-2 bg-foreground text-background text-sm z-40"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Menu (mobile) / Sidebar (desktop) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Desktop backdrop overlay */}
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/40 z-40"
              />
            )}
            <motion.div
              initial={isMobile ? { opacity: 0 } : { opacity: 1, x: 440 }}
              animate={isMobile ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={isMobile ? { opacity: 0 } : { opacity: 1, x: 440 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className={`fixed bg-background z-50 ${isMobile
                ? 'inset-0'
                : 'top-0 right-0 bottom-0 w-[420px] border-l border-border'
                }`}
            >
              <div className="h-full flex flex-col">
                {/* Menu Header */}
                <div className="shrink-0 border-b border-border">
                  <div className="p-4 flex justify-between items-center">
                    <h2 className="text-lg font-medium uppercase tracking-widest">Menu</h2>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-foreground/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Menu Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  {/* Quick Actions Grid */}
                  <div className="p-4 border-b border-border">
                    <div className="grid grid-cols-2 gap-2">
                      {/* NSFW Toggle */}
                      <button
                        onClick={handleNsfwToggle}
                        className={`py-3 border transition-colors flex items-center justify-center gap-2 text-sm ${isNsfw
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground/50'
                          }`}
                      >
                        {isNsfw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isNsfw ? 'NSFW' : 'SFW'}
                      </button>

                      {/* Mute Toggle */}
                      <button
                        onClick={handleMuteToggle}
                        className={`py-3 border transition-colors flex items-center justify-center gap-2 text-sm ${isMuted
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground/50'
                          }`}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        {isMuted ? 'Muted' : 'Sound'}
                      </button>

                      {/* Theme Toggle */}
                      <button
                        onClick={handleThemeToggle}
                        className="py-3 border border-border hover:border-foreground/50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {theme === 'dark' ? 'Light' : 'Dark'}
                      </button>

                      {/* Auto-slide Toggle */}
                      <button
                        onClick={handleAutoSlideToggle}
                        className={`py-3 border transition-colors flex items-center justify-center gap-2 text-sm ${autoSlide
                          ? 'bg-foreground text-background border-foreground'
                          : 'border-border hover:border-foreground/50'
                          }`}
                      >
                        {autoSlide ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {autoSlide ? 'Stop' : 'Auto'}
                      </button>

                      {/* Join Talks */}
                      <button
                        onClick={() => {
                          playSoundIfEnabled(playMenuSound);
                          setTalksLoading(true);
                          setShowTalks(true);
                          setIsMenuOpen(false);
                        }}
                        className="py-3 border border-border hover:border-foreground/50 transition-colors flex items-center justify-center text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Talks
                      </button>

                      {/* Keyboard Shortcuts */}
                      <button
                        onClick={() => {
                          setShowShortcuts(true);
                          setIsMenuOpen(false);
                        }}
                        className="py-3 border border-border hover:border-foreground/50 transition-colors flex items-center justify-center text-sm"
                      >
                        <Keyboard className="w-4 h-4" />
                        Keys
                      </button>
                    </div>

                    {/* Auto-slide speed */}
                    {autoSlide && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Speed:</span>
                        {[2, 3, 5, 10].map(s => (
                          <button
                            key={s}
                            onClick={() => setAutoSlideInterval(s)}
                            className={`px-2 py-1 text-xs border transition-colors ${autoSlideInterval === s
                              ? 'bg-foreground text-background border-foreground'
                              : 'border-border hover:border-foreground/50'
                              }`}
                          >
                            {s}s
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category Picker - SFW only */}
                  {!isNsfw && (
                    <CategoryPicker
                      selectedCategory={selectedCategory}
                      onCategoryChange={(category) => {
                        setSelectedCategory(category);
                        setNotification(`✨ ${category}`);
                        setTimeout(() => setNotification(null), 1500);
                      }}
                      isNsfw={isNsfw}
                    />
                  )}

                  {/* Stats */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">Stats</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{viewCount} viewed</span>
                    </div>
                  </div>

                  {/* Install PWA */}
                  {showInstallPrompt && (
                    <div className="p-4 border-b border-border">
                      <button
                        onClick={handleInstall}
                        className="w-full py-3 border border-border hover:border-foreground/50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Install App
                      </button>
                    </div>
                  )}

                  {/* Help Section */}
                  <div className="p-4 border-b border-border">
                    <button
                      onClick={() => setShowHelp(!showHelp)}
                      className={`w-full py-3 border transition-colors flex items-center justify-center gap-2 text-sm ${showHelp
                        ? 'bg-foreground text-background border-foreground'
                        : 'border-border hover:border-foreground/50'
                        }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      How to Use
                    </button>

                    <AnimatePresence>
                      {showHelp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span>Next waifu</span>
                              <span className="text-foreground text-xs">{isMobile ? 'Swipe any / →' : '→ / Click right arrow'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span>Previous</span>
                              <span className="text-foreground text-xs">{isMobile ? '← button in header' : '← / Click left arrow'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span>Save favorite</span>
                              <span className="text-foreground text-xs">{isMobile ? 'Double-tap / Space' : 'Space / Double-click'}</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span>Auto-slide</span>
                              <span className="text-foreground text-xs">A key</span>
                            </div>
                            <div className="flex justify-between border-b border-border/50 pb-2">
                              <span>Mute / Unmute</span>
                              <span className="text-foreground text-xs">M key</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shortcuts</span>
                              <span className="text-foreground text-xs">? key</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Current Image Actions */}
                  {currentImage && (
                    <div className="p-4 border-b border-border">
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Current Image</h3>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleFavoriteToggle}
                          className={`flex-1 max-w-xs py-3 border transition-colors flex items-center justify-center gap-2 ${isFavorite(currentImage.url)
                            ? 'bg-foreground text-background border-foreground'
                            : 'border-border hover:border-foreground/50'
                            }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(currentImage.url) ? 'fill-current' : ''}`} />
                          {isFavorite(currentImage.url) ? 'Saved' : 'Save'}
                        </button>
                        <button
                          onClick={() => setShowResetDialog(true)}
                          className="flex-1 max-w-xs py-3 border border-border hover:border-destructive text-foreground hover:text-destructive transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Favorites */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs uppercase tracking-widest text-muted-foreground">
                        Favorites ({favorites.length})
                      </h3>
                    </div>

                    {favorites.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No favorites yet</p>
                    ) : (
                      <div className={`grid gap-1 ${isMobile
                        ? 'grid-cols-3 sm:grid-cols-4'
                        : 'grid-cols-3'
                        }`}>
                        {favorites.map((image, index) => (
                          <div key={image.url + index} className="relative group aspect-square">
                            <button
                              onClick={() => handleImageSelect(image)}
                              className="w-full h-full"
                            >
                              <img
                                src={image.url}
                                alt={`Favorite ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <button
                              onClick={() => removeFavorite(image.url)}
                              className="absolute top-1 right-1 p-1 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Credit */}
                  <div className="p-4 text-center">
                    <span className="text-xs text-muted-foreground">
                      created by{' '}
                      <a
                        href="https://iamovi.github.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline transition-colors"
                      >
                        Ovi ren
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Age Verification Modal */}
      <AnimatePresence>
        {showAgeVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full border border-border p-6 bg-background"
            >
              <h2 className="text-xl font-medium uppercase tracking-widest mb-4 text-center">
                Age Verification
              </h2>
              <p className="text-muted-foreground text-sm mb-6 text-center leading-relaxed">
                You are about to enable NSFW content. This section contains adult material
                intended for viewers 18 years of age or older.
              </p>
              <p className="text-foreground text-sm mb-8 text-center font-medium">
                Are you 18 years or older?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleAgeCancel}
                  className="flex-1 py-3 border border-border hover:border-foreground/50 transition-colors text-sm uppercase tracking-wider"
                >
                  No, Go Back
                </button>
                <button
                  onClick={handleAgeConfirm}
                  className="flex-1 py-3 bg-foreground text-background border border-foreground transition-colors text-sm uppercase tracking-wider hover:bg-foreground/90"
                >
                  Yes, I'm 18+
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Talks Embed */}
      <AnimatePresence>
        {showTalks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-[70] flex flex-col"
          >
            {/* Compact Navbar */}
            <div className="shrink-0 border-b border-border bg-background px-3 py-2 flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Talks
              </span>
              <button
                onClick={() => setShowTalks(false)}
                className="p-1.5 hover:bg-foreground/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Site */}
            <div className="flex-1 w-full relative">
              {/* Loading State */}
              <AnimatePresence>
                {talksLoading && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-background z-10"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Loading...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <iframe
                src="https://aniwifetalks.pages.dev/"
                className="w-full h-full border-0"
                title="AniWife Talks"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                onLoad={() => setTalksLoading(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Overlay */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShortcuts(false)}
            className="fixed inset-0 bg-background/95 z-[80] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full border border-border p-6 bg-background"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium uppercase tracking-widest flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  Shortcuts
                </h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-1.5 hover:bg-foreground/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Next waifu</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">→</kbd>
                    <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">↓</kbd>
                  </div>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Previous waifu</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">←</kbd>
                    <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">↑</kbd>
                  </div>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Favorite</span>
                  <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">Space</kbd>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Auto-slide</span>
                  <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">A</kbd>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Mute / Unmute</span>
                  <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">M</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This popup</span>
                  <kbd className="px-2 py-0.5 bg-muted text-foreground text-xs">?</kbd>
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground text-center">
                Press any key or click outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Dialog */}
      <ResetConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        onConfirm={() => {
          localStorage.clear();
          setViewCount(0);
          setIsNsfw(false);
          setAutoSlide(false);
          setTheme('dark');
          setIsMuted(false);
          clearFavorites();
          setNotification('🔄 reset complete');
          setTimeout(() => setNotification(null), 1500);
        }}
      />
    </div>
  );
};

export default Index;
