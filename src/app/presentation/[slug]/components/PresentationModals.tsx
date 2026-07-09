"use client";

import { toast } from "sonner";
import type { Theme } from "~/lib/themes";
import { ImageEditor, type ImageBlock } from "~/lib/blocks";
import type { ChartData } from "~/lib/charts/types";
import type { SlideData, SlideImage } from "~/components/presentation/types";
import { RateUsModal } from "~/components/RateUsModal";
import ExportModal from "~/components/presentation/ExportModal";
import ShareModal from "~/components/presentation/ShareModal";
import ChartModal from "~/components/charts/ChartModal";
import EmbedModal from "~/components/presentation/EmbedModal";
import AnimationPicker from "~/components/presentation/AnimationPicker";
import { MultiImageModal } from "./MultiImageModal";
import type { ExportFormat, ExportOptions } from "../utils";

interface PresentationModalsProps {
  slidesData: SlideData[];
  theme: Theme;
  presentationId: string;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  subscriptionPlan?: string | null;
  currentSlide: number;
  isOwner: boolean;
  showImageModal: number | null;
  imageUrl: string;
  editingImageIndex: number | null;
  isLoadingImage: boolean;
  showExportModal: boolean;
  showShareModal: boolean;
  showRateModal: boolean;
  showChartModal: number | null;
  showEmbedModal: number | null;
  showAnimationPicker: number | null;
  showImageEditor: { slideIndex: number; imageIndex: number } | null;
  getSlideImages: (slide: SlideData) => SlideImage[];
  addSlideImage: (slideIndex: number, url: string) => void;
  updateSlideImage: (slideIndex: number, imageIndex: number, url: string) => void;
  removeSlideImage: (slideIndex: number, imageIndex: number) => void;
  reorderSlideImages: (slideIndex: number, from: number, to: number) => void;
  updateSlidesWithSave: (slides: SlideData[]) => void;
  changeSlideAnimation: (slideIndex: number, animationId: string) => void;
  changeContentAnimation: (slideIndex: number, enabled: boolean) => void;
  changeAllSlidesAnimation: (animationId: string) => void;
  changeAllSlidesContentAnimation: (enabled: boolean) => void;
  changeItemAnimation: (slideIndex: number, animationId: string, applyToAllSlides?: boolean) => void;
  changeItemBuild: (slideIndex: number, enabled: boolean) => void;
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  onSetShowImageModal: (value: number | null) => void;
  onSetImageUrl: (value: string) => void;
  onSetEditingImageIndex: (value: number | null) => void;
  onSetShowExportModal: (value: boolean) => void;
  onSetShowShareModal: (value: boolean) => void;
  onSetShowRateModal: (value: boolean) => void;
  onSetShowChartModal: (value: number | null) => void;
  onSetShowEmbedModal: (value: number | null) => void;
  onSetShowAnimationPicker: (value: number | null) => void;
  onSetShowImageEditor: (value: { slideIndex: number; imageIndex: number } | null) => void;
  onSetShowImageModalAndEditor: (slideIndex: number, imageIndex: number) => void;
  onUpgrade: () => void;
  isExporting: boolean;
}

