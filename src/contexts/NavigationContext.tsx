"use client";

import { createContext, useContext, useState, useEffect, Suspense, useRef, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationContextType {
  isNavigating: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
});

// Loading overlay component - uses portal-like positioning
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
        <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 32px' }}>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            border: '4px solid #e2e8f0', 
            borderRadius: '50%' 
          }}></div>
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            border: '4px solid transparent',
            borderTopColor: '#1e3a8a',
            borderRightColor: '#06b6d4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}></div>
          <div style={{ 
            position: 'absolute', 
            inset: 12, 
            background: 'linear-gradient(to bottom right, #1e3a8a, #06b6d4)',
            borderRadius: '50%',
            animation: 'pulse 2s ease-in-out infinite',
          }}></div>
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Loading...</h2>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <div style={{ 
              height: 8, 
              width: 8, 
              backgroundColor: '#1e3a8a', 
              borderRadius: '50%',
              animation: 'bounce 1s infinite',
            }}></div>
            <div style={{ 
              height: 8, 
              width: 8, 
              backgroundColor: '#06b6d4', 
              borderRadius: '50%',
              animation: 'bounce 1s infinite 0.1s',
            }}></div>
            <div style={{ 
              height: 8, 
              width: 8, 
              backgroundColor: '#1e3a8a', 
              borderRadius: '50%',
              animation: 'bounce 1s infinite 0.2s',
            }}></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
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

  // Intercept all link clicks globally
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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
      
      // Show loading immediately for internal navigation
      setIsNavigating(true);
    };

    // Use capture phase to catch clicks before they propagate
    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

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
