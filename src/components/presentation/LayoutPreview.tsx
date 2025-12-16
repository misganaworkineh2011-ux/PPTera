"use client";

import { type LayoutType } from "~/lib/slide-layouts";

interface LayoutPreviewProps {
  layoutId: LayoutType;
}

export default function LayoutPreview({ layoutId }: LayoutPreviewProps) {
  const previews: Record<LayoutType, React.ReactNode> = {
    "title-center": (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="w-16 h-2 bg-slate-400 rounded mb-1" />
        <div className="w-12 h-1.5 bg-slate-300 rounded" />
      </div>
    ),
    "title-left": (
      <div className="w-full h-full flex p-2">
        <div className="w-1/2 flex flex-col justify-center">
          <div className="w-12 h-2 bg-slate-400 rounded mb-1" />
          <div className="w-8 h-1.5 bg-slate-300 rounded" />
        </div>
        <div className="w-1/2 bg-slate-300 rounded" />
      </div>
    ),
    "content-left-image-right": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2" />
        <div className="flex-1 flex gap-2">
          <div className="w-1/2 space-y-1">
            <div className="h-1 bg-slate-300 rounded w-full" />
            <div className="h-1 bg-slate-300 rounded w-4/5" />
            <div className="h-1 bg-slate-300 rounded w-full" />
          </div>
          <div className="w-1/2 bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-right-image-left": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2" />
        <div className="flex-1 flex gap-2">
          <div className="w-1/2 bg-slate-300 rounded" />
          <div className="w-1/2 space-y-1">
            <div className="h-1 bg-slate-300 rounded w-full" />
            <div className="h-1 bg-slate-300 rounded w-4/5" />
          </div>
        </div>
      </div>
    ),
    "content-grid-2": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-grid-3": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="bg-pink-200 rounded flex flex-col items-center justify-center p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-0.5" />
          </div>
          <div className="bg-pink-200 rounded flex flex-col items-center justify-center p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-0.5" />
          </div>
          <div className="bg-pink-200 rounded flex flex-col items-center justify-center p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-0.5" />
          </div>
        </div>
      </div>
    ),
    "content-grid-4": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1">
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
          <div className="bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-cards-2": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-pink-200 rounded p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 mb-1" />
          </div>
        </div>
      </div>
    ),
    "content-cards-3": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
          <div className="bg-pink-200 rounded p-1">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
        </div>
      </div>
    ),
    "content-full-image": (
      <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-500 rounded flex items-center justify-center">
        <div className="w-16 h-2 bg-white/80 rounded" />
      </div>
    ),
    "content-split-diagonal": (
      <div className="w-full h-full relative overflow-hidden rounded">
        <div
          className="absolute inset-0 bg-slate-400"
          style={{ clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 space-y-1">
          <div className="w-8 h-1.5 bg-slate-400 rounded" />
          <div className="w-6 h-1 bg-slate-300 rounded" />
        </div>
      </div>
    ),
    "content-timeline": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-4 h-0.5 bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
            <div className="w-4 h-0.5 bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
        </div>
      </div>
    ),
    "content-comparison": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-green-200 rounded" />
          <div className="bg-red-200 rounded" />
        </div>
      </div>
    ),
    "content-quote": (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className="text-2xl text-slate-400 mb-1">"</div>
        <div className="w-16 h-1 bg-slate-300 rounded mb-1" />
        <div className="w-8 h-0.5 bg-slate-400 rounded" />
      </div>
    ),
    "content-stats": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-2 mx-auto" />
        <div className="flex-1 grid grid-cols-3 gap-1">
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">99%</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">50K</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">24/7</div>
          </div>
        </div>
      </div>
    ),
    "content-centered-image": (
      <div className="w-full h-full flex flex-col p-2">
        <div className="w-12 h-1.5 bg-slate-400 rounded mb-1 mx-auto" />
        <div className="w-10 h-6 bg-slate-300 rounded mx-auto mb-1" />
        <div className="flex-1 grid grid-cols-2 gap-1">
          <div className="bg-pink-200 rounded p-0.5">
            <div className="w-2 h-2 rounded bg-pink-400" />
          </div>
          <div className="bg-pink-200 rounded p-0.5">
            <div className="w-2 h-2 rounded bg-pink-400" />
          </div>
        </div>
      </div>
    ),
    "content-feature-showcase": (
      <div className="w-full h-full flex flex-col">
        <div className="h-2/5 bg-gradient-to-br from-slate-400 to-slate-500 rounded-t flex items-end p-1">
          <div className="w-8 h-1 bg-white/80 rounded" />
        </div>
        <div className="flex-1 p-1 grid grid-cols-3 gap-0.5">
          <div className="bg-pink-200 rounded flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
          <div className="bg-pink-200 rounded flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
          <div className="bg-pink-200 rounded flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-pink-400" />
          </div>
        </div>
      </div>
    ),
  };

  return previews[layoutId] || <div className="text-xs text-slate-400">Preview</div>;
}
