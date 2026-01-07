// Slide Layout Types
// Defines image positioning relative to content
// Images have an inward arc/curve on the edge facing the content

export type SlideLayoutType =
  | "image-left"
  | "image-right"
  | "image-top"
  | "image-bottom"
  | "image-background"
  | "image-full"
  | "no-image"
  | "chart-left"
  | "chart-right";

export type ImageSize = "small" | "medium" | "large" | "full";

export type ImageShape = "rectangle" | "arc" | "rounded" | "wave";

// Helper to get CSS clip-path for image shapes based on image position
// The clip-path is applied to the edge FACING the content
// e.g., if image is on "right", the clip-path affects the LEFT edge of the image
export const getImageShapeClipPath = (
  shape: ImageShape,
  imagePosition: "left" | "right" | "top" | "bottom"
): string => {
  if (shape === "rectangle") {
    return "none"; // No clip-path, straight edges
  }

  if (shape === "arc") {
    // Arc/curve effect on the edge facing content
    switch (imagePosition) {
      // Image on left → clip the RIGHT edge (facing content)
      case "left":
        return "polygon(0 0, calc(100% - 50px) 0, 100% 50%, calc(100% - 50px) 100%, 0 100%)";
      // Image on right → clip the LEFT edge (facing content)
      case "right":
        return "polygon(50px 0, 100% 0, 100% 100%, 50px 100%, 0 50%)";
      // Image on top → clip the BOTTOM edge (facing content)
      case "top":
        return "polygon(0 0, 100% 0, 100% calc(100% - 40px), 50% 100%, 0 calc(100% - 40px))";
      // Image on bottom → clip the TOP edge (facing content)
      case "bottom":
        return "polygon(0 40px, 50% 0, 100% 40px, 100% 100%, 0 100%)";
    }
  }

  if (shape === "rounded") {
    // Smooth rounded curve on the edge facing content
    switch (imagePosition) {
      case "left":
        // Rounded right edge (facing content) - using border-radius style curve
        return "polygon(0 0, calc(100% - 40px) 0, calc(100% - 20px) 10%, 100% 30%, 100% 70%, calc(100% - 20px) 90%, calc(100% - 40px) 100%, 0 100%)";
      case "right":
        // Rounded left edge (facing content)
        return "polygon(40px 0, 100% 0, 100% 100%, 40px 100%, 20px 90%, 0 70%, 0 30%, 20px 10%)";
      case "top":
        // Rounded bottom edge (facing content)
        return "polygon(0 0, 100% 0, 100% calc(100% - 40px), 90% calc(100% - 20px), 70% 100%, 30% 100%, 10% calc(100% - 20px), 0 calc(100% - 40px))";
      case "bottom":
        // Rounded top edge (facing content)
        return "polygon(0 40px, 10% 20px, 30% 0, 70% 0, 90% 20px, 100% 40px, 100% 100%, 0 100%)";
    }
  }

  if (shape === "wave") {
    // Wavy edge effect on the edge facing content
    switch (imagePosition) {
      case "left":
        return "polygon(0 0, 90% 0, 100% 25%, 90% 50%, 100% 75%, 90% 100%, 0 100%)";
      case "right":
        return "polygon(10% 0, 100% 0, 100% 100%, 10% 100%, 0 75%, 10% 50%, 0 25%)";
      case "top":
        return "polygon(0 0, 100% 0, 100% 90%, 75% 100%, 50% 90%, 25% 100%, 0 90%)";
      case "bottom":
        return "polygon(0 10%, 25% 0, 50% 10%, 75% 0, 100% 10%, 100% 100%, 0 100%)";
    }
  }

  return "none";
};

export interface SlideLayoutDefinition {
  id: SlideLayoutType;
  name: string;
  description: string;
  // Image configuration
  imagePosition: "left" | "right" | "top" | "bottom" | "background" | "full" | "none";
  // Size as percentage of slide dimension (width for left/right, height for top/bottom)
  sizes: {
    small: number;   // percentage
    medium: number;
    large: number;
    full: number;
  };
  // Arc/curve configuration for the edge facing content
  arc: {
    enabled: boolean;
    direction: "inward"; // curves into the slide
    // Which edge has the arc (opposite of image position)
    edge: "right" | "left" | "bottom" | "top" | "none";
    // Arc intensity (how deep the curve goes)
    intensity: number; // pixels or percentage
  };
  // CSS clip-path or border-radius values for the arc effect
  clipPath: string;
}

