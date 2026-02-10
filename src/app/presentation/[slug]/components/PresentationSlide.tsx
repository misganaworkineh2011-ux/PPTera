import { type CSSProperties, type Dispatch, type SetStateAction } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { type Theme } from "~/lib/themes";
import { type SlideLayoutType, type ImageShape } from "~/lib/layouts/slide";
import { type SlideData, type EditingState } from "~/components/presentation/types";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import { type ContentLayoutId } from "~/components/presentation/ContentLayoutPanel";
import { stripHtml, getTitleSlideColors } from "../utils";
import { SlideMenu } from "./SlideMenu";
import { SlideNoteButton } from "./SlideNoteButton";
import { TitleSlide } from "./TitleSlide";
import { getThemeType, type ThemeType } from "./types";
import { getUIColors } from "./ui-colors";
import { type StreamingStatus } from "../hooks/usePresentationStreaming";

interface PresentationSlideProps {
  slide: SlideData;
  index: number;
  isMain?: boolean;
  spotlightIndex?: number;
  theme: Theme;
  slidesLength: number;
  slidesData: SlideData[];
  canEdit: boolean;
  isFullscreen: boolean;
  isPublicView: boolean;
  isPresenting: boolean;
  showPageNumbers: boolean;
  showContentLayoutPanel: boolean;
  streamingStatus: StreamingStatus;
  streamingSlideIndex: number | null;
  activeSlideIndex: number | null;
  editingText: EditingState | null;
  aiEditingSlideIndex: number | null;
  imagesLoading: Set<number>;
  imageLoadedStates: Record<number, boolean>;
  setImageLoadedStates: Dispatch<SetStateAction<Record<number, boolean>>>;
  setActiveSlideIndex: (index: number | null) => void;
  setShowContentLayoutPanel: (value: boolean) => void;
  setShowImageModal: (index: number | null) => void;
  setEditingImageIndex: (index: number | null) => void;
  setImageUrl: (value: string) => void;
  setShowChartModal: (index: number | null) => void;
  setShowAnimationPicker: (index: number | null) => void;
  setAiEditingSlideIndex: (index: number | null) => void;
  setEditingText: (value: EditingState | null) => void;
  updateSlidesWithSave: (newSlides: SlideData[]) => void;
  getSlideImages: (slide: SlideData) => Array<NonNullable<SlideData["images"]>[number]>;
  changeContentLayout: (slideIndex: number, layoutId: ContentLayoutId) => void;
  updateSlideContent: (slideIndex: number, field: string, value: string, bulletIndex?: number) => void;
  startEditing: (slideIndex: number, field: string, bulletIndex?: number) => void;
  addBulletPoint: (slideIndex: number) => void;
  deleteBulletPoint: (slideIndex: number, bulletIndex: number) => void;
  deleteTitle: (slideIndex: number) => void;
  deleteSubtitle: (slideIndex: number) => void;
  reorderContent: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  openImageModal: (slideIndex: number, imageIndex?: number) => void;
  removeSlideImage: (slideIndex: number, imageIndex?: number) => void;
  changeImageShape: (slideIndex: number, shape: ImageShape) => void;
  changeImagePosition: (slideIndex: number, position: SlideLayoutType) => void;
  reorderSlideImages: (slideIndex: number, fromIndex: number, toIndex: number) => void;
  duplicateSlide: (index: number) => void;
  addSlideAt: (index: number) => void;
  moveSlide: (index: number, direction: "up" | "down") => void;
  deleteSlide: (index: number) => void;
  subscriptionPlan?: string | null;
  onUpgrade?: () => void;
}

