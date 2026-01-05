"use client";

import { useState, useRef, useEffect } from "react";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * Lazy-loaded HTML5 video that only loads when in viewport.
 * Much lighter than Vimeo embeds - no external JS required.
 */
export function LazyVideo({
  src,
  poster,
  className = "",
  style = {},
  title = "Video",
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Auto-play when loaded and in view
  useEffect(() => {
    if (isLoaded && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - that's fine for background videos
      });
    }
  }, [isLoaded]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Placeholder shown while video loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          {poster ? (
            <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="w-10 h-10 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Only render video when in viewport */}
      {isInView && (
        <video
          ref={videoRef}
          src={src}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          title={title}
          aria-label={title}
          onLoadedData={() => setIsLoaded(true)}
        >
          {/* Decorative video - no captions needed */}
        </video>
      )}
    </div>
  );
}
