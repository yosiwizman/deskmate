'use client';
import { useRef, useEffect } from 'react';

interface ScreenshotProps {
  src: string;
  alt: string;
  className?: string;
}

export default function Screenshot({ src, alt, className = '' }: ScreenshotProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openFullscreen = () => {
    dialogRef.current?.showModal();
  };

  const closeFullscreen = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClickOutside = (event: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
      
      if (!isInDialog) {
        closeFullscreen();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeFullscreen();
      }
    };

    dialog.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      dialog.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`responsive-img cursor-pointer hover:opacity-80 transition-opacity ${className}`}
        onClick={openFullscreen}
        title="Click to view full-screen"
      />
      
      <dialog
        ref={dialogRef}
        className="max-w-none max-h-none w-full h-full p-4 bg-black/90 backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center h-full">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            style={{
              maxHeight: 'calc(100vh - 32px)',
              maxWidth: 'calc(100vw - 32px)',
            }}
          />
        </div>
        
        <button
          onClick={closeFullscreen}
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
          title="Close (Esc)"
        >
          ×
        </button>
      </dialog>
    </>
  );
}