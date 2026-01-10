"use client";

import { useState } from "react";
import ProjectCreationWizard from "./ProjectCreationWizard";
import { Plus } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useLanguage } from "~/contexts/LanguageContext";
import { dashboardTranslations } from "~/lib/dashboard-translations";

interface Props {
  userId: string;
  credits: number;
}

export default function CreateProjectButton({ userId, credits }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button 
          data-onboarding="create"
          className="flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] px-3 py-2 md:px-5 md:py-2.5 text-sm md:text-base font-bold text-white transition-all hover:from-[#172554] hover:to-[#0891b2] hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">{t.createNewAI || "Create new AI"}</span>
          <span className="sm:hidden">{t.createShort || "Create"}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] sm:w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-transparent shadow-2xl outline-none">
          <Dialog.Title className="sr-only">{t.createNewPresentation || "Create New Presentation"}</Dialog.Title>
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

