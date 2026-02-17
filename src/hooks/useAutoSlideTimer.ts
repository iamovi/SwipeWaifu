 import { useState, useEffect, useCallback, useRef } from 'react';
 
 interface UseAutoSlideTimerProps {
   interval: number; // in seconds
   enabled: boolean;
   onComplete: () => void;
   resetKey?: string; // changes to this will reset the timer
 }
 
 export const useAutoSlideTimer = ({
   interval,
   enabled,
   onComplete,
   resetKey,
 }: UseAutoSlideTimerProps) => {
   const [timeRemaining, setTimeRemaining] = useState(interval);
   const intervalRef = useRef<NodeJS.Timeout | null>(null);
   const onCompleteRef = useRef(onComplete);
 
   // Keep onComplete ref updated
   useEffect(() => {
     onCompleteRef.current = onComplete;
   }, [onComplete]);
 
   // Reset timer when interval changes or resetKey changes
   useEffect(() => {
     setTimeRemaining(interval);
   }, [interval, resetKey]);
 
   // Main timer logic
   useEffect(() => {
     if (!enabled) {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
       }
       return;
     }
 
     intervalRef.current = setInterval(() => {
       setTimeRemaining((prev) => {
         if (prev <= 1) {
           onCompleteRef.current();
           return interval; // Reset for next cycle
         }
         return prev - 1;
       });
     }, 1000);
 
     return () => {
       if (intervalRef.current) {
         clearInterval(intervalRef.current);
         intervalRef.current = null;
       }
     };
   }, [enabled, interval]);
 
   return {
     timeRemaining,
     isRunning: enabled,
   };
 };