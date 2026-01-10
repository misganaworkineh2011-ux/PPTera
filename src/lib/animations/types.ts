// Slide Animation Types and Presets
// These animations play when transitioning between slides in present mode

export type AnimationCategory = 
  | "none"
  | "fade"
  | "slide"
  | "zoom"
  | "flip"
  | "creative"
  | "cinematic"
  | "particles";

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

// All available animation presets
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

  // === FADE ===
  {
    id: "fade",
    name: "Fade",
    description: "Simple fade in",
    category: "fade",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    enterAnimation: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
  {
    id: "fade-up",
    name: "Fade Up",
    description: "Fade in while rising",
    category: "fade",
    duration: 600,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.8, ease: "easeOut" },
    },
  },
  {
    id: "fade-scale",
    name: "Fade Scale",
    description: "Fade in with subtle scale",
    category: "fade",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },

  // === SLIDE ===
  {
    id: "slide-left",
    name: "Slide Left",
    description: "Slide in from right",
    category: "slide",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  {
    id: "slide-right",
    name: "Slide Right",
    description: "Slide in from left",
    category: "slide",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  {
    id: "slide-up",
    name: "Slide Up",
    description: "Slide in from bottom",
    category: "slide",
    duration: 500,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 100 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },

  // === ZOOM ===
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Zoom in from small",
    category: "zoom",
    duration: 600,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
  {
    id: "modern-rise",
    name: "Modern Rise",
    description: "Elegant rise with scale",
    category: "creative",
    duration: 800,
    easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    previewGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: 60, scale: 0.95, filter: "blur(10px)" },
      animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
      transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] },
    },
  },
  {
    id: "soft-zoom",
    name: "Soft Zoom",
    description: "Gentle cinematic zoom",
    category: "creative",
    duration: 1200,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.1, filter: "blur(5px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      transition: { duration: 1.2, ease: "easeOut" },
    },
  },
  {
    id: "elastic-pop",
    name: "Elastic Pop",
    description: "Bouncy entrance",
    category: "creative",
    duration: 700,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Zoom in from large",
    category: "zoom",
    duration: 600,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  {
    id: "zoom-rotate",
    name: "Zoom Rotate",
    description: "Zoom with rotation",
    category: "zoom",
    duration: 700,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.3, rotate: -15 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
    },
  },

  // === FLIP ===
  {
    id: "flip-x",
    name: "Flip Horizontal",
    description: "3D flip on X axis",
    category: "flip",
    duration: 700,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateY: -90 },
      animate: { opacity: 1, rotateY: 0 },
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },
  {
    id: "flip-y",
    name: "Flip Vertical",
    description: "3D flip on Y axis",
    category: "flip",
    duration: 700,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotateX: 90 },
      animate: { opacity: 1, rotateX: 0 },
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },

  // === CREATIVE ===
  {
    id: "bounce",
    name: "Bounce",
    description: "Bouncy spring entrance",
    category: "creative",
    duration: 800,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    enterAnimation: {
      initial: { opacity: 0, y: -100, scale: 0.8 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  },
  {
    id: "elastic",
    name: "Elastic",
    description: "Elastic pop effect",
    category: "creative",
    duration: 900,
    easing: "spring",
    previewGradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: "spring", stiffness: 400, damping: 10 },
    },
  },
  {
    id: "swing",
    name: "Swing",
    description: "Swing in from corner",
    category: "creative",
    duration: 800,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    enterAnimation: {
      initial: { opacity: 0, rotate: -10, x: -50, y: -30 },
      animate: { opacity: 1, rotate: 0, x: 0, y: 0 },
      transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
    },
  },
  {
    id: "glitch",
    name: "Glitch",
    description: "Digital glitch effect",
    category: "creative",
    duration: 600,
    easing: "linear",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    enterAnimation: {
      initial: { opacity: 0, x: 0 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6 },
    },
  },

  // === CINEMATIC ===
  {
    id: "cinematic-zoom",
    name: "Cinematic Zoom",
    description: "Movie-style zoom reveal",
    category: "cinematic",
    duration: 1000,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 1.3, filter: "blur(10px)" },
      animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  {
    id: "parallax-depth",
    name: "Parallax Depth",
    description: "3D depth parallax",
    category: "cinematic",
    duration: 900,
    easing: "ease-out",
    previewGradient: "linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)",
    enterAnimation: {
      initial: { opacity: 0, z: -200, scale: 0.8 },
      animate: { opacity: 1, z: 0, scale: 1 },
      transition: { duration: 0.9, ease: "easeOut" },
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
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.8, ease: "easeOut" },
    },
  },
  {
    id: "curtain",
    name: "Curtain Reveal",
    description: "Theater curtain opening",
    category: "cinematic",
    duration: 1000,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #8e0e00 0%, #1f1c18 100%)",
    enterAnimation: {
      initial: { opacity: 0, clipPath: "inset(0 50% 0 50%)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0%)" },
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },

  // === PARTICLES ===
  {
    id: "confetti",
    name: "Confetti Burst",
    description: "Celebration confetti",
    category: "particles",
    duration: 800,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.8, ease: "easeOut" },
    },
  },
  {
    id: "sparkle",
    name: "Sparkle",
    description: "Magical sparkle trail",
    category: "particles",
    duration: 900,
    easing: "ease-out",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
    enterAnimation: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.9, ease: "easeOut" },
    },
  },
  {
    id: "matrix",
    name: "Matrix Rain",
    description: "Digital matrix effect",
    category: "particles",
    duration: 1000,
    easing: "linear",
    hasEffects: true,
    previewGradient: "linear-gradient(135deg, #000000 0%, #003300 100%)",
    enterAnimation: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 1 },
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
  ];

  return categories.map((c) => ({
    ...c,
    animations: getAnimationsByCategory(c.category),
  }));
}

// Default animation
export const DEFAULT_ANIMATION = "fade-up";
