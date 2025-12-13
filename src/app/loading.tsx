export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Spinner Animation */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
          
          {/* Spinning Gradient Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-[#1e3a8a] border-r-[#06b6d4] rounded-full animate-spin"></div>
          
          {/* Inner Pulsing Circle */}
          <div className="absolute inset-3 bg-gradient-to-br from-[#1e3a8a] to-[#06b6d4] rounded-full animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Loading...</h2>
          <div className="flex gap-1 justify-center">
            <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-[#06b6d4] rounded-full animate-bounce [animation-delay:100ms]"></div>
            <div className="h-2 w-2 bg-[#1e3a8a] rounded-full animate-bounce [animation-delay:200ms]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
