"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Message contract, also implemented by public/embed.js. Keep the two in step. */
export const EMBED_MESSAGE = "stern-docs:size";

/**
 * Tells the host page how tall the docs currently are.
 *
 * An iframe can't size itself, and a fixed-height docs embed is either a nested
 * scrollbar or a page full of dead space. So while framed, this posts the
 * document height on every layout change and every navigation; public/embed.js
 * (or three lines of the host's own JS) applies it.
 *
 * Renders nothing, does nothing at all when not in a frame.
 */
export function EmbedBridge() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.self === window.top) return;

    let last = 0;
    const send = () => {
      // scrollHeight over getBoundingClientRect: margins on the last child
      // count, and a 1px oscillation shouldn't trigger a message storm.
      const height = Math.ceil(document.documentElement.scrollHeight);
      if (Math.abs(height - last) < 2) return;
      last = height;
      window.parent.postMessage(
        { type: EMBED_MESSAGE, height, path: pathname },
        "*", // The host origin isn't knowable; the payload is two public numbers.
      );
    };

    send();
    const observer = new ResizeObserver(send);
    observer.observe(document.documentElement);
    window.addEventListener("load", send);
    // Late-loading fonts and images resize the page after the observer settles.
    const timers = [120, 400, 1200].map((delay) => window.setTimeout(send, delay));

    return () => {
      observer.disconnect();
      window.removeEventListener("load", send);
      timers.forEach(window.clearTimeout);
    };
  }, [pathname]);

  return null;
}
