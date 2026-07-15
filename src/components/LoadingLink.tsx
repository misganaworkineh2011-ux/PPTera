"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showSpinner?: boolean;
  onClick?: () => void;
  id?: string;
}

export function LoadingLink({ 
  href, 
  children, 
  className, 
  showSpinner = true,
  onClick,
  id 
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Reset loading when route changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const handleClick = (e: React.MouseEvent) => {
    // Don't show loading for external links or same page
    if (href.startsWith('http') || href === pathname) {
      return;
    }
    
    setIsLoading(true);
    onClick?.();
  };

  return (
    <Link 
      href={href} 
      id={id}
      className={cn("relative inline-flex items-center gap-2", className)}
      onClick={handleClick}
      prefetch={false}
    >
      {isLoading && showSpinner && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      <span className={cn(isLoading && "opacity-70")}>
        {children}
      </span>
    </Link>
  );
}
