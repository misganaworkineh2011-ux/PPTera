import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { checkExistingReview, incrementPresentationCount } from "~/components/RateUsModal";

interface UseRatePromptParams {
  isOwner: boolean;
  isPublicView: boolean;
  setShowRateModal: Dispatch<SetStateAction<boolean>>;
}

export const useRatePrompt = ({
  isOwner,
  isPublicView,
  setShowRateModal,
}: UseRatePromptParams) => {
  useEffect(() => {
    if (!isOwner || isPublicView) return;

    const checkRatePrompt = async () => {
      const hasReview = await checkExistingReview();
      if (hasReview) return;

      const shouldShow = incrementPresentationCount();
      if (shouldShow) {
        setTimeout(() => setShowRateModal(true), 2000);
      }
    };

    void checkRatePrompt();
  }, [isOwner, isPublicView, setShowRateModal]);
};
