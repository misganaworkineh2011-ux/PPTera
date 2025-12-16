"use client";

import { useState } from "react";
import ProjectCreationWizard from "./ProjectCreationWizard";
import { Plus } from "lucide-react";
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
        <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-6 py-3 text-base font-bold text-white shadow-lg shadow-[#06b6d4]/20 transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98]">
          <Plus size={18} /> Create new AI
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-transparent shadow-2xl outline-none transition-all h-[85vh] max-h-[900px]">
          <Dialog.Title className="sr-only">Create New Presentation</Dialog.Title>
          <ProjectCreationWizard 
            userId={userId} 
            credits={credits} 
            onClose={() => setIsOpen(false)} 
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

