"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

// Cubic bezier easing as tuple type
type CubicBezier = [number, number, number, number];
const smoothEase: CubicBezier = [0.25, 0.1, 0.25, 1];
const popEase: CubicBezier = [0.34, 1.2, 0.64, 1];

// Content animation variants for staggered animations
export const contentVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.08,
      },
    },
  },
  // Generic item animation
  item: {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: smoothEase,
      },
    },
  },
  // Title animation - slides down
  title: {
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: smoothEase,
      },
    },
  },
  // Subtitle animation
  subtitle: {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: smoothEase,
        delay: 0.05,
      },
    },
  },
  // Image animation - scale and fade with blur
  image: {
    hidden: { opacity: 0, scale: 1.02 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: smoothEase,
      },
    },
  },
  // Card/box animation - pop in
  card: {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.28,
        ease: smoothEase,
      },
    },
  },
  // Bullet point animation - slide from left
  bullet: {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.22,
        ease: smoothEase,
      },
    },
  },
  // Step animation - scale up
  step: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: popEase,
      },
    },
  },
  // Quote animation - fade with slight scale
  quote: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: smoothEase,
      },
    },
  },
  // Circle/icon animation - pop
  circle: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: popEase,
      },
    },
  },
  // Layout container - for wrapping layout content
  layout: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
} as const;

interface AnimatedContainerProps {
  children: ReactNode;
  isPresenting?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: keyof typeof contentVariants;
}

// Animated container for staggered children
export function AnimatedContainer({
  children,
  isPresenting = false,
  className = "",
  style,
  variant = "container",
}: AnimatedContainerProps) {
  if (!isPresenting) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "opacity" }}
      initial="hidden"
      animate="visible"
      variants={contentVariants[variant] as Variants}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedItemProps {
  children: ReactNode;
  isPresenting?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: keyof typeof contentVariants;
  custom?: number;
}

// Animated item for individual elements
export function AnimatedItem({
  children,
  isPresenting = false,
  className = "",
  style,
  variant = "item",
}: AnimatedItemProps) {
  if (!isPresenting) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
      variants={contentVariants[variant] as Variants}
    >
      {children}
    </motion.div>
  );
}

// Animated title
export function AnimatedTitle({
  children,
  isPresenting = false,
  className = "",
  style,
  as: Component = "h1",
}: AnimatedItemProps & { as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div" }) {
  if (!isPresenting) {
    return <Component className={className} style={style}>{children}</Component>;
  }

  const MotionComponent = motion[Component];
  return (
    <MotionComponent
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
      variants={contentVariants.title as Variants}
    >
      {children}
    </MotionComponent>
  );
}

// Animated image wrapper
export function AnimatedImage({
  children,
  isPresenting = false,
  className = "",
  style,
}: AnimatedItemProps) {
  if (!isPresenting) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "transform, opacity", overflow: "hidden" }}
      variants={contentVariants.image as Variants}
    >
      {children}
    </motion.div>
  );
}

// Animated card/box
export function AnimatedCard({
  children,
  isPresenting = false,
  className = "",
  style,
}: AnimatedItemProps) {
  if (!isPresenting) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
      variants={contentVariants.card as Variants}
    >
      {children}
    </motion.div>
  );
}

// Animated bullet point
export function AnimatedBullet({
  children,
  isPresenting = false,
  className = "",
  style,
}: AnimatedItemProps) {
  if (!isPresenting) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ ...style, willChange: "transform, opacity" }}
      variants={contentVariants.bullet as Variants}
    >
      {children}
    </motion.div>
  );
}

// Hook to get animation props based on presenting state
export function useAnimationProps(isPresenting: boolean) {
  if (!isPresenting) {
    return {
      containerProps: {},
      itemProps: {},
      titleProps: {},
      imageProps: {},
      cardProps: {},
      bulletProps: {},
    };
  }

  return {
    containerProps: {
      initial: "hidden" as const,
      animate: "visible" as const,
      variants: contentVariants.container as Variants,
    },
    itemProps: {
      variants: contentVariants.item as Variants,
    },
    titleProps: {
      variants: contentVariants.title as Variants,
    },
    imageProps: {
      variants: contentVariants.image as Variants,
    },
    cardProps: {
      variants: contentVariants.card as Variants,
    },
    bulletProps: {
      variants: contentVariants.bullet as Variants,
    },
  };
}
