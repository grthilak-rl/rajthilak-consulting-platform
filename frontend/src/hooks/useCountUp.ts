import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  threshold?: number;
}

export default function useCountUp({
  end,
  duration = 1500,
  threshold = 0.3,
}: UseCountUpOptions) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    const startTime = performance.now();
    const target = end;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [end, duration]);

  useEffect(() => {
    if (end === 0) return;

    const node = ref.current;
    if (!node) return;

    // If already animated and end changed, re-animate
    if (hasAnimated.current) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate, end, threshold]);

  return { count, ref };
}
