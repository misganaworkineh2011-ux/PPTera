import { cn } from "~/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
    xl: "h-4 w-4"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      {/* Spinner Animation */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        
        {/* Spinning Gradient Ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
        
        {/* Inner Pulsing Circle */}
        <div className="absolute inset-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-full animate-pulse"></div>
      </div>

      {/* Loading Text */}
      {text && (
        <div className="space-y-2 text-center">
          <p className="text-lg font-semibold text-slate-900">{text}</p>
          <div className="flex gap-1 justify-center">
            <div className={cn(dotSizes[size], "bg-[#1e3a8a] rounded-full animate-bounce")}></div>
            <div className={cn(dotSizes[size], "bg-[#06b6d4] rounded-full animate-bounce [animation-delay:100ms]")}></div>
            <div className={cn(dotSizes[size], "bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:200ms]")}></div>
          </div>
        </div>
      )}
    </div>
  );
}
