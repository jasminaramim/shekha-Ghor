import React, { useEffect, useRef } from 'react';

interface ScrollVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  threshold?: number;
}

/**
 * ScrollVideo automatically plays when the user scrolls into its section,
 * and automatically pauses when the section scrolls out of the viewport.
 */
export const ScrollVideo: React.FC<ScrollVideoProps> = ({
  threshold = 0.3,
  playsInline = true,
  muted = true,
  loop = true,
  className = '',
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video properties for smooth programmatic playback
    video.playsInline = true;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
          // Scrolled into view: play video
          const promise = video.play();
          if (promise !== undefined) {
            promise.catch(() => {
              // Silently handle if browser restricts autoplay before first user interaction
            });
          }
        } else {
          // Scrolled out of view (up or down): pause video
          video.pause();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <video
      ref={videoRef}
      playsInline={playsInline}
      muted={muted}
      loop={loop}
      className={className}
      {...props}
    />
  );
};
