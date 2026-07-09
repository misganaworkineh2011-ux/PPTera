"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "~/lib/themes";
import type { BoxContentItem } from "~/lib/layouts/content/boxes";
import EditableText from "~/components/presentation/EditableText";
import { alpha } from "~/components/presentation/PremiumComponents";
import { SLIDE_FRAME } from "./tile";
import { containerVariantsFor, itemMotionProps } from "~/components/presentation/item-animations";

interface PricingRendererProps {
  items: BoxContentItem[];
  theme?: Theme;
  accentColor?: string;
  className?: string;
  layoutId?: string;
  isPresenting?: boolean;
  animationKey?: string;
  itemAnimation?: string;
  revealCount?: number;
  isEditing?: boolean;
  editingText?: { field: string; bulletIndex?: number } | null;
  onStartEditLabel?: (index: number) => void;
  onStartEditText?: (index: number) => void;
  onUpdateLabel?: (index: number, value: string) => void;
  onUpdateText?: (index: number, value: string) => void;
  onFinishEditing?: () => void;
  onDeleteItem?: (index: number) => void;
  isOwner?: boolean;
  isHovered?: boolean;
  spotlightIndex?: number;
  isSpotlightMode?: boolean;
}

export function PricingRenderer({
  items,
  theme,
  accentColor,
  className = "",
  layoutId = "pricing-style-1",
  isPresenting = false,
  animationKey,
  itemAnimation,
  revealCount,
  isEditing = false,
  editingText = null,
  onStartEditLabel,
  onStartEditText,
  onUpdateLabel,
  onUpdateText,
  onFinishEditing,
  onDeleteItem,
  isOwner = false,
  isHovered = false,
  spotlightIndex,
  isSpotlightMode = false,
}: PricingRendererProps) {
  const titleColor = theme?.colors.heading || "#1e293b";
  const bodyColor = theme?.colors.textMuted || "#64748b";
  const accent = accentColor || theme?.colors.accent || theme?.colors.primary || "#6366f1";
  const cardBg = theme?.cardBox?.background || theme?.colors.surface || "rgba(255,255,255,0.05)";
  const border = theme?.cardBox?.borderColor || theme?.colors.border || "rgba(0,0,0,0.08)";

  const plans = items.slice(0, 4);
  const popular = plans.length >= 2 ? 1 : -1;

  const getSpotlightStyle = (i: number): React.CSSProperties =>
    isSpotlightMode && spotlightIndex !== undefined ? { opacity: spotlightIndex === i ? 1 : 0.3, transition: "all 0.4s ease-out" } : {};

  const Container = isPresenting ? motion.div : "div";
  const cProps = isPresenting
    ? { variants: containerVariantsFor(itemAnimation), initial: "hidden" as const, animate: "visible" as const }
    : {};
  const CItem = isPresenting ? motion.div : "div";
  const itemMotion = (i: number) => itemMotionProps(isPresenting, itemAnimation, revealCount, i);

  const editName = (item: BoxContentItem, i: number, cls: string, style?: React.CSSProperties) =>
    item.label ? (
      onStartEditLabel ? (
        <EditableText value={item.label} isEditing={isEditing && editingText?.field === `content-label-${i}`}
          onStartEdit={() => onStartEditLabel(i)} onChange={(v) => onUpdateLabel?.(i, v)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
          className={cls} style={{ color: titleColor, ...style }} isOwner={isOwner} isHovered={isHovered} />
      ) : (
        <h3 className={cls} style={{ color: titleColor, ...style }}>{item.label}</h3>
      )
    ) : null;

  // Owner edits the raw multi-line text; viewers see it parsed into price + features.
  const parsed = (item: BoxContentItem) => {
    const lines = (item.text || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const hasPrice = lines[0] && /[\d$€£¥]/.test(lines[0]);
    return { price: hasPrice ? lines[0] : null, features: hasPrice ? lines.slice(1) : lines };
  };
  const priceAndFeatures = (item: BoxContentItem, i: number, opts: { priceColor?: string; featColor?: string; checkColor?: string } = {}) => {
    if (onStartEditText) {
      return (
        <EditableText value={item.text} isEditing={isEditing && editingText?.field === `content-text-${i}`}
          onStartEdit={() => onStartEditText(i)} onChange={(v) => onUpdateText?.(i, v)}
          onFinish={onFinishEditing || (() => {})} onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
          className="whitespace-pre-line text-sm leading-relaxed" style={{ color: opts.featColor || bodyColor }} isOwner={isOwner} isHovered={isHovered} />
      );
    }
    const { price, features } = parsed(item);
    return (
      <>
        {price && <div className="mb-3 text-2xl font-extrabold leading-none" style={{ color: opts.priceColor || titleColor }}>{price}</div>}
        <ul className="flex flex-col gap-1.5">
          {features.map((f, k) => (
            <li key={k} className="flex items-start gap-2 text-sm leading-snug" style={{ color: opts.featColor || bodyColor }}>
              <span className="mt-0.5 shrink-0 font-bold" style={{ color: opts.checkColor || accent }}>✓</span>
              <span>{f.replace(/^[✓•\-*]\s*/, "")}</span>
            </li>
          ))}
        </ul>
      </>
    );
  };
  const cta = (label: string, solid: boolean, color: string) => (
    <div className="mt-4 rounded-lg py-2 text-center text-sm font-bold" style={solid ? { background: color, color: "#fff" } : { border: `1.5px solid ${color}`, color }}>{label}</div>
  );

  const frame = `${SLIDE_FRAME} flex items-center justify-center ${className}`;

  // == STYLE-1: PLAN CARDS — middle tier raised + highlighted
  if (layoutId === "pricing-style-1" || !layoutId) {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-5xl items-stretch gap-5" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
          {plans.map((item, i) => {
            const hot = i === popular;
            return (
              <CItem key={i} className="ppt-tile flex flex-col rounded-2xl p-6" style={{ background: hot ? `linear-gradient(160deg, ${alpha(accent, "1f")}, ${cardBg})` : cardBg, border: `1px solid ${hot ? accent : border}`, transform: hot ? "scale(1.04)" : undefined, boxShadow: hot ? `0 16px 40px -16px ${alpha(accent, "99")}` : undefined, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {hot && <span className="mb-2 self-start rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ background: accent }}>Most Popular</span>}
                {editName(item, i, "text-lg font-bold leading-tight")}
                <div className="mt-3 flex-1">{priceAndFeatures(item, i, { priceColor: accent })}</div>
                {cta(hot ? "Get started" : "Choose", hot, accent)}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == STYLE-2: POPULAR RIBBON
  if (layoutId === "pricing-style-2") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-5xl items-stretch gap-5" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
          {plans.map((item, i) => {
            const hot = i === popular;
            return (
              <CItem key={i} className="ppt-tile relative flex flex-col overflow-hidden rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${hot ? accent : border}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {hot && <span className="absolute right-[-34px] top-[18px] rotate-45 px-10 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ background: accent }}>Popular</span>}
                {editName(item, i, "text-lg font-bold leading-tight")}
                <div className="mt-3 flex-1">{priceAndFeatures(item, i, { priceColor: accent })}</div>
                {cta("Select plan", hot, accent)}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == STYLE-3: GRADIENT HERO — featured plan enlarged
  if (layoutId === "pricing-style-3") {
    const hero = plans[popular >= 0 ? popular : 0];
    const heroIdx = popular >= 0 ? popular : 0;
    const rest = plans.filter((_, i) => i !== heroIdx);
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="flex w-full max-w-5xl items-stretch gap-5">
          {hero && (
            <CItem className="flex flex-[1.4] flex-col rounded-2xl p-7 text-white" style={{ background: `linear-gradient(150deg, ${accent}, ${alpha(accent, "b3")})`, boxShadow: `0 18px 44px -16px ${alpha(accent, "99")}`, ...getSpotlightStyle(heroIdx) }} {...itemMotion(heroIdx)}>
              <span className="mb-2 self-start rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">Recommended</span>
              {editName(hero, heroIdx, "text-2xl font-bold leading-tight", { color: "#fff" })}
              <div className="mt-3 flex-1">{priceAndFeatures(hero, heroIdx, { priceColor: "#fff", featColor: "rgba(255,255,255,0.9)", checkColor: "#fff" })}</div>
              {cta("Get started", false, "#ffffff")}
            </CItem>
          )}
          <div className="flex flex-1 flex-col gap-4">
            {rest.map((item) => {
              const i = plans.indexOf(item);
              return (
                <CItem key={i} className="ppt-tile flex flex-1 flex-col rounded-2xl p-5" style={{ background: cardBg, border: `1px solid ${border}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                  {editName(item, i, "text-base font-bold leading-tight")}
                  <div className="mt-2 flex-1">{priceAndFeatures(item, i, { priceColor: accent })}</div>
                </CItem>
              );
            })}
          </div>
        </div>
      </Container>
    );
  }

  // == STYLE-4: MINIMAL TIERS — typographic, hairline separated
  if (layoutId === "pricing-style-4") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-5xl gap-0" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
          {plans.map((item, i) => (
            <CItem key={i} className={`flex flex-col px-6 py-2 ${i > 0 ? "border-l" : ""}`} style={{ borderColor: alpha(bodyColor, "1f"), ...getSpotlightStyle(i) }} {...itemMotion(i)}>
              {i === popular && <span className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: accent }}>Popular</span>}
              {editName(item, i, "text-base font-bold uppercase tracking-wide leading-tight")}
              <div className="mt-2">{priceAndFeatures(item, i, { priceColor: titleColor })}</div>
            </CItem>
          ))}
        </div>
      </Container>
    );
  }

  // == STYLE-5: STACKED ROWS — full-width rows, price right
  if (layoutId === "pricing-style-5") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col justify-center gap-3 ${className}`} key={animationKey} {...cProps}>
        {plans.map((item, i) => {
          const hot = i === popular;
          const { price, features } = parsed(item);
          return (
            <CItem key={i} className="ppt-tile flex items-center gap-5 rounded-2xl px-6 py-4" style={{ background: hot ? `linear-gradient(90deg, ${alpha(accent, "17")}, ${cardBg})` : cardBg, border: `1px solid ${hot ? accent : border}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
              <div className="w-40 shrink-0">
                {editName(item, i, "text-lg font-bold leading-tight")}
                {hot && <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: accent }}>Most Popular</span>}
              </div>
              <div className="min-w-0 flex-1 text-sm" style={{ color: bodyColor }}>
                {onStartEditText ? priceAndFeatures(item, i) : <span>{features.join(" · ")}</span>}
              </div>
              {!onStartEditText && price && <div className="shrink-0 text-2xl font-extrabold" style={{ color: accent }}>{price}</div>}
              <div className="shrink-0">{cta("Choose", hot, accent)}</div>
            </CItem>
          );
        })}
      </Container>
    );
  }

  // == STYLE-7: SEGMENTED TOGGLE — a monthly/annual pill header over the cards
  if (layoutId === "pricing-style-7") {
    return (
      <Container className={`${SLIDE_FRAME} flex flex-col items-center justify-center gap-5 ${className}`} key={animationKey} {...cProps}>
        <div className="flex items-center rounded-full p-1" style={{ background: alpha(accent, "14"), border: `1px solid ${alpha(accent, "2e")}` }}>
          <span className="rounded-full px-4 py-1.5 text-xs font-bold text-white" style={{ background: accent }}>Monthly</span>
          <span className="px-4 py-1.5 text-xs font-bold" style={{ color: bodyColor }}>Annual · save 20%</span>
        </div>
        <div className="grid w-full max-w-5xl items-stretch gap-5" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
          {plans.map((item, i) => {
            const hot = i === popular;
            return (
              <CItem key={i} className="ppt-tile flex flex-col rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${hot ? accent : border}`, boxShadow: hot ? `0 14px 34px -16px ${alpha(accent, "80")}` : undefined, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {editName(item, i, "text-lg font-bold leading-tight")}
                <div className="mt-3 flex-1">{priceAndFeatures(item, i, { priceColor: accent })}</div>
                {cta(hot ? "Get started" : "Choose", hot, accent)}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == STYLE-8: GLASS TIERS — frosted glassmorphic plan cards
  if (layoutId === "pricing-style-8") {
    return (
      <Container className={frame} key={animationKey} {...cProps}>
        <div className="grid w-full max-w-5xl items-stretch gap-5" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
          {plans.map((item, i) => {
            const hot = i === popular;
            return (
              <CItem key={i} className="flex flex-col rounded-2xl p-6" style={{ background: `linear-gradient(150deg, ${alpha(accent, "1f")}, ${alpha(accent, "08")})`, backdropFilter: "blur(8px)", border: `1px solid ${alpha(accent, hot ? "66" : "2e")}`, boxShadow: hot ? `0 16px 40px -16px ${alpha(accent, "80")}` : "0 8px 24px -12px rgba(0,0,0,0.3)", ...getSpotlightStyle(i) }} {...itemMotion(i)}>
                {hot && <span className="mb-2 self-start rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white" style={{ background: accent }}>Popular</span>}
                {editName(item, i, "text-lg font-bold leading-tight")}
                <div className="mt-3 flex-1">{priceAndFeatures(item, i, { priceColor: accent })}</div>
                {cta("Choose", hot, accent)}
              </CItem>
            );
          })}
        </div>
      </Container>
    );
  }

  // == STYLE-9: SPOTLIGHT OFFER — one plan enlarged and centered
  if (layoutId === "pricing-style-9") {
    const idx = popular >= 0 ? popular : 0;
    const hero = plans[idx];
    if (hero) {
      return (
        <Container className={frame} key={animationKey} {...cProps}>
          <CItem className="ppt-tile mx-auto flex w-full max-w-md flex-col items-center rounded-3xl p-8 text-center" style={{ background: `linear-gradient(160deg, ${alpha(accent, "1f")}, ${cardBg})`, border: `1px solid ${accent}`, boxShadow: `0 20px 50px -18px ${alpha(accent, "99")}`, ...getSpotlightStyle(idx) }} {...itemMotion(idx)}>
            <span className="mb-3 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white" style={{ background: accent }}>Best value</span>
            {editName(hero, idx, "text-2xl font-bold leading-tight")}
            <div className="mt-4 w-full">{priceAndFeatures(hero, idx, { priceColor: accent })}</div>
            <div className="mt-6 w-full max-w-xs">{cta("Get started", true, accent)}</div>
          </CItem>
        </Container>
      );
    }
  }

  // == STYLE-6: TOGGLE CARDS — compact with feature-dot summary
  return (
    <Container className={frame} key={animationKey} {...cProps}>
      <div className="grid w-full max-w-5xl items-stretch gap-4" style={{ gridTemplateColumns: `repeat(${plans.length || 1}, minmax(0, 1fr))` }}>
        {plans.map((item, i) => {
          const hot = i === popular;
          const { price, features } = parsed(item);
          return (
            <CItem key={i} className="ppt-tile flex flex-col rounded-2xl p-5 text-center" style={{ background: cardBg, border: `1px solid ${hot ? accent : border}`, borderTop: `4px solid ${hot ? accent : alpha(accent, "40")}`, ...getSpotlightStyle(i) }} {...itemMotion(i)}>
              {editName(item, i, "text-base font-bold leading-tight")}
              {!onStartEditText && price && <div className="mt-2 text-3xl font-extrabold leading-none" style={{ color: accent }}>{price}</div>}
              <div className="mt-3 flex-1 text-left">
                {onStartEditText ? priceAndFeatures(item, i) : (
                  <ul className="flex flex-col gap-1.5">
                    {features.map((f, k) => (
                      <li key={k} className="flex items-center gap-2 text-xs" style={{ color: bodyColor }}>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />{f.replace(/^[✓•\-*]\s*/, "")}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {cta(hot ? "Start free" : "Choose", hot, accent)}
            </CItem>
          );
        })}
      </div>
    </Container>
  );
}

export default PricingRenderer;
