"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";
import { ANIMATION_PRESETS } from "~/lib/animations";

interface AnimatedSlideProps {
  children: ReactNode;
  animationId?: string;
  slideKey: string | number;
  isPresenting?: boolean;
}

export default function AnimatedSlide({
  children,
  animationId = "none",
  slideKey,
  isPresenting = false,
}: AnimatedSlideProps) {
  // Find the animation definition
  const animation = ANIMATION_PRESETS.find((p) => p.id === animationId) || 
                   ANIMATION_PRESETS.find(p => p.id === "none");

  // If not presenting or not found/none, just render content
  if (!isPresenting || !animation || animation.id === "none") {
    return <div className="w-full h-full">{children}</div>;
  }

  // Determine transition properties
  const transition = animation.enterAnimation.transition || { duration: 0.5, ease: "easeInOut" };
  
  // Prepare animation states
  const initial = animation.enterAnimation.initial;
  const animate = animation.enterAnimation.animate;
  
  // Use explicit exit animation if available, otherwise default to simple fade out
  const exit = animation.exitAnimation?.animate 
    ? { 
        ...animation.exitAnimation.animate, 
        transition: animation.exitAnimation.transition || { duration: 0.3 }
      }
    : { opacity: 0, transition: { duration: 0.3 } }; 

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={slideKey}
        className="w-full h-full"
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
