import { useCallback } from "react";
import { type SlideData, type EditingState } from "~/components/presentation/types";
import { type LayoutType } from "~/lib/slide-layouts";
import { type SlideLayoutType, type ImageSize, type ImageShape } from "~/lib/layouts/slide";
import { type ContentLayoutId } from "~/components/presentation/ContentLayoutPanel";

interface UseSlideOperationsOptions {
  slidesData: SlideData[];
  currentSlide: number;
  updateSlidesWithSave: (newSlides: SlideData[]) => void;
  setCurrentSlide: (index: number) => void;
  setEditingText: (value: EditingState | null) => void;
  setShowImageModal: (index: number | null) => void;
  setImageUrl: (value: string) => void;
  setEditingImageIndex: (index: number | null) => void;
}

export function useSlideOperations({
  slidesData,
  currentSlide,
  updateSlidesWithSave,
  setCurrentSlide,
  setEditingText,
  setShowImageModal,
  setImageUrl,
  setEditingImageIndex,
}: UseSlideOperationsOptions) {
  const updateSlideContent = useCallback((slideIndex: number, field: string, value: string, bulletIndex?: number) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (!existingSlide) return;
    const slide: SlideData = { ...existingSlide };
    if (field === "title") slide.title = value;
    else if (field === "subtitle") slide.subtitle = value;
    else if (field === "bullet" && bulletIndex !== undefined) {
      const bullets = [...(slide.bulletPoints || [])];
      bullets[bulletIndex] = value;
      slide.bulletPoints = bullets;
      slide.transformedContent = undefined;
    } else if (field === "sectionHeading" && bulletIndex !== undefined) {
      const sections = [...(slide.sections || [])];
      if (sections[bulletIndex]) {
        sections[bulletIndex] = { ...sections[bulletIndex], heading: value };
        slide.sections = sections;
      }
    } else if (field === "sectionDescription" && bulletIndex !== undefined) {
      const sections = [...(slide.sections || [])];
      if (sections[bulletIndex]) {
        sections[bulletIndex] = { ...sections[bulletIndex], description: value };
        slide.sections = sections;
      }
    }
    newSlides[slideIndex] = slide;
    updateSlidesWithSave(newSlides);
  }, [slidesData, updateSlidesWithSave]);

  const changeSlideLayout = useCallback((
    slideIndex: number,
    slideLayoutId: SlideLayoutType,
    imageSize: ImageSize,
    imageShape: ImageShape,
  ) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      const layoutMap: Record<SlideLayoutType, string> = {
        "image-left": "right-content",
        "image-right": "left-content",
        "image-top": "image-top",
        "image-bottom": "image-bottom",
        "image-background": "image-background",
        "image-full": "full-image",
        "no-image": "grid-3-col",
        "chart-left": "chart-left",
        "chart-right": "chart-right",
      };
      const mappedLayout = layoutMap[slideLayoutId] || "left-content";
      newSlides[slideIndex] = {
        ...existingSlide,
        layout: mappedLayout as LayoutType,
        slideLayout: slideLayoutId,
        imageSize: imageSize,
        imageShape: imageShape,
      };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const changeContentLayout = useCallback((slideIndex: number, layoutId: ContentLayoutId) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      newSlides[slideIndex] = { ...existingSlide, contentLayout: layoutId };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const changeSlideAnimation = useCallback((slideIndex: number, animationId: string) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      newSlides[slideIndex] = { ...existingSlide, animation: animationId };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const changeContentAnimation = useCallback((slideIndex: number, enabled: boolean) => {
    const newSlides = [...slidesData];
    const existingSlide = newSlides[slideIndex];
    if (existingSlide) {
      newSlides[slideIndex] = { ...existingSlide, contentAnimation: enabled };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const duplicateSlide = useCallback((index: number) => {
    const original = slidesData[index];
    if (original) {
      const newSlides = [...slidesData];
      newSlides.splice(index + 1, 0, { ...original });
      updateSlidesWithSave(newSlides);
      setCurrentSlide(index + 1);
    }
  }, [slidesData, updateSlidesWithSave, setCurrentSlide]);

  const addSlideAt = useCallback((index: number) => {
    const newSlide: SlideData = {
      type: "content",
      title: "New Slide",
      bulletPoints: ["Add your content here"],
      layout: "left-content" as LayoutType,
      slideLayout: "image-right",
      imageSize: "medium",
      contentLayout: "box-style-1",
    };
    const newSlides = [...slidesData];
    newSlides.splice(index + 1, 0, newSlide);
    updateSlidesWithSave(newSlides);
    setCurrentSlide(index + 1);
  }, [slidesData, updateSlidesWithSave, setCurrentSlide]);

  const deleteSlide = useCallback((index: number) => {
    if (slidesData.length <= 1) return;
    const newSlides = slidesData.filter((_, i) => i !== index);
    updateSlidesWithSave(newSlides);
    if (currentSlide >= newSlides.length) setCurrentSlide(newSlides.length - 1);
  }, [slidesData, currentSlide, updateSlidesWithSave, setCurrentSlide]);

  const moveSlide = useCallback((index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slidesData.length) return;
    const newSlides = [...slidesData];
    const slideA = newSlides[index];
    const slideB = newSlides[newIndex];
    if (slideA && slideB) {
      newSlides[index] = slideB;
      newSlides[newIndex] = slideA;
      updateSlidesWithSave(newSlides);
      setCurrentSlide(newIndex);
    }
  }, [slidesData, updateSlidesWithSave, setCurrentSlide]);

  const addBulletPoint = useCallback((slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const hasContentLayout = !!slide.contentLayout;

      const hasSections = slide.sections && slide.sections.length > 0;
      const hasTransformedContent = slide.transformedContent?.items && slide.transformedContent.items.length > 0;

      let newBulletPoints = [...(slide.bulletPoints || [])];
      let newSections = slide.sections ? [...slide.sections] : undefined;
      let newTransformedContent = slide.transformedContent ? { ...slide.transformedContent } : undefined;

      if (hasContentLayout) {
        if (hasSections) {
          newSections = [...slide.sections!, { heading: "New Point", description: "Add description here" }];
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        } else if (hasTransformedContent) {
          newTransformedContent = {
            ...slide.transformedContent!,
            items: [...slide.transformedContent!.items!, { label: "New Point", text: "Add description here" }],
          };
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        } else {
          const existingBullets = slide.bulletPoints || [];
          newSections = existingBullets.map((bullet) => {
            const colonIndex = bullet.indexOf(":");
            if (colonIndex > 0 && colonIndex < 50) {
              const label = bullet.substring(0, colonIndex).trim();
              const text = bullet.substring(colonIndex + 1).trim();
              if (label && text) {
                return { heading: label, description: text };
              }
            }
            return { heading: bullet, description: bullet };
          });
          newSections.push({ heading: "New Point", description: "Add description here" });
          newBulletPoints = [...newBulletPoints, "New Point: Add description here"];
        }
      } else {
        newBulletPoints = [...newBulletPoints, "New point"];
      }

      newSlides[slideIndex] = {
        ...slide,
        bulletPoints: newBulletPoints,
        sections: newSections,
        transformedContent: newTransformedContent,
      };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const deleteBulletPoint = useCallback((slideIndex: number, bulletIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const newBulletPoints = (slide.bulletPoints || []).filter((_, i) => i !== bulletIndex);

      const newSections = slide.sections ? slide.sections.filter((_, i) => i !== bulletIndex) : undefined;

      const newTransformedContent = slide.transformedContent?.items
        ? { ...slide.transformedContent, items: slide.transformedContent.items.filter((_, i) => i !== bulletIndex) }
        : undefined;

      const shouldClearLayout = newBulletPoints.length === 0 &&
        (!newSections || newSections.length === 0) &&
        (!newTransformedContent?.items || newTransformedContent.items.length === 0);

      newSlides[slideIndex] = {
        ...slide,
        bulletPoints: newBulletPoints,
        sections: newSections,
        transformedContent: newTransformedContent,
        contentLayout: shouldClearLayout ? undefined : slide.contentLayout,
      };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const deleteTitle = useCallback((slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = {
        ...slide,
        title: "",
      };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const deleteSubtitle = useCallback((slideIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = {
        ...slide,
        subtitle: "",
      };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const reorderContent = useCallback((slideIndex: number, fromIndex: number, toIndex: number) => {
    const slide = slidesData[slideIndex];
    if (!slide) return;

    const newSlides = [...slidesData];

    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      const newBulletPoints = [...slide.bulletPoints];
      const [removed] = newBulletPoints.splice(fromIndex, 1);
      if (removed !== undefined) {
        newBulletPoints.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = { ...slide, bulletPoints: newBulletPoints };
    }

    if (slide.sections && slide.sections.length > 0) {
      const newSections = [...slide.sections];
      const [removed] = newSections.splice(fromIndex, 1);
      if (removed !== undefined) {
        newSections.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = { ...newSlides[slideIndex]!, sections: newSections };
    }

    if (slide.transformedContent?.items && slide.transformedContent.items.length > 0) {
      const newItems = [...slide.transformedContent.items];
      const [removed] = newItems.splice(fromIndex, 1);
      if (removed !== undefined) {
        newItems.splice(toIndex, 0, removed);
      }
      newSlides[slideIndex] = {
        ...newSlides[slideIndex]!,
        transformedContent: { ...slide.transformedContent, items: newItems },
      };
    }

    updateSlidesWithSave(newSlides);
  }, [slidesData, updateSlidesWithSave]);

  const startEditing = useCallback((slideIndex: number, field: string, bulletIndex?: number) => {
    setEditingText({ slideIndex, field, bulletIndex });
  }, [setEditingText]);

  const getSlideImages = useCallback((slide: SlideData) => {
    const images = [...(slide.images || [])];
    if (slide.image?.url && !images.some(img => img.url === slide.image?.url)) {
      images.unshift(slide.image);
    }
    return images;
  }, []);

  const addSlideImage = useCallback((slideIndex: number, newImageUrl: string) => {
    const slide = slidesData[slideIndex];
    if (slide && newImageUrl) {
      const newSlides = [...slidesData];
      const currentImages = getSlideImages(slide);
      const newImage = { url: newImageUrl, alt: slide.title, source: "custom" };
      newSlides[slideIndex] = {
        ...slide,
        images: [...currentImages, newImage],
        image: currentImages.length === 0 ? newImage : slide.image,
      };
      updateSlidesWithSave(newSlides);
    }
    setShowImageModal(null);
    setImageUrl("");
  }, [slidesData, getSlideImages, updateSlidesWithSave, setShowImageModal, setImageUrl]);

  const updateSlideImage = useCallback((slideIndex: number, imageIndex: number, newImageUrl: string) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const currentImages = [...getSlideImages(slide)];
      if (newImageUrl) {
        currentImages[imageIndex] = { url: newImageUrl, alt: slide.title, source: "custom" };
      }
      newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
      updateSlidesWithSave(newSlides);
    }
    setShowImageModal(null);
    setImageUrl("");
    setEditingImageIndex(null);
  }, [slidesData, getSlideImages, updateSlidesWithSave, setShowImageModal, setImageUrl, setEditingImageIndex]);

  const removeSlideImage = useCallback((slideIndex: number, imageIndex?: number) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      const currentImages = getSlideImages(slide);
      if (imageIndex !== undefined) {
        currentImages.splice(imageIndex, 1);
      } else {
        currentImages.length = 0;
      }
      newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
      updateSlidesWithSave(newSlides);
    }
    setEditingImageIndex(null);
  }, [slidesData, getSlideImages, updateSlidesWithSave, setEditingImageIndex]);

  const reorderSlideImages = useCallback((slideIndex: number, fromIndex: number, toIndex: number) => {
    const slide = slidesData[slideIndex];
    if (slide && fromIndex !== toIndex) {
      const newSlides = [...slidesData];
      const currentImages = [...getSlideImages(slide)];
      const [movedImage] = currentImages.splice(fromIndex, 1);
      if (movedImage) {
        currentImages.splice(toIndex, 0, movedImage);
        newSlides[slideIndex] = { ...slide, images: currentImages, image: currentImages[0] || null };
        updateSlidesWithSave(newSlides);
      }
    }
    setEditingImageIndex(null);
  }, [slidesData, getSlideImages, updateSlidesWithSave, setEditingImageIndex]);

  const changeImageShape = useCallback((slideIndex: number, shape: ImageShape) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { ...slide, imageShape: shape };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const changeImagePosition = useCallback((slideIndex: number, position: SlideLayoutType) => {
    const slide = slidesData[slideIndex];
    if (slide) {
      const newSlides = [...slidesData];
      newSlides[slideIndex] = { ...slide, slideLayout: position };
      updateSlidesWithSave(newSlides);
    }
  }, [slidesData, updateSlidesWithSave]);

  const openImageModal = useCallback((slideIndex: number, imageIndex?: number) => {
    setShowImageModal(slideIndex);
    if (imageIndex !== undefined) {
      setEditingImageIndex(imageIndex);
    }
  }, [setShowImageModal, setEditingImageIndex]);

  return {
    updateSlideContent,
    changeSlideLayout,
    changeContentLayout,
    changeSlideAnimation,
    changeContentAnimation,
    duplicateSlide,
    addSlideAt,
    deleteSlide,
    moveSlide,
    addBulletPoint,
    deleteBulletPoint,
    deleteTitle,
    deleteSubtitle,
    reorderContent,
    startEditing,
    getSlideImages,
    addSlideImage,
    updateSlideImage,
    removeSlideImage,
    reorderSlideImages,
    changeImageShape,
    changeImagePosition,
    openImageModal,
  };
}
