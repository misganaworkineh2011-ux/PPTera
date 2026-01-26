"use client";

interface PresentationGlobalStylesProps {
  fontsUrl: string;
}

export function PresentationGlobalStyles({ fontsUrl }: PresentationGlobalStylesProps) {
  return (
    <style jsx global>{`
      @import url('${fontsUrl}');
      @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      .scrollbar-thin::-webkit-scrollbar { width: 6px; }
      .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.4); border-radius: 3px; }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(100, 100, 100, 0.6); }

      /* Responsive slide content padding and sizing */
      @media (max-width: 640px) {
        /* Make slide containers use min-height instead of fixed height on mobile */
        .slide-content-container > div.h-full {
          height: auto !important;
          min-height: 100% !important;
        }
        .slide-content-container > div[class*="p-12"],
        .slide-content-container > div[class*="p-16"],
        .slide-content-container > div[class*="p-20"],
        .slide-content-container div[class*="p-12"],
        .slide-content-container div[class*="p-16"],
        .slide-content-container div[class*="p-20"] {
          padding: 1rem !important;
          padding-top: 2.5rem !important;
        }
        .slide-content-container > div[class*="pt-20"],
        .slide-content-container div[class*="pt-20"],
        .slide-content-container > div[class*="pt-12"],
        .slide-content-container div[class*="pt-12"] {
          padding-top: 3rem !important;
        }
        .slide-content-container > div[class*="pb-16"],
        .slide-content-container div[class*="pb-16"] {
          padding-bottom: 1rem !important;
        }
        .slide-content-container > div[class*="pr-16"],
        .slide-content-container div[class*="pr-16"] {
          padding-right: 0.75rem !important;
        }
        .slide-content-container > div[class*="pl-16"],
        .slide-content-container div[class*="pl-16"],
        .slide-content-container > div[class*="pl-32"],
        .slide-content-container div[class*="pl-32"] {
          padding-left: 0.75rem !important;
        }
        /* Make layout widths responsive - stack vertically */
        .slide-content-container div[class*="w-[55%]"],
        .slide-content-container div[class*="w-[60%]"],
        .slide-content-container div[class*="w-[48%]"],
        .slide-content-container div[class*="w-[45%]"],
        .slide-content-container div[class*="w-[40%]"],
        .slide-content-container div[class*="w-1/2"] {
          width: 100% !important;
        }
        /* Hide decorative elements on mobile */
        .slide-content-container .absolute[class*="w-32"],
        .slide-content-container .absolute[class*="w-24"],
        .slide-content-container .absolute[class*="w-20"],
        .slide-content-container .absolute[class*="w-16"],
        .slide-content-container .absolute[class*="w-64"],
        .slide-content-container .absolute[class*="w-52"],
        .slide-content-container .absolute[class*="w-40"],
        .slide-content-container .absolute[class*="w-48"],
        .slide-content-container .absolute[class*="w-96"],
        .slide-content-container .absolute[class*="w-80"],
        .slide-content-container .absolute[class*="w-72"],
        .slide-content-container .absolute[class*="w-[500px]"],
        .slide-content-container .absolute[class*="w-[600px]"],
        .slide-content-container .absolute[class*="w-[400px]"],
        .slide-content-container .absolute[class*="w-[300px]"] {
          display: none !important;
        }
        /* Scale down margins and gaps */
        .slide-content-container div[class*="mb-8"],
        .slide-content-container div[class*="mb-10"],
        .slide-content-container div[class*="mb-12"] {
          margin-bottom: 0.75rem !important;
        }
        .slide-content-container div[class*="mb-6"] {
          margin-bottom: 0.5rem !important;
        }
        .slide-content-container div[class*="gap-8"] {
          gap: 0.5rem !important;
        }
        .slide-content-container div[class*="gap-6"] {
          gap: 0.375rem !important;
        }
        .slide-content-container div[class*="mt-12"],
        .slide-content-container div[class*="mt-8"] {
          margin-top: 0.75rem !important;
        }
        /* Make flex containers stack on mobile */
        .slide-content-container > div > .flex:not(.items-center):not(.gap-2):not(.gap-3):not(.gap-4) {
          flex-direction: column !important;
        }
        /* Inner flex containers should also be auto height */
        .slide-content-container .h-full.flex {
          height: auto !important;
          min-height: 100% !important;
        }
        /* Responsive text sizes */
        .slide-content-container .text-5xl,
        .slide-content-container .text-6xl,
        .slide-content-container .text-7xl {
          font-size: 1.5rem !important;
          line-height: 1.2 !important;
        }
        .slide-content-container .text-4xl {
          font-size: 1.25rem !important;
          line-height: 1.3 !important;
        }
        .slide-content-container .text-3xl {
          font-size: 1.125rem !important;
          line-height: 1.3 !important;
        }
        .slide-content-container .text-2xl {
          font-size: 1rem !important;
        }
        .slide-content-container .text-xl {
          font-size: 0.875rem !important;
        }
        .slide-content-container .text-lg {
          font-size: 0.8125rem !important;
        }
        /* Grid layouts - single column on mobile */
        .slide-content-container .grid-cols-2 {
          grid-template-columns: 1fr !important;
        }
        /* Max width adjustments */
        .slide-content-container .max-w-5xl,
        .slide-content-container .max-w-4xl,
        .slide-content-container .max-w-3xl {
          max-width: 100% !important;
        }
      }
    `}</style>
  );
}
