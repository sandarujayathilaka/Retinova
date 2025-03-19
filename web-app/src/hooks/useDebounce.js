import { useCallback, useRef } from "react";

export function useDebounce(callback, delay) {
    const timerRef = useRef(null);
  
    return useCallback(
      (...args) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    );
  }