"use client";

import { createContext, useContext, useState, useEffect, Suspense, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationContextType {
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
});

// Loading overlay component - minimal spinner
function LoadingOverlay() {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 40, height: 40, margin: '0 auto 12px' }}>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            border: '3px solid #e2e8f0', 
            borderRadius: '50%' 
          }}></div>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            border: '3px solid transparent',
            borderTopColor: '#1e3a8a',
            borderRightColor: '#06b6d4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}></div>
        </div>
        <p style={{ fontSize: 14, color: '#64748b' }}>Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Inner provider that tracks route changes
function NavigationProviderInner({ 
  children, 
  isNavigating, 
  setIsNavigating,
}: { 
  children: ReactNode;
  isNavigating: boolean;
  setIsNavigating: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevPathRef = useRef(pathname);
  const prevSearchRef = useRef(searchParams?.toString());

  // Reset navigation state when route changes complete
  useEffect(() => {
    setIsNavigating(false);
    prevPathRef.current = pathname;
    prevSearchRef.current = searchParams?.toString();
  }, [pathname, searchParams, setIsNavigating]);

  return (
    <NavigationContext.Provider value={{ isNavigating }}>
      {children}
      {isNavigating && <LoadingOverlay />}
    </NavigationContext.Provider>
  );
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted after initial render to prevent showing loading on first page load
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Intercept all link clicks globally
  useEffect(() => {
    if (!isMounted) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Skip if clicking on a button or inside a button (for menu actions, favorites, etc.)
      if (target.closest("button")) {
        return;
      }
      
      const anchor = target.closest("a");
      
      if (!anchor) return;
      
      const href = anchor.getAttribute("href");
      if (!href) return;
      
      // Skip external links, anchors, mailto, tel, etc.
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        anchor.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }
      
      // Skip dashboard routes - they have their own loading
      if (href.startsWith("/dashboard") || window.location.pathname.startsWith("/dashboard")) {
        return;
      }
      
      // Skip createpresentation routes - they have their own loading
      if (href.startsWith("/createpresentation") || window.location.pathname.startsWith("/createpresentation")) {
        return;
      }
      
      // Skip sign-in/sign-up routes to avoid conflicts with Clerk
      if (href.startsWith("/sign-in") || href.startsWith("/sign-up")) {
        return;
      }
      
      // Show loading immediately for internal navigation
      setIsNavigating(true);
    };

    // Use capture phase to catch clicks before they propagate
    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [isMounted]);

  // Safety timeout - if navigation takes too long, reset the state
  useEffect(() => {
    if (!isNavigating) return;
    
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  // Don't use Suspense during initial mount to avoid hydration issues
  if (!isMounted) {
    return (
      <NavigationContext.Provider value={{ isNavigating: false }}>
        {children}
      </NavigationContext.Provider>
    );
  }

  return (
    <Suspense fallback={children}>
      <NavigationProviderInner 
        isNavigating={isNavigating}
        setIsNavigating={setIsNavigating}
      >
        {children}
      </NavigationProviderInner>
    </Suspense>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
