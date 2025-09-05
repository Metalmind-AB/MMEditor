import { useEffect, useRef, useCallback } from 'react';

interface TouchEventHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  lastTap: number;
}

export function useTouchEvents(
  element: HTMLElement | null,
  handlers: TouchEventHandlers
) {
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTap: 0,
  });
  
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
    touchState.current.startTime = Date.now();
    
    // Long press detection
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.();
      }, 500); // 500ms for long press
    }
  }, [handlers]);

  const handleTouchMove = useCallback((_e: TouchEvent) => {
    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;
    
    // Swipe detection (minimum 50px movement, maximum 300ms duration)
    if (deltaTime < 300) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > 50) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > 50) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }
    }
    
    // Double tap detection
    const now = Date.now();
    if (now - touchState.current.lastTap < 300) {
      handlers.onDoubleTap?.();
    }
    touchState.current.lastTap = now;
  }, [handlers]);

  useEffect(() => {
    if (!element) return;
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd]);
}

/**
 * Hook to detect if device supports touch
 */
export function useIsTouchDevice() {
  const isTouchDevice = 
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    
  return isTouchDevice;
}

/**
 * Hook for handling touch-friendly tooltips
 */
export function useTouchTooltip(element: HTMLElement | null) {
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouch = useIsTouchDevice();

  useEffect(() => {
    if (!element || !isTouch) return;

    const showTooltip = () => {
      // Show tooltip logic here
      element.setAttribute('data-tooltip-visible', 'true');
      
      // Hide after 2 seconds
      tooltipTimer.current = setTimeout(() => {
        element.removeAttribute('data-tooltip-visible');
      }, 2000);
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      showTooltip();
    };

    element.addEventListener('touchstart', handleTouch);

    return () => {
      element.removeEventListener('touchstart', handleTouch);
      if (tooltipTimer.current) {
        clearTimeout(tooltipTimer.current);
      }
    };
  }, [element, isTouch]);
}