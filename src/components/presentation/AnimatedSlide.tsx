"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useMemo, useRef, useEffect } from "react";
import { ANIMATION_PRESETS } from "~/lib/animations";

interface AnimatedSlideProps {
  children: ReactNode;
  animationId?: string;
  slideKey: string | number;
  isPresenting?: boolean;
}

const getOptimizedAnimation = (animation: typeof ANIMATION_PRESETS[0]) => {
  const initial: any = { ...animation.enterAnimation.initial };
  const animate: any = { ...animation.enterAnimation.animate };
  
  // Ensure GPU acceleration by using transform3d
  if ('x' in initial || 'y' in initial || 'scale' in initial || 'rotate' in initial) {
    initial.willChange = "transform, opacity";
  }
  
  // Use animation's defined duration, capped for performance
  const baseTransition = animation.enterAnimation.transition || {};
  const desiredDuration = baseTransition.duration ?? 0.5;
  const maxDuration = animation.isPremium ? 2.2 : 1.2;
  const optimizedTransition: any = {
    ...baseTransition,
    duration: Math.min(desiredDuration, maxDuration),
    ease: baseTransition.type === "spring" 
      ? undefined 
      : (baseTransition.ease || [0.25, 0.1, 0.25, 1]),
  };
  
  if (baseTransition.type === "spring") {
    optimizedTransition.stiffness = baseTransition.stiffness || 300;
    optimizedTransition.damping = baseTransition.damping || 20;
    optimizedTransition.mass = baseTransition.mass || 1;
  }

  // Handle Exit
  let exit: any = { opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: "easeOut" } };
  
  if (animation.exitAnimation && animation.exitAnimation.exit) {
     exit = { 
       ...animation.exitAnimation.exit, 
       transition: animation.exitAnimation.transition || optimizedTransition 
     };
  }
  
  return { initial, animate, exit, transition: optimizedTransition };
};

export default function AnimatedSlide({
  children,
  animationId = "none",
  slideKey,
  isPresenting = false,
}: AnimatedSlideProps) {
  // Track previous slide key to detect direction changes
  const prevKeyRef = useRef(slideKey);
  const isFirstRender = useRef(true);
  
  // Update tracking after render
  useEffect(() => {
    prevKeyRef.current = slideKey;
    isFirstRender.current = false;
  }, [slideKey]);

  // Find the animation definition - MUST be called unconditionally
  const animation = useMemo(() => 
    ANIMATION_PRESETS.find((p) => p.id === animationId) || 
    ANIMATION_PRESETS.find(p => p.id === "none"),
    [animationId]
  );

  // Get optimized animation config - MUST be called unconditionally
  const { initial, animate, exit, transition } = useMemo(
    () => (animation ? getOptimizedAnimation(animation) : { initial: {}, animate: {}, exit: {}, transition: {} }) as any,
    [animation]
  );

  // If not presenting or not found/none, just render content (after all hooks)
  if (!isPresenting || !animation || animation.id === "none") {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div style={{ perspective: "1500px", width: "100%", height: "100%", overflow: "hidden" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`slide-${slideKey}`}
          className="w-full h-full"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          style={{ 
            willChange: "transform, opacity, filter, clip-path",
            backfaceVisibility: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center", // Default, can be overridden by animation variant
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Content animation variants for staggered content animations
export const contentAnimationVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  // Image-specific animations
  image: {
    hidden: { opacity: 0, scale: 1.05, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  // Title animation
  title: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  // Layout content animation
  layout: {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.06,
      },
    },
  },
  // Card/box item animation
  card: {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  // Bullet point animation
  bullet: {
    hidden: { opacity: 0, x: -15 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
};

// Hook for content animations
export function useContentAnimation(isPresenting: boolean, slideKey: string | number) {
  return useMemo(() => ({
    containerProps: isPresenting ? {
      initial: "hidden",
      animate: "visible",
      variants: contentAnimationVariants.container,
      key: `content-${slideKey}`,
    } : {},
    itemProps: isPresenting ? {
      variants: contentAnimationVariants.item,
    } : {},
    imageProps: isPresenting ? {
      variants: contentAnimationVariants.image,
    } : {},
    titleProps: isPresenting ? {
      variants: contentAnimationVariants.title,
    } : {},
    layoutProps: isPresenting ? {
      variants: contentAnimationVariants.layout,
    } : {},
    cardProps: isPresenting ? {
      variants: contentAnimationVariants.card,
    } : {},
    bulletProps: isPresenting ? {
      variants: contentAnimationVariants.bullet,
    } : {},
  }), [isPresenting, slideKey]);
}
