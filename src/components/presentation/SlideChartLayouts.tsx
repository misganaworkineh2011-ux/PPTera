"use client";

import type { ReactNode, CSSProperties } from "react";
import type { Theme } from "~/lib/themes";
import type { SlideData } from "./types";
import type { LayoutVariant } from "./slide-layout-utils";
import ChartRenderer from "./ChartRenderer";

interface SlideChartLayoutsProps {
  layout: LayoutVariant;
  slide: SlideData;
  theme: Theme;
  colors: {
    bg: string;
    orb1: string;
    orb2: string;
    borderLine: string;
  };
  useGradientClasses: boolean;
  customBgStyle?: CSSProperties;
  canEdit: boolean;
  onChartTitleChange: (newTitle: string) => void;
  renderTitle: (className: string) => ReactNode;
  renderBullets: () => ReactNode;
  renderIndicator: (position: "top-left" | "top-right") => ReactNode;
}

export default function SlideChartLayouts({
  layout,
  slide,
  theme,
  colors,
  useGradientClasses,
  customBgStyle,
  canEdit,
  onChartTitleChange,
  renderTitle,
  renderBullets,
  renderIndicator,
}: SlideChartLayoutsProps) {
  if (!slide.chart) return null;

  if (layout === "chart-left") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-br ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 left-0 w-80 h-80 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-left")}

        <div className="relative h-full flex flex-col sm:flex-row items-stretch">
          <div className="w-full sm:w-[55%] flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 pt-14 sm:pt-10">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-xl">
                <ChartRenderer
                  chart={slide.chart}
                  theme={theme}
                  compact={false}
                  editable={canEdit}
                  onTitleChange={onChartTitleChange}
                />
              </div>
            </div>
          </div>

          <div className="w-full sm:w-[45%] flex flex-col justify-center p-4 sm:p-6 md:p-8 pt-4 sm:pt-10">
            {renderTitle("text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 md:mb-5")}
            <div className="space-y-1.5">{renderBullets()}</div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  if (layout === "chart-right") {
    return (
      <div className="h-full relative overflow-hidden">
        <div className={`absolute inset-0 ${useGradientClasses ? `bg-gradient-to-bl ${colors.bg}` : ""}`} style={customBgStyle} />
        <div className={`absolute top-0 left-0 w-96 h-96 ${colors.orb2} rounded-full blur-3xl hidden sm:block`} />
        <div className={`absolute bottom-0 right-0 w-80 h-80 ${colors.orb1} rounded-full blur-3xl hidden sm:block`} />

        {renderIndicator("top-right")}

        <div className="relative h-full flex flex-col-reverse sm:flex-row items-stretch">
          <div className="w-full sm:w-[45%] flex flex-col justify-center p-4 sm:p-6 md:p-8 pt-4 sm:pt-10">
            {renderTitle("text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 md:mb-5")}
            <div className="space-y-1.5">{renderBullets()}</div>
          </div>

          <div className="w-full sm:w-[55%] flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12 pt-14 sm:pt-10">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full max-w-xl">
                <ChartRenderer
                  chart={slide.chart}
                  theme={theme}
                  compact={false}
                  editable={canEdit}
                  onTitleChange={onChartTitleChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${colors.borderLine} to-transparent`} />
      </div>
    );
  }

  return null;
}
