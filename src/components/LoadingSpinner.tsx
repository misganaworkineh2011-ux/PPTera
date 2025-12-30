import { cn } from "~/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const borderSizes = {
    sm: "border-2",
    md: "border-3",
    lg: "border-4",
    xl: "border-4"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Simple Spinner */}
      <div className={cn("relative", sizeClasses[size])}>
        <div className={cn("absolute inset-0 border-slate-200 rounded-full", borderSizes[size])}></div>
        <div className={cn("absolute inset-0 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin", borderSizes[size])}></div>
      </div>

      {text && (
        <p className="text-sm text-slate-500">{text}</p>
      )}
    </div>
  );
}
