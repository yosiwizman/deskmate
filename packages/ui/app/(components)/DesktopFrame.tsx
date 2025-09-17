'use client';
import { useEffect, useRef } from 'react';

interface DesktopFrameProps {
  children: React.ReactNode;
  className?: string;
}

export default function DesktopFrame({ children, className = '' }: DesktopFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = () => {
    const frame = frameRef.current;
    if (!frame) return;

    // Find the noVNC canvas element
    const canvas = frame.querySelector('canvas');
    if (!canvas) return;

    // Force canvas to be responsive
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.maxHeight = 'calc(100vh - 56px - 16px)'; // Account for header and padding
    canvas.style.objectFit = 'contain';
  };

  useEffect(() => {
    // Initial resize
    const timer = setTimeout(resizeCanvas, 100);

    // Set up resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (frameRef.current) {
      resizeObserver.observe(frameRef.current);
    }

    // Set up mutation observer to watch for canvas being added/changed
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          resizeCanvas();
        }
      });
    });

    if (frameRef.current) {
      mutationObserver.observe(frameRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Window resize handler
    window.addEventListener('resize', resizeCanvas);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={`responsive-pane fill-viewport ${className}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}