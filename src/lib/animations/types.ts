// Slide Animation Types and Presets
// These animations play when transitioning between slides in present mode
// OPTIMIZED for performance with GPU-accelerated transforms

export type AnimationCategory = 
  | "none"
  | "fade"
  | "slide"
  | "zoom"
  | "flip"
  | "creative"
  | "cinematic"
  | "particles"
  | "premium";

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: AnimationCategory;
  enterAnimation: AnimationConfig;
  exitAnimation?: AnimationConfig;
  duration: number;
  easing: string;
  hasEffects?: boolean;
  previewGradient?: string;
  isPremium?: boolean;
  isPro?: boolean;
}

export interface AnimationConfig {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit?: Record<string, number | string>;
  transition?: {
    duration?: number;
    ease?: [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate";
    delay?: number;
    type?: "tween" | "spring" | "inertia";
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

// All available animation presets - OPTIMIZED for performance
export const ANIMATION_PRESETS: AnimationPreset[] = [
  // === NONE ===
  {
    id: "none",
    name: "None",
    description: "No animation",
    category: "none",
    duration: 0,
    easing: "linear",
    enterAnimation: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
    },
  },

  // === FADE === (Smooth & Clean)
  {
    id: "fade",
    name: "Dissolve",
    description: "Smooth fade transition",
    category: "fade",
    duration: 300,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    enterAnimation: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "fade-up",
    name: "Rise",
    description: "Elegant upward reveal",
    category: "fade",
    duration: 350,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "fade-scale",
    name: "Emerge",
    description: "Subtle scale with fade",
    category: "fade",
    duration: 300,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },

  // === SLIDE === (Dynamic Movement)
  {
    id: "slide-left",
    name: "Sweep Left",
    description: "Slide in from right",
    category: "slide",
    duration: 300,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "slide-right",
    name: "Sweep Right",
    description: "Slide in from left",
    category: "slide",
    duration: 300,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: -60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "slide-up",
    name: "Ascend",
    description: "Slide in from bottom",
    category: "slide",
    duration: 300,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
    },
  },

  // === ZOOM === (Focus & Impact)
  {
    id: "zoom-in",
    name: "Focus In",
    description: "Zoom from small",
    category: "zoom",
    duration: 350,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.85 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.35, ease: [0.34, 1.2, 0.64, 1] },
    },
  },
  {
    id: "zoom-out",
    name: "Focus Out",
    description: "Zoom from large",
    category: "zoom",
    duration: 350,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.15 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "zoom-rotate",
    name: "Twist",
    description: "Zoom with rotation",
    category: "zoom",
    duration: 400,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.8, rotate: -5 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      transition: { duration: 0.4, ease: [0.34, 1.2, 0.64, 1] },
    },
  },

  // === FLIP === (3D Transforms)
  {
    id: "flip-x",
    name: "Card Flip",
    description: "3D horizontal flip",
    category: "flip",
    duration: 400,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateY: -45 },
      animate: { opacity: 1, rotateY: 0 },
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "flip-y",
    name: "Page Turn",
    description: "3D vertical flip",
    category: "flip",
    duration: 400,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateX: 45 },
      animate: { opacity: 1, rotateX: 0 },
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  },

  // === CREATIVE === (Playful & Dynamic)
  {
    id: "bounce",
    name: "Bounce",
    description: "Bouncy spring entrance",
    category: "creative",
    duration: 450,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: -40, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: "spring", stiffness: 350, damping: 20 },
    },
  },
  {
    id: "elastic",
    name: "Pop",
    description: "Elastic pop effect",
    category: "creative",
    duration: 500,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.7 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: "spring", stiffness: 450, damping: 15 },
    },
  },
  {
    id: "swing",
    name: "Swing",
    description: "Swing in from corner",
    category: "creative",
    duration: 400,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotate: -5, x: -30, y: -15 },
      animate: { opacity: 1, rotate: 0, x: 0, y: 0 },
      transition: { duration: 0.4, ease: [0.34, 1.2, 0.64, 1] },
    },
  },
  {
    id: "modern-rise",
    name: "Elevate",
    description: "Modern rise with scale",
    category: "creative",
    duration: 400,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    previewGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 30, scale: 0.97 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
    },
  },
  {
    id: "soft-zoom",
    name: "Breathe",
    description: "Gentle cinematic zoom",
    category: "creative",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.05 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "elastic-pop",
    name: "Snap",
    description: "Quick elastic snap",
    category: "creative",
    duration: 400,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  },

  // === CINEMATIC === (Professional & Dramatic)
  {
    id: "cinematic-zoom",
    name: "Cinematic",
    description: "Movie-style zoom reveal",
    category: "cinematic",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.1 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "parallax-depth",
    name: "Depth",
    description: "3D depth parallax",
    category: "cinematic",
    duration: 450,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    enterAnimation: {
      initial: { opacity: 0, z: -100, scale: 0.95 },
      animate: { opacity: 1, z: 0, scale: 1 },
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Dramatic spotlight reveal",
    category: "cinematic",
    duration: 800,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    enterAnimation: {
      initial: { opacity: 1, clipPath: "circle(0% at 50% 50%)", filter: "brightness(0)" },
      animate: { opacity: 1, clipPath: "circle(150% at 50% 50%)", filter: "brightness(1)" },
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  },
  {
    id: "curtain",
    name: "Curtain",
    description: "Theater curtain opening",
    category: "cinematic",
    duration: 800,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)",
    enterAnimation: {
      initial: { opacity: 1, clipPath: "inset(0 50% 0 50%)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0%)" },
      transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] },
    },
  },
  {
    id: "glitch",
    name: "Glitch",
    description: "Digital glitch effect",
    category: "cinematic",
    duration: 300,
    easing: "linear",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 0 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 },
    },
  },

  // === PARTICLES === (Visual Effects)
  {
    id: "confetti",
    name: "Celebrate",
    description: "Celebration confetti burst",
    category: "particles",
    duration: 400,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "sparkle",
    name: "Sparkle",
    description: "Magical sparkle trail",
    category: "particles",
    duration: 450,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "matrix",
    name: "Matrix",
    description: "Digital matrix rain",
    category: "particles",
    duration: 500,
    easing: "linear",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #003300 100%)",
    enterAnimation: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 },
    },
  },

  // === PREMIUM ANIMATIONS === (Breathtaking cinematic effects)
  {
    id: "disintegrate",
    name: "Materialize",
    description: "Particles assemble into form",
    category: "premium",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #e94560 50%, #0f3460 100%)",
    enterAnimation: {
      initial: { opacity: 0, filter: "blur(30px) brightness(2)", scale: 1.3, clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
      animate: { opacity: 1, filter: "blur(0px) brightness(1)", scale: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "reconstruct",
    name: "Assemble",
    description: "Fragments unite from chaos",
    category: "premium",
    duration: 1100,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 30%, #4a00e0 70%, #8e2de2 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.1, rotateX: 90, rotateY: -90, rotateZ: 45, filter: "blur(25px) brightness(3) contrast(2)" },
      animate: { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, rotateZ: 0, filter: "blur(0px) brightness(1) contrast(1)" },
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "explode",
    name: "Supernova",
    description: "Explosive shockwave entrance",
    category: "premium",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #ff4e00 0%, #ec9f05 30%, #ff6b35 70%, #f7931e 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0, rotate: -360, filter: "brightness(5) saturate(3)" },
      animate: { opacity: 1, scale: 1, rotate: 0, filter: "brightness(1) saturate(1)" },
      transition: { type: "spring", stiffness: 150, damping: 12, mass: 1.5 },
    },
  },
  {
    id: "morph-liquid",
    name: "Liquid",
    description: "Fluid morphing transformation",
    category: "premium",
    duration: 1000,
    easing: "ease-in-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 30%, #7c3aed 70%, #a855f7 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.5, borderRadius: "50%", filter: "blur(40px) hue-rotate(90deg)", clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, scale: 1, borderRadius: "0%", filter: "blur(0px) hue-rotate(0deg)", clipPath: "circle(100% at 50% 50%)" },
      transition: { duration: 1.0, ease: [0.4, 0, 0.2, 1] },
    },
  },
  {
    id: "shatter",
    name: "Shatter",
    description: "Glass shard assembly",
    category: "premium",
    duration: 1200,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #b0b0b0 100%)",
    enterAnimation: {
      initial: {
        opacity: 0,
        scale: 1.9,
        rotate: -18,
        rotateX: 18,
        rotateY: -20,
        x: -140,
        y: 80,
        filter: "blur(28px) brightness(1.3) contrast(1.6)",
        clipPath: "polygon(0% 0%, 25% 15%, 45% 0%, 70% 20%, 100% 0%, 85% 45%, 100% 70%, 70% 85%, 50% 100%, 20% 80%, 0% 100%, 10% 55%)",
      },
      animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        filter: "blur(0px) brightness(1) contrast(1)",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      },
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
    },
    exitAnimation: {
      initial: {},
      animate: {},
      exit: {
        opacity: 0,
        scale: 1.15,
        rotate: 12,
        rotateX: -10,
        rotateY: 15,
        filter: "blur(18px) brightness(1.2)",
        clipPath: "polygon(50% 0%, 80% 15%, 100% 50%, 80% 85%, 50% 100%, 20% 85%, 0% 50%, 20% 15%)",
      },
      transition: { duration: 0.7, ease: "easeIn" },
    },
  },
  {
    id: "origami",
    name: "Origami",
    description: "Premium paper fold",
    category: "premium",
    duration: 1400,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 30%, #ff6b6b 60%, #feca57 100%)",
    enterAnimation: {
      initial: {
        opacity: 0,
        rotateX: -120,
        rotateY: 15,
        rotateZ: -6,
        scale: 0.92,
        transformOrigin: "50% 100%",
        filter: "brightness(0.2) saturate(0.8)",
        z: -600,
      },
      animate: {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        transformOrigin: "50% 100%",
        filter: "brightness(1) saturate(1)",
        z: 0,
      },
      transition: { duration: 1.4, type: "spring", stiffness: 55, damping: 12, mass: 1.1 },
    },
    exitAnimation: {
      initial: {}, 
      animate: {},
      exit: {
        opacity: 0,
        rotateX: 110,
        rotateY: -8,
        scale: 0.75,
        transformOrigin: "50% 50%",
        filter: "brightness(0.35) saturate(0.7)",
        z: -300,
      },
      transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
    },
  },
  {
    id: "atomic-assembly",
    name: "Atomic Assembly",
    description: "Composition from disintegration",
    category: "premium",
    duration: 1600,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #020024 0%, #090979 35%, #00d4ff 100%)",
    enterAnimation: {
      initial: {
        opacity: 0,
        scale: 3.8,
        rotate: 12,
        rotateX: 20,
        filter: "blur(40px) brightness(1.8) contrast(2.5) saturate(2) hue-rotate(70deg)",
        clipPath: "circle(0% at 50% 50%)",
      },
      animate: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        rotateX: 0,
        filter: "blur(0px) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)",
        clipPath: "circle(120% at 50% 50%)",
      },
      transition: { duration: 1.6, ease: [0.19, 1, 0.22, 1] },
    },
    exitAnimation: {
      initial: {},
      animate: {},
      exit: {
        opacity: 0,
        scale: 2.4,
        rotate: -10,
        filter: "blur(32px) brightness(1.4) contrast(1.4)",
        clipPath: "circle(0% at 50% 50%)",
      },
      transition: { duration: 0.9, ease: "easeIn" },
    },
  },

  {
    id: "vortex",
    name: "Vortex",
    description: "Spiral tornado entrance",
    category: "premium",
    duration: 1200,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #6366f1 70%, #8b5cf6 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0, rotate: 1080, filter: "blur(30px) brightness(2)" },
      animate: { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px) brightness(1)" },
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "hologram",
    name: "Hologram",
    description: "Sci-fi holographic scan",
    category: "premium",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #000428 0%, #004e92 50%, #00d4ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scaleY: 0.01, scaleX: 1.5, filter: "brightness(5) saturate(0) hue-rotate(180deg)", clipPath: "inset(50% 0% 50% 0%)" },
      animate: { opacity: 1, scaleY: 1, scaleX: 1, filter: "brightness(1) saturate(1) hue-rotate(0deg)", clipPath: "inset(0% 0% 0% 0%)" },
      transition: { duration: 1.0, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "glitch-matrix",
    name: "Cyber",
    description: "Digital corruption reveal",
    category: "premium",
    duration: 800,
    easing: "linear",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #00ff00 50%, #003300 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: -20, skewX: 10, filter: "hue-rotate(90deg) saturate(3) contrast(2)", clipPath: "inset(0 100% 0 0)" },
      animate: { opacity: 1, x: 0, skewX: 0, filter: "hue-rotate(0deg) saturate(1) contrast(1)", clipPath: "inset(0 0% 0 0)" },
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "quantum-shift",
    name: "Quantum",
    description: "Reality-bending phase shift",
    category: "premium",
    duration: 1100,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #0a0a0a 0%, #3d1a78 30%, #00ffff 70%, #ff00ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 3, rotateY: 180, filter: "blur(50px) invert(1)" },
      animate: { opacity: 1, scale: 1, rotateY: 0, filter: "blur(0px) invert(0)" },
      transition: { duration: 1.1, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
  {
    id: "portal",
    name: "Portal",
    description: "Dimensional gateway entrance",
    category: "premium",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #1a0533 0%, #4a0080 30%, #ff6600 70%, #ffcc00 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0, rotate: 180, borderRadius: "50%", filter: "blur(20px) brightness(3)", clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, scale: 1, rotate: 0, borderRadius: "0%", filter: "blur(0px) brightness(1)", clipPath: "circle(100% at 50% 50%)" },
      transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
    },
  },

  // === NEW PREMIUM ANIMATIONS === (Even more breathtaking)
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights shimmer",
    category: "premium",
    duration: 1200,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 30%, #2c5364 50%, #00d9ff 80%, #00ff88 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: -50, filter: "blur(20px) saturate(2) hue-rotate(-30deg)", clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px) saturate(1) hue-rotate(0deg)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "nebula",
    name: "Nebula",
    description: "Cosmic cloud formation",
    category: "premium",
    duration: 1300,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #0d0221 0%, #1a0533 20%, #4a0080 50%, #800080 70%, #ff00ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.3, filter: "blur(60px) brightness(3) contrast(0.5)", rotate: -45 },
      animate: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1) contrast(1)", rotate: 0 },
      transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "blackhole",
    name: "Singularity",
    description: "Gravitational pull reveal",
    category: "premium",
    duration: 1100,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #1a1a1a 60%, #ff6600 90%, #ffcc00 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 5, filter: "blur(100px) brightness(0)", clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", clipPath: "circle(100% at 50% 50%)" },
      transition: { duration: 1.1, ease: [0.6, 0, 0.2, 1] },
    },
  },
  {
    id: "prism",
    name: "Prism",
    description: "Light refraction split",
    category: "premium",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #ff0000 0%, #ff7f00 17%, #ffff00 33%, #00ff00 50%, #0000ff 67%, #4b0082 83%, #9400d3 100%)",
    enterAnimation: {
      initial: { opacity: 0, skewX: -20, filter: "hue-rotate(180deg) saturate(3) brightness(2)", clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" },
      animate: { opacity: 1, skewX: 0, filter: "hue-rotate(0deg) saturate(1) brightness(1)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" },
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "warp",
    name: "Warp Speed",
    description: "Hyperspace jump entrance",
    category: "premium",
    duration: 800,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #000011 0%, #000033 30%, #0066ff 60%, #00ccff 80%, #ffffff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scaleX: 0.01, scaleY: 3, filter: "blur(30px) brightness(5)" },
      animate: { opacity: 1, scaleX: 1, scaleY: 1, filter: "blur(0px) brightness(1)" },
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  },

  // === ADVANCED === (refined, professional motion — mostly unlocked)
  {
    id: "cube-turn",
    name: "Cube Turn",
    description: "3D cube rotation from the right",
    category: "flip",
    duration: 600,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateY: 75, x: 120, scale: 0.92 },
      animate: { opacity: 1, rotateY: 0, x: 0, scale: 1 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "fold-down",
    name: "Fold Down",
    description: "Paper fold from the top edge",
    category: "flip",
    duration: 550,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateX: -80, y: -40, transformOrigin: "50% 0%" },
      animate: { opacity: 1, rotateX: 0, y: 0, transformOrigin: "50% 0%" },
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "wipe-reveal",
    name: "Wipe",
    description: "Clean directional wipe reveal",
    category: "slide",
    duration: 550,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    enterAnimation: {
      initial: { opacity: 1, clipPath: "inset(0 100% 0 0)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
      transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
    },
  },
  {
    id: "push-left",
    name: "Push",
    description: "Slide with subtle depth push",
    category: "slide",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 90, scale: 0.96 },
      animate: { opacity: 1, x: 0, scale: 1 },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "iris-open",
    name: "Iris",
    description: "Circular iris reveal from center",
    category: "zoom",
    duration: 650,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #355c7d 0%, #6c5b7b 50%, #c06c84 100%)",
    enterAnimation: {
      initial: { opacity: 1, clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, clipPath: "circle(75% at 50% 50%)" },
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "blur-focus",
    name: "Focus Pull",
    description: "Cinematic blur-to-sharp focus",
    category: "fade",
    duration: 550,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.04, filter: "blur(14px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "tilt-in",
    name: "Tilt",
    description: "3D perspective tilt entrance",
    category: "creative",
    duration: 600,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateX: 18, rotateY: -22, scale: 0.95 },
      animate: { opacity: 1, rotateX: 0, rotateY: 0, scale: 1 },
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "zoom-blur",
    name: "Zoom Blur",
    description: "Motion-blur zoom focus",
    category: "zoom",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.18, filter: "blur(10px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "light-sweep",
    name: "Light Sweep",
    description: "Bright sweep slide-in",
    category: "cinematic",
    duration: 600,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #243949 0%, #517fa4 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 70, filter: "brightness(2.2)" },
      animate: { opacity: 1, x: 0, filter: "brightness(1)" },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "depth-dolly",
    name: "Dolly",
    description: "Camera dolly depth move",
    category: "cinematic",
    duration: 650,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.12, y: 24, filter: "blur(6px)" },
      animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "swing-in",
    name: "Swing In",
    description: "Pendulum swing from the top",
    category: "creative",
    duration: 700,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotate: -8, y: -60, transformOrigin: "50% 0%" },
      animate: { opacity: 1, rotate: 0, y: 0, transformOrigin: "50% 0%" },
      transition: { type: "spring", stiffness: 200, damping: 14 },
    },
  },
  {
    id: "ripple-reveal",
    name: "Ripple",
    description: "Liquid ripple expansion",
    category: "premium",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.6, filter: "blur(20px) saturate(1.6)", clipPath: "circle(0% at 50% 50%)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px) saturate(1)", clipPath: "circle(100% at 50% 50%)" },
      transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
    },
  },
  {
    id: "page-peel",
    name: "Page Peel",
    description: "Corner page-turn reveal",
    category: "premium",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    isPro: true,
    previewGradient: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateY: -60, rotateX: 12, x: 80, transformOrigin: "100% 50%", filter: "brightness(0.8)" },
      animate: { opacity: 1, rotateY: 0, rotateX: 0, x: 0, transformOrigin: "100% 50%", filter: "brightness(1)" },
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  },
];


// Get animation by ID
export function getAnimationById(id: string): AnimationPreset | undefined {
  return ANIMATION_PRESETS.find((a) => a.id === id);
}

// Get animations by category
export function getAnimationsByCategory(category: AnimationCategory): AnimationPreset[] {
  return ANIMATION_PRESETS.filter((a) => a.category === category);
}

// Get all categories with their animations
export function getAnimationCategories(): { category: AnimationCategory; name: string; animations: AnimationPreset[] }[] {
  const categories: { category: AnimationCategory; name: string }[] = [
    { category: "none", name: "None" },
    { category: "fade", name: "Fade" },
    { category: "slide", name: "Slide" },
    { category: "zoom", name: "Zoom" },
    { category: "flip", name: "Flip" },
    { category: "creative", name: "Creative" },
    { category: "cinematic", name: "Cinematic" },
    { category: "particles", name: "Particles" },
    { category: "premium", name: "Premium ✨" },
  ];

  return categories.map((c) => ({
    ...c,
    animations: getAnimationsByCategory(c.category),
  }));
}

// Default animation
export const DEFAULT_ANIMATION = "fade-up";
