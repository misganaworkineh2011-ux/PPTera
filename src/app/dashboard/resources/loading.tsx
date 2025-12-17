"use client";

import { Loader2 } from "lucide-react";

export default function ResourcesLoading() {
  return (
    <div className="flex h-[400px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#06b6d4]" />
    </div>
  );
}
