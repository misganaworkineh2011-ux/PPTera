"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MoreVertical,
  Palette,
  Sparkles,
  Copy,
  MoveUp,
  MoveDown,
  Trash2,
  PlusCircle,
  ImagePlus,
  BarChart3,
  LayoutGrid,
  Link2,
  ChevronDown,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface SlideMenuProps {
  index: number;
  totalSlides: number;
  imageCount: number;
  hasChart?: boolean;
  onChangeLayout: () => void;
  onDuplicate: () => void;
  onAddSlide: () => void;
  onAddImage: () => void;
  onAddChart: () => void;
  onRemoveChart?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

type ActivePanel = "none" | "more" | "styling" | "ai";

// ============================================================================
// PANEL COMPONENTS
// ============================================================================

interface MorePanelProps {
  index: number;
  totalSlides: number;
  onDuplicate: () => void;
  onAddSlide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}

function MorePanel({
  index,
  totalSlides,
  onDuplicate,
  onAddSlide,
  onMoveUp,
  onMoveDown,
  onDelete,
  onCopyLink,
  onClose,
}: MorePanelProps) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-full shadow-xl border border-slate-200">
      <ActionButton
        icon={<Copy size={16} />}
        title="Duplicate"
        onClick={() => {
          onDuplicate();
          onClose();
        }}
      />
      <ActionButton
        icon={<MoveUp size={16} />}
        title="Move Up"
        onClick={onMoveUp}
        disabled={index === 0}
      />
      <ActionButton
        icon={<Link2 size={16} />}
        title="Copy Link"
        onClick={() => {
          onCopyLink();
          onClose();
        }}
      />
      <ActionButton
        icon={<PlusCircle size={16} />}
        title="Add Slide"
        onClick={() => {
          onAddSlide();
          onClose();
        }}
      />
      <ActionButton
        icon={<MoveDown size={16} />}
        title="Move Down"
        onClick={onMoveDown}
        disabled={index === totalSlides - 1}
      />
      <ActionButton
        icon={<Trash2 size={16} />}
        title="Delete"
        onClick={() => {
          onDelete();
          onClose();
        }}
        disabled={totalSlides <= 1}
        danger
      />
    </div>
  );
}

interface StylingPanelProps {
  imageCount: number;
  hasChart?: boolean;
  onChangeLayout: () => void;
  onAddImage: () => void;
  onAddChart: () => void;
  onRemoveChart?: () => void;
  onClose: () => void;
}

function StylingPanel({
  imageCount,
  hasChart,
  onChangeLayout,
  onAddImage,
  onAddChart,
  onRemoveChart,
  onClose,
}: StylingPanelProps) {
  const handleAction = (action: () => void) => () => {
    action();
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[240px]">
      <div className="space-y-1">
        <OptionRow
          icon={<LayoutGrid size={16} />}
          label="Change Layout"
          onClick={handleAction(onChangeLayout)}
          action="Select"
        />
        <OptionRow
          icon={<ImagePlus size={16} />}
          label={imageCount > 0 ? `Images (${imageCount})` : "Add Image"}
          onClick={handleAction(onAddImage)}
          action={imageCount > 0 ? "Manage" : "+ Add"}
          highlight={imageCount === 0}
        />
        <OptionRow
          icon={<BarChart3 size={16} />}
          label={hasChart ? "Edit Chart" : "Add Chart"}
          onClick={handleAction(onAddChart)}
          action={hasChart ? "Edit" : "+ Add"}
          highlight={!hasChart}
        />
        {hasChart && onRemoveChart && (
          <OptionRow
            icon={<BarChart3 size={16} className="opacity-50" />}
            label="Remove Chart"
            onClick={handleAction(onRemoveChart)}
            action="Remove"
            danger
          />
        )}
      </div>
    </div>
  );
}

