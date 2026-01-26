import type { SlideLayoutType } from "~/lib/layouts/slide";
import type { SlideData } from "~/components/presentation/types";

const pickDefaultLayout = (hasImage: boolean): SlideLayoutType => {
  if (!hasImage) return "no-image";
  const positions: SlideLayoutType[] = ["image-left", "image-right"];
  return positions[Math.floor(Math.random() * positions.length)]!;
};

export const addStreamingPlaceholderSlide = (
  prev: SlideData[],
  slideIndex: number,
  type: SlideData["type"],
  hasImage: boolean,
): SlideData[] => {
  const newSlides = [...prev];
  newSlides[slideIndex] = {
    type,
    title: "",
    bulletPoints: [],
    image: hasImage ? { url: "", alt: "Loading...", source: "placeholder" } : undefined,
    slideLayout: pickDefaultLayout(hasImage),
    contentLayout: "box-style-1",
  };
  return newSlides;
};

export const updateSlidesWithField = <T extends keyof SlideData>(
  prev: SlideData[],
  slideIndex: number,
  field: T,
  value: SlideData[T],
): SlideData[] => {
  const newSlides = [...prev];
  if (newSlides[slideIndex]) {
    newSlides[slideIndex] = {
      ...newSlides[slideIndex]!,
      [field]: value,
    };
  }
  return newSlides;
};

export const updateSlidesWithBullet = (
  prev: SlideData[],
  slideIndex: number,
  bulletIndex: number,
  value: string,
): SlideData[] => {
  const newSlides = [...prev];
  if (newSlides[slideIndex]) {
    const bullets = [...(newSlides[slideIndex]!.bulletPoints || [])];
    bullets[bulletIndex] = value;
    newSlides[slideIndex] = {
      ...newSlides[slideIndex]!,
      bulletPoints: bullets,
    };
  }
  return newSlides;
};

export const updateSlidesWithImage = (
  prev: SlideData[],
  slideIndex: number,
  image: SlideData["image"],
): SlideData[] => {
  const newSlides = [...prev];
  if (newSlides[slideIndex]) {
    newSlides[slideIndex] = {
      ...newSlides[slideIndex]!,
      image,
    };
  }
  return newSlides;
};

export const updateSlidesWithSlideComplete = (
  prev: SlideData[],
  slideIndex: number,
  slide: SlideData,
): SlideData[] => {
  const newSlides = [...prev];
  const existingSlide = newSlides[slideIndex];
  newSlides[slideIndex] = {
    ...slide,
    image: slide.image?.url ? slide.image : existingSlide?.image,
  };
  return newSlides;
};

export const mergeStreamingSlides = (
  prev: SlideData[],
  serverSlides: SlideData[],
): SlideData[] => {
  return serverSlides.map((serverSlide, index) => {
    const clientSlide = prev[index];
    return {
      ...serverSlide,
      image: serverSlide.image?.url ? serverSlide.image : clientSlide?.image,
    };
  });
};