export const slideLayouts: SlideLayoutDefinition[] = [
  {
    id: "image-left",
    name: "Image Right",
    description: "Image on right side, content on left",
    imagePosition: "left",
    sizes: {
      small: 30,
      medium: 40,
      large: 50,
      full: 60,
    },
    arc: {
      enabled: true,
      direction: "inward",
      edge: "right",
      intensity: 50,
    },
    clipPath: "ellipse(100% 100% at 0% 50%)", // curves inward on right edge
  },
  {
    id: "image-right",
    name: "Image Left",
    description: "Image on left side, content on right",
    imagePosition: "right",
    sizes: {
      small: 30,
      medium: 40,
      large: 50,
      full: 60,
    },
    arc: {
      enabled: true,
      direction: "inward",
      edge: "left",
      intensity: 50,
    },
    clipPath: "ellipse(100% 100% at 100% 50%)", // curves inward on left edge
  },
  {
    id: "image-top",
    name: "Image Top",
    description: "Image on top edge with inward arc on bottom side",
    imagePosition: "top",
    sizes: {
      small: 25,
      medium: 35,
      large: 45,
      full: 55,
    },
    arc: {
      enabled: true,
      direction: "inward",
      edge: "bottom",
      intensity: 40,
    },
    clipPath: "ellipse(100% 100% at 50% 0%)", // curves inward on bottom edge
  },
  {
    id: "image-bottom",
    name: "Image Bottom",
    description: "Image on bottom edge with inward arc on top side",
    imagePosition: "bottom",
    sizes: {
      small: 25,
      medium: 35,
      large: 45,
      full: 55,
    },
    arc: {
      enabled: true,
      direction: "inward",
      edge: "top",
      intensity: 40,
    },
    clipPath: "ellipse(100% 100% at 50% 100%)", // curves inward on top edge
  },
  {
    id: "image-background",
    name: "Image Background",
    description: "Full-bleed background image with content overlay",
    imagePosition: "background",
    sizes: {
      small: 100,
      medium: 100,
      large: 100,
      full: 100,
    },
    arc: {
      enabled: false,
      direction: "inward",
      edge: "none",
      intensity: 0,
    },
    clipPath: "none", // no clipping for background
  },
  {
    id: "image-full",
    name: "Full Image",
    description: "Full-bleed image only, no text content",
    imagePosition: "full",
    sizes: {
      small: 100,
      medium: 100,
      large: 100,
      full: 100,
    },
    arc: {
      enabled: false,
      direction: "inward",
      edge: "none",
      intensity: 0,
    },
    clipPath: "none",
  },
  {
    id: "no-image",
    name: "No Image",
    description: "Content only, no image",
    imagePosition: "none",
    sizes: {
      small: 0,
      medium: 0,
      large: 0,
      full: 0,
    },
    arc: {
      enabled: false,
      direction: "inward",
      edge: "none",
      intensity: 0,
    },
    clipPath: "none",
  },
];

// Helper functions
export const getSlideLayoutById = (id: SlideLayoutType): SlideLayoutDefinition | undefined => {
  return slideLayouts.find((layout) => layout.id === id);
};

export const getSlideLayoutsWithImage = (): SlideLayoutDefinition[] => {
  return slideLayouts.filter((layout) => layout.imagePosition !== "none");
};

// Generate CSS styles for a slide layout
export const getSlideLayoutStyles = (
  layoutId: SlideLayoutType,
  size: ImageSize = "medium"
): {
  imageStyles: React.CSSProperties;
  contentStyles: React.CSSProperties;
} => {
  const layout = getSlideLayoutById(layoutId);
  
  if (!layout || layout.imagePosition === "none") {
    return {
      imageStyles: { display: "none" },
      contentStyles: { width: "100%", height: "100%" },
    };
  }

  const sizeValue = layout.sizes[size];

  if (layout.imagePosition === "background") {
    return {
      imageStyles: {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
      },
      contentStyles: {
        position: "relative",
        zIndex: 1,
        width: "100%",
        height: "100%",
      },
    };
  }

  const imageStyles: React.CSSProperties = {
    position: "absolute",
    objectFit: "cover",
    clipPath: layout.arc.enabled ? layout.clipPath : "none",
    ...(layout.imagePosition === "left" && {
      left: 0,
      top: 0,
      width: `${sizeValue}%`,
      height: "100%",
    }),
    ...(layout.imagePosition === "right" && {
      right: 0,
      top: 0,
      width: `${sizeValue}%`,
      height: "100%",
    }),
    ...(layout.imagePosition === "top" && {
      top: 0,
      left: 0,
      width: "100%",
      height: `${sizeValue}%`,
    }),
    ...(layout.imagePosition === "bottom" && {
      bottom: 0,
      left: 0,
      width: "100%",
      height: `${sizeValue}%`,
    }),
  };

  const contentStyles: React.CSSProperties = {
    position: "absolute",
    ...(layout.imagePosition === "left" && {
      right: 0,
      top: 0,
      width: `${100 - sizeValue + 5}%`, // +5% overlap for arc
      height: "100%",
    }),
    ...(layout.imagePosition === "right" && {
      left: 0,
      top: 0,
      width: `${100 - sizeValue + 5}%`,
      height: "100%",
    }),
    ...(layout.imagePosition === "top" && {
      bottom: 0,
      left: 0,
      width: "100%",
      height: `${100 - sizeValue + 5}%`,
    }),
    ...(layout.imagePosition === "bottom" && {
      top: 0,
      left: 0,
      width: "100%",
      height: `${100 - sizeValue + 5}%`,
    }),
  };

  return { imageStyles, contentStyles };
};