export function PresentationModals({
  slidesData,
  theme,
  presentationId,
  initialIsPublic,
  initialShareToken,
  subscriptionPlan,
  currentSlide,
  isOwner,
  showImageModal,
  imageUrl,
  editingImageIndex,
  isLoadingImage,
  showExportModal,
  showShareModal,
  showRateModal,
  showChartModal,
  showEmbedModal,
  showAnimationPicker,
  showImageEditor,
  getSlideImages,
  addSlideImage,
  updateSlideImage,
  removeSlideImage,
  reorderSlideImages,
  updateSlidesWithSave,
  changeSlideAnimation,
  changeContentAnimation,
  changeAllSlidesAnimation,
  changeAllSlidesContentAnimation,
  changeItemAnimation,
  changeItemBuild,
  onExport,
  onSetShowImageModal,
  onSetImageUrl,
  onSetEditingImageIndex,
  onSetShowExportModal,
  onSetShowShareModal,
  onSetShowRateModal,
  onSetShowChartModal,
  onSetShowEmbedModal,
  onSetShowAnimationPicker,
  onSetShowImageEditor,
  onSetShowImageModalAndEditor,
  onUpgrade,
  isExporting,
}: PresentationModalsProps) {
  return (
    <>
      {showImageModal !== null && (
        <MultiImageModal
          images={getSlideImages(slidesData[showImageModal]!)}
          imageUrl={imageUrl}
          editingIndex={editingImageIndex}
          isLoading={isLoadingImage}
          theme={theme}
          presentationId={presentationId}
          subscriptionPlan={subscriptionPlan}
          onUrlChange={onSetImageUrl}
          onAddImage={() => addSlideImage(showImageModal, imageUrl)}
          onUpdateImage={(idx) => updateSlideImage(showImageModal, idx, imageUrl)}
          onRemoveImage={(idx) => removeSlideImage(showImageModal, idx)}
          onReorderImages={(from, to) => reorderSlideImages(showImageModal, from, to)}
          onEditImage={(idx) => {
            onSetEditingImageIndex(idx);
            onSetImageUrl(getSlideImages(slidesData[showImageModal]!)[idx]?.url || "");
          }}
          onCancelEdit={() => {
            onSetEditingImageIndex(null);
            onSetImageUrl("");
          }}
          onClose={() => {
            onSetShowImageModal(null);
            onSetImageUrl("");
            onSetEditingImageIndex(null);
          }}
          onOpenWysiwygEditor={(idx) => {
            onSetShowImageModal(null);
            onSetShowImageModalAndEditor(showImageModal, idx);
          }}
          onAddGeneratedImage={(url) => {
            addSlideImage(showImageModal, url);
          }}
        />
      )}

      {showExportModal && isOwner && (
        <ExportModal
          isExporting={isExporting}
          theme={theme}
          totalSlides={slidesData.length}
          currentSlide={currentSlide + 1}
          subscriptionPlan={subscriptionPlan}
          onExport={onExport}
          onClose={() => onSetShowExportModal(false)}
        />
      )}

      {showShareModal && isOwner && (
        <ShareModal
          presentationId={presentationId}
          initialIsPublic={initialIsPublic}
          initialShareToken={initialShareToken}
          onClose={() => onSetShowShareModal(false)}
          theme={theme}
          subscriptionPlan={subscriptionPlan}
        />
      )}

      {showRateModal && (
        <RateUsModal onClose={() => onSetShowRateModal(false)} theme={theme} />
      )}

      {showChartModal !== null && (
        <ChartModal
          isOpen={true}
          theme={theme}
          existingChart={slidesData[showChartModal]?.chart as ChartData | null}
          onClose={() => onSetShowChartModal(null)}
          onInsert={(chart: ChartData) => {
            const slideIndex = showChartModal;
            const newSlides = slidesData.map((slide, idx) => {
              if (idx === slideIndex) {
                return { ...slide, chart };
              }
              return slide;
            });
            updateSlidesWithSave(newSlides);
            toast.success(slidesData[slideIndex]?.chart ? "Chart updated" : "Chart added to slide");
            onSetShowChartModal(null);
          }}
        />
      )}

      {showEmbedModal !== null && (
        <EmbedModal
          isOpen={true}
          theme={theme}
          existingEmbed={slidesData[showEmbedModal]?.embed ?? null}
          onClose={() => onSetShowEmbedModal(null)}
          onInsert={(embed) => {
            const slideIndex = showEmbedModal;
            const existed = !!slidesData[slideIndex]?.embed;
            const newSlides = slidesData.map((slide, idx) =>
              idx === slideIndex ? { ...slide, embed } : slide,
            );
            updateSlidesWithSave(newSlides);
            toast.success(existed ? "Embed updated" : "Embed added to slide");
            onSetShowEmbedModal(null);
          }}
          onRemove={() => {
            const slideIndex = showEmbedModal;
            const newSlides = slidesData.map((slide, idx) =>
              idx === slideIndex ? { ...slide, embed: null } : slide,
            );
            updateSlidesWithSave(newSlides);
            toast.success("Embed removed");
            onSetShowEmbedModal(null);
          }}
        />
      )}

      {showAnimationPicker !== null && (() => {
        // -1 is the sentinel for the deck-wide "Transitions" picker (applies to
        // every slide); any other index edits that single slide.
        const isDeckWide = showAnimationPicker === -1;
        const refIndex = isDeckWide ? 0 : showAnimationPicker;
        return (
          <AnimationPicker
            isOpen={true}
            theme={theme}
            applyToAll={isDeckWide}
            slideCount={slidesData.length}
            currentSlideNumber={currentSlide + 1}
            currentAnimation={slidesData[refIndex]?.animation || "fade"}
            contentAnimation={slidesData[refIndex]?.contentAnimation !== false}
            itemAnimation={slidesData[refIndex]?.itemAnimation || "fade-up"}
            itemBuild={slidesData[refIndex]?.itemBuild === true}
            isPaidUser={!!subscriptionPlan && ["plus", "pro", "ultra"].includes(subscriptionPlan.toLowerCase())}
            subscriptionPlan={subscriptionPlan}
            onClose={() => onSetShowAnimationPicker(null)}
            onSelect={(animationId: string, applyToAllSlides?: boolean) => {
              if (isDeckWide) {
                if (applyToAllSlides) {
                  changeAllSlidesAnimation(animationId);
                  toast.success("Transition applied to all slides");
                } else {
                  changeSlideAnimation(currentSlide, animationId);
                  toast.success(`Transition applied to slide ${currentSlide + 1}`);
                }
              } else {
                changeSlideAnimation(showAnimationPicker, animationId);
                toast.success("Animation updated");
              }
              onSetShowAnimationPicker(null);
            }}
            onContentAnimationChange={(enabled: boolean) => {
              if (isDeckWide) {
                changeAllSlidesContentAnimation(enabled);
              } else {
                changeContentAnimation(showAnimationPicker, enabled);
              }
              toast.success(enabled ? "Content animation enabled" : "Content animation disabled");
            }}
            onItemAnimationChange={(animationId: string, applyToAllSlides?: boolean) => {
              const targetIndex = isDeckWide ? currentSlide : showAnimationPicker;
              changeItemAnimation(targetIndex, animationId, applyToAllSlides || isDeckWide);
              toast.success(
                applyToAllSlides || isDeckWide
                  ? "Item animation applied to all slides"
                  : "Item animation updated"
              );
            }}
            onItemBuildChange={(enabled: boolean) => {
              changeItemBuild(isDeckWide ? currentSlide : showAnimationPicker, enabled);
              toast.success(enabled ? "Items will reveal one by one on Next" : "Items appear together again");
            }}
            onUpgrade={() => {
              onUpgrade();
            }}
          />
        );
      })()}

      {showImageEditor && (() => {
        const slide = slidesData[showImageEditor.slideIndex];
        const images = getSlideImages(slide!);
        const image = images[showImageEditor.imageIndex];
        if (!image) return null;

        const imageBlock: ImageBlock = {
          id: `img-${showImageEditor.slideIndex}-${showImageEditor.imageIndex}`,
          type: "image",
          url: image.url,
          alt: image.alt || slide?.title || "Image",
          filter: image.filter,
          crop: image.crop,
          objectFit: image.objectFit,
        };

        return (
          <ImageEditor
            block={imageBlock}
            theme={theme}
            onSave={(updatedBlock) => {
              const newSlides = [...slidesData];
              const slideToUpdate = newSlides[showImageEditor.slideIndex];
              if (slideToUpdate) {
                const updatedImage = {
                  url: updatedBlock.url,
                  alt: updatedBlock.alt,
                  source: "edited" as const,
                  filter: updatedBlock.filter,
                  crop: updatedBlock.crop,
                  objectFit: updatedBlock.objectFit,
                  photographer: image.photographer,
                  photographerUrl: image.photographerUrl,
                };

                const allImages = getSlideImages(slideToUpdate);
                const isPrimaryImage = showImageEditor.imageIndex === 0 &&
                  slideToUpdate.image?.url === image.url;

                if (isPrimaryImage) {
                  newSlides[showImageEditor.slideIndex] = {
                    ...slideToUpdate,
                    image: updatedImage,
                    images: slideToUpdate.images?.map((img) =>
                      img.url === image.url ? updatedImage : img
                    ),
                  };
                } else {
                  const updatedImages = [...(slideToUpdate.images || [])];
                  const imagesArrayIndex = slideToUpdate.image?.url === allImages[0]?.url
                    ? showImageEditor.imageIndex - 1
                    : showImageEditor.imageIndex;

                  if (imagesArrayIndex >= 0 && imagesArrayIndex < updatedImages.length) {
                    updatedImages[imagesArrayIndex] = updatedImage;
                  }

                  newSlides[showImageEditor.slideIndex] = {
                    ...slideToUpdate,
                    images: updatedImages,
                  };
                }

                updateSlidesWithSave(newSlides);
              }
              onSetShowImageEditor(null);
              toast.success("Image updated!");
            }}
            onCancel={() => onSetShowImageEditor(null)}
          />
        );
      })()}
    </>
  );
}
