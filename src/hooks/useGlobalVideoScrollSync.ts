import { useEffect } from 'react';

/**
 * useGlobalVideoScrollSync watches all HTML5 video elements and YouTube iframe embeds
 * across the entire application. It ensures videos automatically play when the user scrolls
 * into their section, and immediately pause when scrolled out of view.
 */
export function useGlobalVideoScrollSync() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observedElements = new WeakSet<Element>();

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        const target = entry.target;

        // 1. HTML5 <video> elements
        if (target instanceof HTMLVideoElement) {
          if (entry.isIntersecting) {
            // Section is in view: play video
            const playPromise = target.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Ignore if browser restricts autoplay without interaction
              });
            }
          } else {
            // Section scrolled out of view (up or down): pause video
            target.pause();
          }
        }

        // 2. YouTube iframe elements (support postMessage pause/play)
        if (target instanceof HTMLIFrameElement) {
          try {
            if (entry.isIntersecting) {
              // Only auto-play iframe if it explicitly has data-autoplay-on-scroll="true"
              if (target.getAttribute('data-autoplay-on-scroll') === 'true') {
                target.contentWindow?.postMessage(
                  JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
                  '*'
                );
              }
            } else {
              // When iframe scrolls out of view: pause YouTube video
              target.contentWindow?.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
                '*'
              );
            }
          } catch (_) {
            // Ignore cross-origin postMessage errors
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
      rootMargin: '0px 0px -30px 0px',
    });

    // Helper to attach observer to all media elements
    const scanAndObserve = () => {
      // Find all HTML5 video elements
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        if (!observedElements.has(video)) {
          observedElements.add(video);
          video.playsInline = true;
          observer.observe(video);
        }
      });

      // Find all YouTube iframes
      const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
      iframes.forEach((iframe) => {
        if (!observedElements.has(iframe)) {
          observedElements.add(iframe);
          observer.observe(iframe);
        }
      });
    };

    // Initial scan
    scanAndObserve();

    // DOM Mutation Observer to detect dynamically added video elements (e.g. route changes)
    const mutationObserver = new MutationObserver(() => {
      scanAndObserve();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
