"use client";

import React from "react";
import type {
  QuotesLayoutType,
  QuoteContentItem,
} from "~/lib/layouts/content/quotes";

interface QuotesLayoutRendererProps {
  layoutId: QuotesLayoutType;
  items: QuoteContentItem[];
  accentColor?: string;
  className?: string;
  isNarrowSpace?: boolean;
}

export function QuotesLayoutRenderer({
  layoutId,
  items,
  accentColor = "#047857",
  className = "",
  isNarrowSpace = false,
}: QuotesLayoutRendererProps) {
  const displayItems = items.slice(0, 6);

  if (layoutId === "quote-bubble") {
    return (
      <BubbleQuotes
        items={displayItems}
        accentColor={accentColor}
        className={className}
      />
    );
  }

  return (
    <MarksQuotes
      items={displayItems}
      accentColor={accentColor}
      className={className}
    />
  );
}

// Quote Icon Component
function QuoteIcon({ className, color }: { className?: string; color?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className} 
      style={{ color }}
    >
      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21L14.017 21ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166C6.46432 18 6.0166 18.4477 6.0166 19V21L5.0166 21Z" />
    </svg>
  );
}

// Style 1: Thought Bubble - Solid color card with tail and white quotes
function BubbleQuotes({
  items,
  accentColor,
  className,
}: {
  items: QuoteContentItem[];
  accentColor: string;
  className: string;
}) {
  return (
    <div className={`flex flex-wrap gap-8 justify-center items-start ${className}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="flex-1 min-w-[300px] max-w-[500px] flex flex-col"
        >
          {/* Main Bubble Card */}
          <div className="relative group filter drop-shadow-md transition-transform hover:-translate-y-1">
            <div 
              className="relative rounded-2xl p-8"
              style={{
                backgroundColor: accentColor, // Solid fill
                color: 'white', // White text
              }}
            >
              {/* Top-left opening quote */}
              <div className="absolute top-4 left-4 opacity-50">
                <QuoteIcon className="w-8 h-8 rotate-180" color="white" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 relative z-10 px-4 text-center">
                {item.label && (
                   <h3 className="text-lg font-bold mb-1 text-white opacity-90">
                     {item.label}
                   </h3>
                )}
                
                <p className="text-base leading-relaxed font-medium">
                  {item.text}
                </p>
                
                {item.author && (
                  <div className="mt-2 border-t border-white/20 pt-2 inline-block mx-auto">
                    <span className="text-sm font-semibold opacity-90">
                      {item.author}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom-right closing quote */}
              <div className="absolute bottom-4 right-4 opacity-50">
                <QuoteIcon className="w-8 h-8" color="white" />
              </div>
            </div>

            {/* Seamless Tail - Slightly smaller */}
            <svg 
               className="absolute -bottom-[28px] left-12 filter drop-shadow-sm"
               width="35" 
               height="30" 
               viewBox="0 0 50 50"
               style={{ color: accentColor }}
            >
               {/* Triangle tail */}
               <path d="M0 0 L25 50 L50 0 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

// Style 2: Quote Marks - Elegant clean cards with positioned quotes
function MarksQuotes({
  items,
  accentColor,
  className,
}: {
  items: QuoteContentItem[];
  accentColor: string;
  className: string;
}) {
  return (
    <div className={`flex flex-wrap gap-8 justify-center ${className}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="flex-1 min-w-[320px] max-w-[500px]"
        >
          <div 
            className="h-full rounded-xl p-8 pt-10 relative bg-white shadow-sm border hover:shadow-md transition-all"
            style={{
              borderColor: `${accentColor}20`,
            }}
          >
            {/* Opening Quote - Top Left, positioned distinctly */}
            <div 
              className="absolute -top-3 left-8 bg-white px-2"
              style={{ color: accentColor }}
            >
              <QuoteIcon className="w-6 h-6 rotate-180" />
            </div>

            <div className="flex flex-col h-full">
              {item.label && (
                 <h3 
                   className="text-lg font-bold mb-3"
                   style={{ color: '#1e293b' }}
                 >
                   {item.label}
                 </h3>
              )}
              
              <p className="text-base text-slate-700 leading-relaxed italic flex-1">
                {item.text}
              </p>

              {item.author && (
                <div className="mt-6 flex items-center justify-end gap-3">
                   <div className="h-px w-8 bg-slate-200" />
                   <span 
                     className="text-sm font-bold uppercase tracking-wider"
                     style={{ color: accentColor }}
                   >
                     {item.author}
                   </span>
                </div>
              )}
            </div>

            {/* Closing Quote - Bottom Right, matches top style */}
            <div 
              className="absolute -bottom-3 right-8 bg-white px-2"
              style={{ color: accentColor }}
            >
               <QuoteIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuotesLayoutRenderer;
