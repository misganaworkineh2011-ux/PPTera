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
  // CSS class or Framer Motion config
  enterAnimation: AnimationConfig;
  exitAnimation?: AnimationConfig;
  // Duration in ms
  duration: number;
  // Easing function
  easing: string;
  // Whether this animation has special effects (particles, etc.)
  hasEffects?: boolean;
  // Preview thumbnail color/gradient
  previewGradient?: string;
  // Premium animation - requires paid subscription
  isPremium?: boolean;
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

  // === FADE === (Fast, GPU-accelerated)
  {
    id: "fade",
    name: "Fade",
    description: "Simple fade in",
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
    name: "Fade Up",
    description: "Fade in while rising",
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
    name: "Fade Scale",
    description: "Fade in with subtle scale",
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

  // === SLIDE === (Snappy, performant)
  {
    id: "slide-left",
    name: "Slide Left",
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
    name: "Slide Right",
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
    name: "Slide Up",
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

  // === ZOOM === (Smooth, fast)
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Zoom in from small",
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
    id: "modern-rise",
    name: "Modern Rise",
    description: "Elegant rise with scale",
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
    name: "Soft Zoom",
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
    name: "Elastic Pop",
    description: "Bouncy entrance",
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
  {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Zoom in from large",
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
    name: "Zoom Rotate",
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

  // === FLIP === (3D, optimized)
  {
    id: "flip-x",
    name: "Flip Horizontal",
    description: "3D flip on X axis",
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
    name: "Flip Vertical",
    description: "3D flip on Y axis",
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

  // === CREATIVE === (Snappy springs)
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
    name: "Elastic",
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
    id: "glitch",
    name: "Glitch",
    description: "Digital glitch effect",
    category: "creative",
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

  // === CINEMATIC === (Smooth, professional)
  {
    id: "cinematic-zoom",
    name: "Cinematic Zoom",
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
    name: "Parallax Depth",
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
    duration: 400,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  {
    id: "curtain",
    name: "Curtain Reveal",
    description: "Theater curtain opening",
    category: "cinematic",
    duration: 500,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)",
    enterAnimation: {
      initial: { opacity: 0, clipPath: "inset(0 40% 0 40%)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0%)" },
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  },

  // === PARTICLES === (Visual effects)
  {
    id: "confetti",
    name: "Confetti Burst",
    description: "Celebration confetti",
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
    name: "Matrix Rain",
    description: "Digital matrix effect",
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

  // === PREMIUM ANIMATIONS === (Complex, cinematic effects for paid users)
  {
    id: "disintegrate",
    name: "Disintegrate",
    description: "Particles scatter from multiple points",
    category: "premium",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #e94560 50%, #0f3460 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        filter: "blur(30px) brightness(2)",
        scale: 1.3,
        clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
      },
      animate: { 
        opacity: 1, 
        filter: "blur(0px) brightness(1)",
        scale: 1,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      },
      transition: { 
        duration: 1.0, 
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  {
    id: "reconstruct",
    name: "Reconstruct",
    description: "Fragments assemble from chaos",
    category: "premium",
    duration: 1100,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 30%, #4a00e0 70%, #8e2de2 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 0.1,
        rotateX: 90,
        rotateY: -90,
        rotateZ: 45,
        filter: "blur(25px) brightness(3) contrast(2)",
        transformOrigin: "center center",
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        filter: "blur(0px) brightness(1) contrast(1)",
      },
      transition: { 
        duration: 1.1, 
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  {
    id: "explode",
    name: "Explode",
    description: "Explosive shockwave entrance",
    category: "premium",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #ff4e00 0%, #ec9f05 30%, #ff6b35 70%, #f7931e 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 0,
        rotate: -360,
        filter: "brightness(5) saturate(3)",
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        filter: "brightness(1) saturate(1)",
      },
      transition: { 
        type: "spring",
        stiffness: 150,
        damping: 12,
        mass: 1.5,
      },
    },
  },
  {
    id: "morph-liquid",
    name: "Liquid Morph",
    description: "Fluid blob transformation",
    category: "premium",
    duration: 1000,
    easing: "ease-in-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 30%, #7c3aed 70%, #a855f7 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 0.5,
        borderRadius: "50%",
        filter: "blur(40px) hue-rotate(90deg)",
        clipPath: "circle(0% at 50% 50%)",
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        borderRadius: "0%",
        filter: "blur(0px) hue-rotate(0deg)",
        clipPath: "circle(100% at 50% 50%)",
      },
      transition: { 
        duration: 1.0, 
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  {
    id: "shatter",
    name: "Shatter",
    description: "Glass breaking into pieces",
    category: "premium",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #141e30 0%, #243b55 50%, #4b79a1 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        clipPath: "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)",
        scale: 2,
        filter: "brightness(3)",
      },
      animate: { 
        opacity: 1, 
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        scale: 1,
        filter: "brightness(1)",
      },
      transition: { 
        duration: 0.9, 
        ease: [0.16, 1, 0.3, 1],
      },
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
    previewGradient: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #6366f1 70%, #8b5cf6 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 0,
        rotate: 1080,
        filter: "blur(30px) brightness(2)",
        transformOrigin: "center center",
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        filter: "blur(0px) brightness(1)",
      },
      transition: { 
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1],
      },
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
    previewGradient: "linear-gradient(135deg, #000428 0%, #004e92 50%, #00d4ff 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scaleY: 0.01,
        scaleX: 1.5,
        filter: "brightness(5) saturate(0) hue-rotate(180deg)",
        clipPath: "inset(50% 0% 50% 0%)",
      },
      animate: { 
        opacity: 1, 
        scaleY: 1,
        scaleX: 1,
        filter: "brightness(1) saturate(1) hue-rotate(0deg)",
        clipPath: "inset(0% 0% 0% 0%)",
      },
      transition: { 
        duration: 1.0, 
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  {
    id: "glitch-matrix",
    name: "Glitch Matrix",
    description: "Digital corruption reveal",
    category: "premium",
    duration: 800,
    easing: "linear",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #00ff00 50%, #003300 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        x: -20,
        skewX: 10,
        filter: "hue-rotate(90deg) saturate(3) contrast(2)",
        clipPath: "inset(0 100% 0 0)",
      },
      animate: { 
        opacity: 1, 
        x: 0,
        skewX: 0,
        filter: "hue-rotate(0deg) saturate(1) contrast(1)",
        clipPath: "inset(0 0% 0 0)",
      },
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  },
  {
    id: "quantum-shift",
    name: "Quantum Shift",
    description: "Reality-bending phase shift",
    category: "premium",
    duration: 1100,
    easing: "ease-out",
    hasEffects: true,
    isPremium: true,
    previewGradient: "linear-gradient(135deg, #0a0a0a 0%, #3d1a78 30%, #00ffff 70%, #ff00ff 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 3,
        rotateY: 180,
        filter: "blur(50px) invert(1)",
        transformPerspective: 1000,
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        rotateY: 0,
        filter: "blur(0px) invert(0)",
      },
      transition: { 
        duration: 1.1, 
        ease: [0.34, 1.56, 0.64, 1],
      },
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
    previewGradient: "linear-gradient(135deg, #1a0533 0%, #4a0080 30%, #ff6600 70%, #ffcc00 100%)",
    enterAnimation: {
      initial: { 
        opacity: 0, 
        scale: 0,
        rotate: 180,
        borderRadius: "50%",
        filter: "blur(20px) brightness(3)",
        clipPath: "circle(0% at 50% 50%)",
      },
      animate: { 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        borderRadius: "0%",
        filter: "blur(0px) brightness(1)",
        clipPath: "circle(100% at 50% 50%)",
      },
      transition: { 
        duration: 1.0, 
        ease: [0.22, 1, 0.36, 1],
      },
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
