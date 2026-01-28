export interface SlideOption {
  value: number;
  label: string;
  plan: string;
  isGroupHeader?: boolean;
  disabled?: boolean;
}

export const getAllSlideOptions = (userPlan: string | null | undefined): SlideOption[] => {
  const userPlanLower = userPlan?.toLowerCase() || "free";

  const options: SlideOption[] = [];

  const hasPlus = userPlanLower === "plus" || userPlanLower === "pro" || userPlanLower === "ultra";
  const hasPro = userPlanLower === "pro" || userPlanLower === "ultra";
  const hasUltra = userPlanLower === "ultra";

  options.push({ value: -1, label: "Free Plan: 1-10 slides", plan: "Free", isGroupHeader: true, disabled: false });
  for (let i = 1; i <= 10; i++) {
    options.push({ value: i, label: `${i} ${i === 1 ? "slide" : "slides"}`, plan: "Free", disabled: false });
  }

  options.push({ value: -2, label: "Plus Plan: 15, 20 slides", plan: "Plus", isGroupHeader: true, disabled: false });
  options.push({ value: 15, label: "15 slides", plan: "Plus", disabled: !hasPlus });
  options.push({ value: 20, label: "20 slides", plan: "Plus", disabled: !hasPlus });

  options.push({ value: -3, label: "Pro Plan: 25, 30, 40, 50, 60 slides", plan: "Pro", isGroupHeader: true, disabled: false });
  options.push({ value: 25, label: "25 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 30, label: "30 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 40, label: "40 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 50, label: "50 slides", plan: "Pro", disabled: !hasPro });
  options.push({ value: 60, label: "60 slides", plan: "Pro", disabled: !hasPro });

  options.push({ value: -4, label: "Ultra Plan: 70, 75 slides", plan: "Ultra", isGroupHeader: true, disabled: false });
  options.push({ value: 70, label: "70 slides", plan: "Ultra", disabled: !hasUltra });
  options.push({ value: 75, label: "75 slides", plan: "Ultra", disabled: !hasUltra });

  return options;
};