function AIPanel({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[280px]">
      <p className="text-xs font-medium text-slate-500 mb-2">Edit with AI</p>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="How would you like to edit this slide?"
          className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400"
          rows={2}
        />
        <button 
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
          onClick={onClose}
        >
          <Sparkles size={12} className="text-white" />
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">AI features coming soon</p>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ActionButton({
  icon,
  title,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-full transition-colors ${
        disabled
          ? "opacity-40 cursor-not-allowed text-slate-400"
          : danger
            ? "text-red-500 hover:bg-red-50"
            : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
    </button>
  );
}

function OptionRow({
  icon,
  label,
  onClick,
  action,
  highlight,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  action?: React.ReactNode;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
        danger ? "hover:bg-red-50 text-red-500" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {typeof action === "string" ? (
        <span
          className={`text-xs font-medium ${
            highlight ? "text-blue-500" : danger ? "text-red-400" : "text-slate-400"
          }`}
        >
          {action}
        </span>
      ) : (
        action
      )}
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SlideMenu({
  index,
  totalSlides,
  imageCount,
  hasChart,
  onChangeLayout,
  onDuplicate,
  onAddSlide,
  onAddImage,
  onAddChart,
  onRemoveChart,
  onMoveUp,
  onMoveDown,
  onDelete,
}: SlideMenuProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Setup portal
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-slide-toolbar]") && !target.closest("[data-slide-panel]")) {
        setActivePanel("none");
      }
    };
    if (activePanel !== "none") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activePanel]);

  // Calculate panel position
  const openPanel = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setActivePanel("none");
      return;
    }

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.right,
      });
    }
    setActivePanel(panel);
  };

  const handleCopyLink = () => {
    const url = `${window.location.href}#slide-${index + 1}`;
    navigator.clipboard.writeText(url);
  };

  const closePanel = () => setActivePanel("none");

  // Render panel via portal
  const renderPanel = () => {
    if (activePanel === "none" || !portalContainer) return null;

    const panelContent = (() => {
      switch (activePanel) {
        case "more":
          return (
            <MorePanel
              index={index}
              totalSlides={totalSlides}
              onDuplicate={onDuplicate}
              onAddSlide={onAddSlide}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onDelete}
              onCopyLink={handleCopyLink}
              onClose={closePanel}
            />
          );
        case "styling":
          return (
            <StylingPanel
              imageCount={imageCount}
              hasChart={hasChart}
              onChangeLayout={onChangeLayout}
              onAddImage={onAddImage}
              onAddChart={onAddChart}
              onRemoveChart={onRemoveChart}
              onClose={closePanel}
            />
          );
        case "ai":
          return <AIPanel onClose={closePanel} />;
        default:
          return null;
      }
    })();

    return createPortal(
      <div
        data-slide-panel
        className="fixed z-[99999]"
        style={{
          top: panelPosition.top,
          left: panelPosition.left,
          transform: "translateX(-100%)",
        }}
      >
        {panelContent}
      </div>,
      portalContainer
    );
  };

  return (
    <>
      {/* Main Toolbar - 3 buttons */}
      <div
        ref={toolbarRef}
        data-slide-toolbar
        data-slide-menu
        className="absolute top-0 right-0 z-30"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1 p-1 bg-zinc-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-zinc-700">
          {/* More Options Button */}
          <button
            onClick={() => openPanel("more")}
            className={`p-2 rounded-md transition-colors ${
              activePanel === "more"
                ? "bg-blue-500 text-white"
                : "text-zinc-300 hover:bg-zinc-700"
            }`}
            title="More options"
          >
            <MoreVertical size={18} />
          </button>

          {/* Styling Button */}
          <button
            onClick={() => openPanel("styling")}
            className={`flex items-center gap-1 px-2 py-2 rounded-md transition-colors ${
              activePanel === "styling"
                ? "bg-blue-500 text-white"
                : "text-zinc-300 hover:bg-zinc-700"
            }`}
            title="Card styling"
          >
            <Palette size={18} />
            <ChevronDown size={14} />
          </button>

          {/* AI Button */}
          <button
            onClick={() => openPanel("ai")}
            className={`flex items-center gap-1 px-2 py-2 rounded-md transition-colors ${
              activePanel === "ai"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "text-zinc-300 hover:bg-zinc-700"
            }`}
            title="AI tools"
          >
            <Sparkles size={18} />
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Panels rendered via Portal */}
      {renderPanel()}
    </>
  );
}
