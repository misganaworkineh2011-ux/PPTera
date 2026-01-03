"use client";

import { useState, useEffect, use, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import SlideRenderer from "~/components/presentation/SlideRenderer";
import { getThemeById, getDefaultTheme, type Theme } from "~/lib/themes";
import { convertCustomThemeToTheme } from "~/lib/custom-theme-utils";
import { type PresentationData } from "~/components/presentation/types";
import Link from "next/link";

interface EmbedPageProps {
    params: Promise<{ id: string }>;
}

// Extend the imported type if the API returns extra fields at the top level
// But usually it matches the DB/Type structure. 
// We'll trust the imported type mostly, but cast the fetch result.
interface PresentationResponse extends PresentationData {
    // API might return these flat or we handle them adapting to PresentationData
    // Let's assume the API returns a JSON that matches PresentationData structure
    // plus maybe some user-specific flags like showWatermark which we compute manually.
    showWatermark?: boolean;
    // content.theme is where the theme ID usually lives
}

// Main embed page wrapper with Suspense for useSearchParams
export default function EmbedPage({ params }: EmbedPageProps) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        }>
            <EmbedPageContent params={params} />
        </Suspense>
    );
}

function EmbedPageContent({ params }: EmbedPageProps) {
    const { id } = use(params);
    const searchParams = useSearchParams();
    
    // Export mode: hide all UI overlays for pixel-perfect screenshot capture
    const isExportMode = searchParams.get("export") === "true";
    const initialSlide = parseInt(searchParams.get("slide") || "0", 10);

    const [presentation, setPresentation] = useState<PresentationResponse | null>(null);
    const [currentSlide, setCurrentSlide] = useState(initialSlide);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(getDefaultTheme());
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch presentation
    useEffect(() => {
        async function fetchPresentation() {
            try {
                const res = await fetch(`/api/presentations/${id}`);
                if (!res.ok) throw new Error("Failed to load presentation");
                const data = await res.json();

                // Check user subscription for watermark
                let showWatermark = true;
                try {
                    const userRes = await fetch("/api/user/me");
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        showWatermark = !userData.subscriptionPlan ||
                            !["plus", "pro", "ultra"].includes(userData.subscriptionPlan);
                    }
                } catch {
                    // Ignore auth errors
                }

                const fullData = { ...data, showWatermark };
                setPresentation(fullData);

                // Resolve theme
                // Check content.theme or legacy themeId if it exists
                const themeId = data.content?.theme || data.themeId;
                const customThemeData = data.content?.themeConfig || data.theme; // Adjust based on actual API payload for custom themes

                if (themeId) {
                    if (themeId.startsWith("custom-")) {
                        // Attempt to use custom theme data if present
                        if (customThemeData) {
                            const customTheme = convertCustomThemeToTheme(customThemeData);
                            setTheme(customTheme);
                        } else {
                            // Fallback to default if custom data missing
                            setTheme(getDefaultTheme());
                        }
                    } else {
                        const staticTheme = getThemeById(themeId);
                        if (staticTheme) setTheme(staticTheme);
                    }
                }

            } catch (err: any) {
                console.error("EmbedPage Load Error:", err);
                setError(err.message || "Failed to load presentation");
            } finally {
                setLoading(false);
            }
        }
        fetchPresentation();
    }, [id]);

    // Scaling logic can be handled by CSS aspect-ratio on the container mostly, 
    // but SlideRenderer might need a wrapping div to ensure it doesn't overflow.
    // The current CSS `max-w-[177.78vh]` handles the aspect ratio constraint relative to height.

    const goNext = useCallback(() => {
        if (presentation && currentSlide < presentation.slides.length - 1) {
            setCurrentSlide((prev) => prev + 1);
        }
    }, [currentSlide, presentation]);

    const goPrev = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);
        }
    }, [currentSlide]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
                e.preventDefault();
                goNext();
            } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
                e.preventDefault();
                goPrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goNext, goPrev]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (error || !presentation) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-800">
                <p className="text-lg font-medium">{error || "Presentation not found"}</p>
            </div>
        );
    }

    const slide = presentation.slides[currentSlide];

    if (!slide) return null;

    return (
        <div className={cn(
            "relative w-full h-screen overflow-hidden group",
            isExportMode ? "bg-transparent" : "bg-black"
        )} ref={containerRef}>

            {/* Slide Container - maintains 16:9 aspect ratio centered */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div 
                    className={cn(
                        "relative w-full aspect-video max-h-screen max-w-[177.78vh] overflow-hidden",
                        isExportMode ? "" : "bg-white shadow-2xl"
                    )}
                    data-export-slide="true"
                >
                    <SlideRenderer
                        slide={slide}
                        index={currentSlide}
                        totalSlides={presentation.slides.length}
                        theme={theme}
                        isOwner={false} // Read-only
                        isFullscreen={true} // Removes edit controls
                        isHovered={false}
                        isEditing={false}
                        editingText={null}
                        onStartEditing={() => { }}
                        onUpdateContent={() => { }}
                        onFinishEditing={() => { }}
                        onAddBullet={() => { }}
                        onDeleteBullet={() => { }}
                    />
                </div>
            </div>

            {/* Navigation Overlay (Hidden in export mode) */}
            {!isExportMode && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={goPrev}
                        disabled={currentSlide === 0}
                        className="pointer-events-auto p-3 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition disabled:opacity-0"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={goNext}
                        disabled={currentSlide === presentation.slides.length - 1}
                        className="pointer-events-auto p-3 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition disabled:opacity-0"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* Bottom Bar (Hidden in export mode) */}
            {!isExportMode && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <div className="text-white text-sm font-medium drop-shadow-md">
                            {currentSlide + 1} / {presentation.slides.length}
                        </div>

                        {/* Simple progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                                className="h-full bg-[#06b6d4] transition-all duration-300"
                                style={{ width: `${((currentSlide + 1) / presentation.slides.length) * 100}%` }}
                            />
                        </div>

                        {/* Branding/Watermark */}
                        <Link
                            href="/"
                            target="_blank"
                            className="text-white/80 text-xs hover:text-white font-medium drop-shadow-md"
                        >
                            PPTMaster
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}
