"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/boot-script";

type Mode = "auto" | "light" | "dark";

const NEXT: Record<Mode, Mode> = { auto: "light", light: "dark", dark: "auto" };

/**
 * Appearance control, styled as a panel switch rather than a sun/moon: the
 * current mode is *written on it*, because "auto" has no icon anyone reads
 * correctly.
 *
 * Deliberately stateless. The boot script already resolved the appearance and
 * parked it on <html data-theme-mode>, so this component reads that attribute at
 * click time and CSS decides which of the three labels is visible — which means
 * no state to hydrate, no mismatch between server and client, and no flash of
 * the wrong label. It also hides itself via CSS when the host pinned the theme
 * with ?theme=…, since offering a control the next page load would override
 * would be a lie.
 */
export function AppearanceToggle() {
  // The one thing that can't be CSS: in auto mode the OS may change its mind
  // while the page is open. A DOM write, no React state involved.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const root = document.documentElement;
      if (root.getAttribute("data-theme-mode") !== "auto") return;
      root.classList.remove("light", "dark");
      root.classList.add(query.matches ? "dark" : "light");
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const cycle = () => {
    const root = document.documentElement;
    const attribute = root.getAttribute("data-theme-mode");
    const current: Mode =
      attribute === "light" || attribute === "dark" ? attribute : "auto";
    const next = NEXT[current];

    const resolved =
      next === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;

    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.setAttribute("data-theme-mode", next);

    try {
      if (next === "auto") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode, or storage partitioned inside an embed: the switch still
      // works for this page view, it just won't be remembered.
    }
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="btn btn-ghost appearance-toggle w-full justify-between"
      aria-label="Change appearance: auto, light, or dark"
    >
      <span className="silkscreen">Appearance</span>
      <span className="tabular text-[0.7rem] tracking-widest">
        <span data-mode="auto">Auto</span>
        <span data-mode="light">Light</span>
        <span data-mode="dark">Dark</span>
      </span>
    </button>
  );
}
