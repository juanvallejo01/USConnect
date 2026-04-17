'use client';

import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  /**
   * Unique key for the page to trigger re-animation
   * Pass the current page name or path
   */
  pageKey: string;
}

/**
 * PageTransition - Wraps screen content with smooth enter animation
 * 
 * Features:
 * - Fade + slight slide (translateY 10px)
 * - 250ms duration with ease-out
 * - GPU accelerated (transform + opacity)
 * - Respects prefers-reduced-motion
 * 
 * Usage:
 * <PageTransition pageKey="feed">
 *   <Feed />
 * </PageTransition>
 */
export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reset animation on page change
    setMounted(false);
    const timeout = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timeout);
  }, [pageKey]);

  return (
    <div
      key={pageKey}
      className={`h-full w-full ${mounted ? 'page-enter' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
}
