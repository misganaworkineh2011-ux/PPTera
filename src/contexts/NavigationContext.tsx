"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BrandedLoader from "~/components/BrandedLoader";

interface NavigationContextType {
  /** True while a client-side route transition is in flight. */
  isNavigating: boolean;
  /** Manually flag that a navigation is starting (e.g. before router.push). */
  startNavigating: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigating: () => {},
});

export function useNavigation() {
  return useContext(NavigationContext);
}

// How long a navigation must run before the full-screen branded loader fades in.
// Fast navigations only ever show the slim top bar (no jarring full-screen flash);
// genuinely slow ones — the "click does nothing until the page comes" case — get
// the loading screen.
const OVERLAY_DELAY_MS = 500;
// If a route change is never observed, release the loader so it can't get stuck.
const SAFETY_TIMEOUT_MS = 12000;

// The full-screen "Preparing your slides…" overlay is for SLIDE surfaces only
// (deck editor, present mode, generation). Ordinary route changes — dashboard
// tabs, templates, settings — get the slim top bar plus their own loading.tsx
// skeleton; a full-screen takeover there reads as a page reload.
const OVERLAY_ROUTE_PATTERNS = [
  /^\/presentation\//,
  /^\/present(\/|$)/,
  /^\/createpresentation(\/|$)/,
];

function pathnameOf(url: string | URL | null | undefined): string | null {
  if (url === null || url === undefined) return null;
  try {
    return new URL(String(url), window.location.href).pathname;
  } catch {
    return null;
  }
}

function overlayEligible(path: string | null): boolean {
  return path !== null && OVERLAY_ROUTE_PATTERNS.some((p) => p.test(path));
}

function NavigationProgress({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  const [active, setActive] = useState(false); // a navigation is in flight
  const [visible, setVisible] = useState(false); // top bar mounted (kept on during fade-out)
  const [progress, setProgress] = useState(0); // 0–100 width of the bar
  const [showOverlay, setShowOverlay] = useState(false); // branded loading screen

  const prevRouteKey = useRef(routeKey);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (trickle.current) {
      clearInterval(trickle.current);
      trickle.current = null;
    }
    if (overlayTimer.current) {
      clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
    }
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  // Begin (or refresh) a loading cycle. Idempotent — repeated calls while a
  // navigation is already in flight are no-ops beyond keeping it alive. The
  // full-screen overlay is armed only for overlay-eligible targets; the slim
  // top bar runs for every navigation.
  const beginNavigation = useCallback((withOverlay: boolean) => {
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
    setVisible(true);
    setActive(true);
    setProgress((p) => (p < 8 ? 8 : p));

    if (!trickle.current) {
      trickle.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          const step = p < 40 ? 9 : p < 65 ? 5 : p < 80 ? 2.5 : 1;
          return Math.min(90, p + Math.random() * step);
        });
      }, 280);
    }
    if (withOverlay && !overlayTimer.current) {
      overlayTimer.current = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    }
  }, []);

  // Public opt-in: callers that KNOW they're heading into a slide surface
  // (opening a deck, entering generation) get the branded overlay behavior.
  const startNavigating = useCallback(() => beginNavigation(true), [beginNavigation]);

  // Finish the loading cycle: snap to 100%, drop the overlay, then fade the bar.
  const completeNavigating = useCallback(() => {
    clearTimers();
    setActive(false);
    setShowOverlay(false);
    setProgress(100);
    fadeTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 360);
  }, [clearTimers]);

  // Detect navigation START. App Router updates the URL through the History API
  // for <Link> clicks and router.push(), so patching pushState plus popstate and
  // anchor clicks catches every client-side navigation. The state update is
  // deferred to a microtask because Next/React can call pushState *during* an
  // insertion-effect commit (including hydration), where scheduling a React
  // update synchronously is illegal ("useInsertionEffect must not schedule
  // updates"). A `ready` flag ignores the history syncs that fire on first mount.
  useEffect(() => {
    let ready = false;
    const readyId = window.requestAnimationFrame(() => {
      ready = true;
    });

    const trigger = (targetPath: string | null) => {
      if (!ready) return;
      const withOverlay = overlayEligible(targetPath);
      queueMicrotask(() => beginNavigation(withOverlay));
    };

    // Only pushState is patched. replaceState is mostly used for non-navigation
    // state syncs (query/scroll restoration, hydration), so reacting to it caused
    // false loaders; leave it untouched.
    const origPush = window.history.pushState;
    window.history.pushState = function (this: History, ...args) {
      const result = origPush.apply(this, args as Parameters<typeof origPush>);
      trigger(pathnameOf(args[2]));
      return result;
    };

    // By popstate time the URL has already changed, so location IS the target.
    const onPopState = () => trigger(window.location.pathname);
    window.addEventListener("popstate", onPopState);

    // Anchor clicks give near-instant feedback for <Link> navigations.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href) return;
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      // Don't show the loader for a link to the page we're already on.
      if (href === window.location.pathname || href === window.location.pathname + window.location.search) {
        return;
      }
      trigger(pathnameOf(href));
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.cancelAnimationFrame(readyId);
      window.history.pushState = origPush;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
    };
    // Patch the History API once; beginNavigation is stable.
  }, [beginNavigation]);

  // Detect navigation COMPLETE: the committed route (path + query) changed.
  useEffect(() => {
    if (routeKey !== prevRouteKey.current) {
      prevRouteKey.current = routeKey;
      completeNavigating();
    }
  }, [routeKey, completeNavigating]);

  // Failsafe: never let the loader hang if a route change isn't observed.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(completeNavigating, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [active, completeNavigating]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <NavigationContext.Provider value={{ isNavigating: active, startNavigating }}>
      {children}

      {visible && (
        <div aria-hidden className="ppt-nav-bar-track">
          <div
            className="ppt-nav-bar"
            style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
          >
            <span className="ppt-nav-bar-glow" />
          </div>
        </div>
      )}

      {showOverlay && <BrandedLoader label="Preparing your slides…" />}

      <style>{NAV_STYLES}</style>
    </NavigationContext.Provider>
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before hydration completes, render children plainly so there's no SSR/CSR
  // mismatch and no loader flash on the very first page load.
  if (!mounted) {
    return (
      <NavigationContext.Provider value={{ isNavigating: false, startNavigating: () => {} }}>
        {children}
      </NavigationContext.Provider>
    );
  }

  return (
    <Suspense fallback={children}>
      <NavigationProgress>{children}</NavigationProgress>
    </Suspense>
  );
}

// All loader styling lives here so the whole feature is one self-contained file.
const NAV_STYLES = `
.ppt-nav-bar-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 99999;
  pointer-events: none;
}
.ppt-nav-bar {
  position: relative;
  height: 100%;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 35%, #06b6d4 70%, #22d3ee 100%);
  background-size: 200% 100%;
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.7), 0 0 4px rgba(30, 58, 138, 0.6);
  transition: width 0.2s ease, opacity 0.35s ease 0.05s;
  animation: ppt-nav-flow 1.6s linear infinite;
}
.ppt-nav-bar-glow {
  position: absolute;
  right: 0;
  top: -2px;
  height: 7px;
  width: 90px;
  transform: translateX(40%);
  border-radius: 50%;
  background: rgba(34, 211, 238, 0.65);
  filter: blur(6px);
}
@keyframes ppt-nav-flow {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .ppt-nav-bar {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
`;
