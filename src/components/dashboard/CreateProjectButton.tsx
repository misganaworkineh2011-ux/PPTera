"use client";

import { useState } from "react";
import PresentationGenerator from "../PresentationGenerator";
import { Plus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface Props {
  userId: string;
  credits: number;
}

export default function CreateProjectButton({ userId, credits }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={18} /> Create new AI
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl transition-all p-0 overflow-hidden outline-none">
          <div className="relative">
            <Dialog.Close className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <X size={20} />
            </Dialog.Close>
            <PresentationGenerator userId={userId} credits={credits} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