export function PresentationSlide({
  slide,
  index,
  isMain = false,
  spotlightIndex,
  theme,
  slidesLength,
  slidesData,
  canEdit,
  isFullscreen,
  isPublicView,
  isPresenting,
  showPageNumbers,
  showContentLayoutPanel,
  streamingStatus,
  streamingSlideIndex,
  activeSlideIndex,
  editingText,
  aiEditingSlideIndex,
  imagesLoading,
  imageLoadedStates,
  setImageLoadedStates,
  setActiveSlideIndex,
  setShowContentLayoutPanel,
  setShowImageModal,
  setEditingImageIndex,
  setImageUrl,
  setShowChartModal,
  setShowAnimationPicker,
  setAiEditingSlideIndex,
  setEditingText,
  updateSlidesWithSave,
  getSlideImages,
  changeContentLayout,
  updateSlideContent,
  startEditing,
  addBulletPoint,
  deleteBulletPoint,
  deleteTitle,
  deleteSubtitle,
  reorderContent,
  openImageModal,
  removeSlideImage,
  changeImageShape,
  changeImagePosition,
  reorderSlideImages,
  duplicateSlide,
  addSlideAt,
  moveSlide,
  deleteSlide,
  subscriptionPlan,
  onUpgrade,
}: PresentationSlideProps) {
  const hasImage = slide.image?.url && slide.image.source !== "placeholder";
  const isImageLoading = imagesLoading.has(index);
  const isImageLoaded = imageLoadedStates[index];
  const isTitle = slide.type === "title";
  const isHovered = activeSlideIndex === index || editingText?.slideIndex === index;
  const isEditing = editingText?.slideIndex === index;
  const isCurrentlyStreaming = streamingStatus === "streaming" && streamingSlideIndex === index;

  const getThemeBackground = () => {
    if (theme.backgroundImage) {
      return {
        backgroundImage: `url(${theme.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return { background: theme.slideStyles.title.background };
  };

  let backgroundStyle: CSSProperties = {};
  if (isTitle && hasImage) {
    backgroundStyle = { backgroundImage: `url(${slide.image!.url})`, backgroundSize: "cover", backgroundPosition: "center" };
  } else if (isTitle) {
    backgroundStyle = getThemeBackground();
  }

  if (!isMain) {
    const themeType = getThemeType(theme);
    const ui = getUIColors(themeType);
    const bgColors: Record<ThemeType, string> = {
      dark: "#0a0a0b",
      light: "#f8fafc",
      sunset: "#1c1017",
      ocean: "#0a1628",
      aurora: "#0f0a1a",
      ember: "#1a0a0a",
      midnight: "#0c0a1d",
      cyber: "#0a0a0f",
      alien: "#0a0f0a",
      corporate: "#ffffff",
      cosmic: "#0a0612",
      architectural: "#0a0a0a",
      anime: "#1a1625",
      hacker: "#0d0d0d",
      "custom-dark": "#0a0a0a",
      "custom-light": "#ffffff",
    };
    const thumbnailBgColor = theme.pageBackground ? theme.colors.background : bgColors[themeType];
    const thumbnailBg: CSSProperties = isTitle ? backgroundStyle : { background: thumbnailBgColor };

    return (
      <div className="w-full h-full relative overflow-hidden" style={thumbnailBg}>
        {isTitle && hasImage && slide.image?.url && (
          <>
            <img
              src={slide.image.url}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoadedStates(prev => ({ ...prev, [index]: true }))}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse" />
            )}
            <div className={`absolute inset-0 ${themeType === "light" ? "bg-gradient-to-t from-white/70 via-white/30 to-transparent" : "bg-gradient-to-t from-black/70 via-black/30 to-transparent"}`} />
          </>
        )}
        {isTitle && isImageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute inset-0 transform scale-[0.18] origin-top-left" style={{ width: "555%", height: "555%" }}>
          {isTitle && !slide.slideLayout ? (
            <div className={`h-full flex flex-col items-center justify-center p-12 text-center ${hasImage ? "" : ui.titleBg}`}>
              {!hasImage && <div className={`absolute top-0 right-0 w-96 h-96 ${ui.orb1} rounded-full blur-3xl`} />}
              <h1 className="text-5xl font-bold mb-4 relative" style={{ fontFamily: theme.fonts.heading.family, color: getTitleSlideColors(themeType, !!hasImage).title }}>
                {stripHtml(slide.title) || (isCurrentlyStreaming ? "..." : "")}
              </h1>
              {slide.subtitle && (
                <p className="text-2xl opacity-80 relative" style={{ fontFamily: theme.fonts.body.family, color: getTitleSlideColors(themeType, !!hasImage).subtitle }}>
                  {stripHtml(slide.subtitle)}
                </p>
              )}
            </div>
          ) : (
            <SlideRenderer
              slide={slide}
              index={index}
              totalSlides={slidesLength}
              theme={theme}
              isOwner={false}
              isFullscreen={false}
              isHovered={false}
              isEditing={false}
              editingText={null}
              showPageNumber={showPageNumbers}
              onStartEditing={() => {}}
              onUpdateContent={() => {}}
              onFinishEditing={() => {}}
              onAddBullet={() => {}}
              onDeleteBullet={() => {}}
              onChangeContentLayout={changeContentLayout}
            />
          )}
        </div>
        {isCurrentlyStreaming && (
          <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-all duration-500 group slide-content-container"
      style={!hasImage ? backgroundStyle : undefined}
      onMouseEnter={() => {
        if (canEdit && !isFullscreen && !isPublicView && !isPresenting && !editingText) {
          setActiveSlideIndex(index);
        }
      }}
      onMouseLeave={(event) => {
        const relatedTarget = event.relatedTarget;
        const isElement = relatedTarget instanceof Element;
        const isMovingToToolbar = isElement && (
          relatedTarget.closest('[data-toolbar]') ||
          relatedTarget.closest('.text-toolbar') ||
          relatedTarget.closest('[role="toolbar"]') ||
          relatedTarget.closest('[contenteditable="true"]'));

        const selection = window.getSelection();
        const hasActiveSelection = selection && !selection.isCollapsed && selection.toString().trim().length > 0;
        const isAnyTextEditing = editingText !== null;

        if (!isAnyTextEditing && !showContentLayoutPanel && !hasActiveSelection && !isMovingToToolbar) {
          setActiveSlideIndex(null);
        }
      }}
    >
      {isTitle && !slide.slideLayout && hasImage && slide.image?.url && (
        <>
          <img
            src={slide.image.url}
            alt={slide.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoadedStates(prev => ({ ...prev, [index]: true }))}
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 animate-pulse" />
          )}
        </>
      )}
      {isTitle && !slide.slideLayout && isImageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-zinc-400">Loading image...</span>
          </div>
        </div>
      )}
      {theme.overlay && !hasImage && <div className="absolute inset-0" style={{ background: theme.overlay }} />}

      {aiEditingSlideIndex === index && (
        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="relative">
              <Sparkles size={32} className="animate-pulse text-purple-400" />
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                <div className="w-full h-full rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-400" />
              </div>
            </div>
            <p className="text-sm font-medium">AI is editing this slide...</p>
          </div>
        </div>
      )}

      {canEdit && !isFullscreen && !isPublicView && !isPresenting && (isHovered || aiEditingSlideIndex === index) && (
        <SlideMenu
          index={index}
          totalSlides={slidesLength}
          imageCount={getSlideImages(slide).length}
          theme={theme}
          currentAnimation={slide.animation}
          slideContent={{
            type: slide.type,
            title: slide.title,
            subtitle: slide.subtitle,
            bullets: slide.bulletPoints,
            sections: slide.sections,
            introText: slide.introText,
            tagline: slide.tagline,
            layout: slide.layout,
            image: slide.image,
            images: slide.images,
          }}
          onChangeContentLayout={() => { setActiveSlideIndex(index); setShowContentLayoutPanel(true); }}
          onDuplicate={() => duplicateSlide(index)}
          onAddSlide={() => addSlideAt(index)}
          onAddImage={() => { setShowImageModal(index); setEditingImageIndex(null); setImageUrl(""); }}
          onAddChart={() => setShowChartModal(index)}
          onRemoveChart={() => {
            const newSlides = slidesData.map((slideItem, slideIndex) => {
              if (slideIndex === index) {
                return { ...slideItem, chart: null };
              }
              return slideItem;
            });
            updateSlidesWithSave(newSlides);
            toast.success("Chart removed from slide");
          }}
          hasChart={!!slide.chart}
          onMoveUp={() => moveSlide(index, "up")}
          onMoveDown={() => moveSlide(index, "down")}
          onDelete={() => deleteSlide(index)}
          onOpenAnimationPicker={() => setShowAnimationPicker(index)}
          onAIEditingChange={(isEditing) => {
            setAiEditingSlideIndex(isEditing ? index : null);
          }}
          subscriptionPlan={subscriptionPlan}
          onUpgrade={onUpgrade}
          onAIEdit={(editedSlide) => {
            const newSlides = [...slidesData];
            const existingSlide = newSlides[index];
            if (!existingSlide) return;

            const updatedSlide: SlideData = {
              ...existingSlide,
              title: editedSlide.title || existingSlide.title,
              subtitle: editedSlide.subtitle !== undefined ? editedSlide.subtitle : existingSlide.subtitle,
              tagline: editedSlide.tagline !== undefined ? editedSlide.tagline : existingSlide.tagline,
              introText: editedSlide.introText !== undefined ? editedSlide.introText : existingSlide.introText,
              bulletPoints: editedSlide.bullets && editedSlide.bullets.length > 0
                ? editedSlide.bullets
                : existingSlide.bulletPoints,
              sections: editedSlide.sections !== undefined ? editedSlide.sections : existingSlide.sections,
              layout: editedSlide.layout || existingSlide.layout,
              image: editedSlide.image !== undefined ? editedSlide.image : existingSlide.image,
              images: editedSlide.images !== undefined ? editedSlide.images : existingSlide.images,
            };

            newSlides[index] = updatedSlide;
            updateSlidesWithSave(newSlides);
            toast.success("Slide updated with AI");
          }}
        />
      )}

      {canEdit && !isFullscreen && !isPublicView && !isPresenting && (isHovered || aiEditingSlideIndex === index) && (
        <div className="absolute top-3 left-3 z-30">
          <SlideNoteButton
            slideIndex={index}
            speakerNotes={slide.speakerNotes}
            theme={theme}
            onAddNote={(note) => {
              const newSlides = [...slidesData];
              const existingSlide = newSlides[index];
              if (!existingSlide) return;
              const currentNotes = existingSlide.speakerNotes || [];
              newSlides[index] = { ...existingSlide, speakerNotes: [...currentNotes, note] };
              updateSlidesWithSave(newSlides);
              toast.success("Note added");
            }}
            onEditNote={(noteIndex, note) => {
              const newSlides = [...slidesData];
              const existingSlide = newSlides[index];
              if (!existingSlide) return;
              const currentNotes = [...(existingSlide.speakerNotes || [])];
              currentNotes[noteIndex] = note;
              newSlides[index] = { ...existingSlide, speakerNotes: currentNotes };
              updateSlidesWithSave(newSlides);
              toast.success("Note updated");
            }}
            onDeleteNote={(noteIndex) => {
              const newSlides = [...slidesData];
              const existingSlide = newSlides[index];
              if (!existingSlide) return;
              const currentNotes = [...(existingSlide.speakerNotes || [])];
              currentNotes.splice(noteIndex, 1);
              newSlides[index] = { ...existingSlide, speakerNotes: currentNotes };
              updateSlidesWithSave(newSlides);
              toast.success("Note deleted");
            }}
          />
        </div>
      )}

      {isTitle && !slide.slideLayout ? (
        <TitleSlide
          slide={slide}
          index={index}
          totalSlides={slidesLength}
          theme={theme}
          hasImage={!!hasImage}
          isOwner={canEdit && !isPresenting}
          isFullscreen={isFullscreen || isPublicView || isPresenting}
          isHovered={isHovered ?? false}
          isEditing={isEditing ?? false}
          editingText={editingText}
          showPageNumber={showPageNumbers}
          onStartEditing={startEditing}
          onUpdateContent={updateSlideContent}
          onFinishEditing={() => setEditingText(null)}
        />
      ) : (
        <SlideRenderer
          slide={slide}
          index={index}
          totalSlides={slidesLength}
          theme={theme}
          isOwner={canEdit && !isPresenting}
          isFullscreen={isFullscreen || isPublicView || isPresenting}
          isHovered={isHovered ?? false}
          isEditing={isEditing ?? false}
          editingText={editingText}
          showPageNumber={showPageNumbers}
          isPresenting={isPresenting}
          spotlightIndex={spotlightIndex}
          onStartEditing={startEditing}
          onUpdateContent={updateSlideContent}
          onFinishEditing={() => setEditingText(null)}
          onAddBullet={addBulletPoint}
          onDeleteBullet={deleteBulletPoint}
          onDeleteTitle={deleteTitle}
          onDeleteSubtitle={deleteSubtitle}
          onReorderContent={reorderContent}
          onChangeContentLayout={changeContentLayout}
          onOpenContentLayoutPanel={() => { setActiveSlideIndex(index); setShowContentLayoutPanel(true); }}
          onOpenImageModal={openImageModal}
          onRemoveImage={removeSlideImage}
          onChangeImageShape={changeImageShape}
          onChangeImagePosition={changeImagePosition}
          onReorderImages={reorderSlideImages}
        />
      )}
    </div>
  );
}
