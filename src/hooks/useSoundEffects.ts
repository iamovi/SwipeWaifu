 import { useCallback, useRef } from 'react';
 
 export const useSoundEffects = () => {
   const audioContextRef = useRef<AudioContext | null>(null);
 
   const getAudioContext = useCallback(() => {
     if (!audioContextRef.current) {
       audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     return audioContextRef.current;
   }, []);
 
   // Kawaii pop sound for swipe
   const playSwipeSound = useCallback(() => {
     try {
       const ctx = getAudioContext();
       const oscillator = ctx.createOscillator();
       const gainNode = ctx.createGain();
       
       oscillator.connect(gainNode);
       gainNode.connect(ctx.destination);
       
       oscillator.frequency.setValueAtTime(880, ctx.currentTime);
       oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.05);
       oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
       
       oscillator.type = 'sine';
       
       gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
       
       oscillator.start(ctx.currentTime);
       oscillator.stop(ctx.currentTime + 0.15);
     } catch (e) {
       console.log('Audio not available');
     }
   }, [getAudioContext]);
 
   // Cute sparkle sound for favorite
   const playFavoriteSound = useCallback(() => {
     try {
       const ctx = getAudioContext();
       
       const playNote = (freq: number, delay: number) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         
         osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
         osc.type = 'sine';
         
         gain.gain.setValueAtTime(0, ctx.currentTime + delay);
         gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2);
         
         osc.start(ctx.currentTime + delay);
         osc.stop(ctx.currentTime + delay + 0.2);
       };
       
       // Ascending sparkle arpeggio
       playNote(523, 0);      // C5
       playNote(659, 0.06);   // E5
       playNote(784, 0.12);   // G5
       playNote(1047, 0.18);  // C6
     } catch (e) {
       console.log('Audio not available');
     }
   }, [getAudioContext]);
 
   // Soft unfavorite sound
   const playUnfavoriteSound = useCallback(() => {
     try {
       const ctx = getAudioContext();
       const oscillator = ctx.createOscillator();
       const gainNode = ctx.createGain();
       
       oscillator.connect(gainNode);
       gainNode.connect(ctx.destination);
       
       oscillator.frequency.setValueAtTime(440, ctx.currentTime);
       oscillator.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
       
       oscillator.type = 'sine';
       
       gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
       
       oscillator.start(ctx.currentTime);
       oscillator.stop(ctx.currentTime + 0.15);
     } catch (e) {
       console.log('Audio not available');
     }
   }, [getAudioContext]);
 
   // Menu open sound
   const playMenuSound = useCallback(() => {
     try {
       const ctx = getAudioContext();
       const oscillator = ctx.createOscillator();
       const gainNode = ctx.createGain();
       
       oscillator.connect(gainNode);
       gainNode.connect(ctx.destination);
       
       oscillator.frequency.setValueAtTime(392, ctx.currentTime);
       oscillator.frequency.exponentialRampToValueAtTime(523, ctx.currentTime + 0.08);
       
       oscillator.type = 'triangle';
       
       gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
       
       oscillator.start(ctx.currentTime);
       oscillator.stop(ctx.currentTime + 0.12);
     } catch (e) {
       console.log('Audio not available');
     }
   }, [getAudioContext]);
 
   // Share success sound
   const playShareSound = useCallback(() => {
     try {
       const ctx = getAudioContext();
       
       const playNote = (freq: number, delay: number) => {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.connect(gain);
         gain.connect(ctx.destination);
         
         osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
         osc.type = 'sine';
         
         gain.gain.setValueAtTime(0, ctx.currentTime + delay);
         gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.02);
         gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);
         
         osc.start(ctx.currentTime + delay);
         osc.stop(ctx.currentTime + delay + 0.15);
       };
       
       playNote(523, 0);
       playNote(659, 0.08);
     } catch (e) {
       console.log('Audio not available');
     }
   }, [getAudioContext]);
 
   return {
     playSwipeSound,
     playFavoriteSound,
     playUnfavoriteSound,
     playMenuSound,
     playShareSound,
   };
 };