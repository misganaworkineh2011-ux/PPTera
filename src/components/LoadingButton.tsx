"use client";

import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline";
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  variant = "primary",
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
    secondary: "bg-black text-white shadow-xl hover:scale-105 hover:bg-slate-800 hover:shadow-2xl active:scale-95",
    outline: "border-2 border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span className={cn(isLoading && "opacity-70")}>
        {isLoading && loadingText ? loadingText : children}
      </span>
    </button>
  );
}
