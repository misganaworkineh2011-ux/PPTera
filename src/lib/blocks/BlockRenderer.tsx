"use client";

import { useState } from "react";
import { 
  type ContentBlock, 
  type TextBlock, 
  type ListBlock, 
  type ImageBlock, 
  type ColumnBlock,
  type CodeBlock,
  type EmbedBlock,
  type DividerBlock,
  type QuoteBlock,
  type CalloutBlock,
  type ChartBlock,
  isTextBlock,
  isListBlock,
  isImageBlock,
  isColumnBlock,
  isCodeBlock,
  isEmbedBlock,
  isChartBlock,
} from "./types";
import type { Theme } from "~/lib/themes";

interface BlockRendererProps {
  block: ContentBlock;
  theme: Theme;
  isEditing?: boolean;
  isHovered?: boolean;
  onUpdate?: (block: ContentBlock) => void;
  onDelete?: () => void;
  onAddBlock?: (afterBlockId: string) => void;
}

export default function BlockRenderer({
  block,
  theme,
  isEditing = false,
  isHovered = false,
  onUpdate,
}: BlockRendererProps) {
  // Render based on block type
  if (isTextBlock(block)) {
    return (
      <TextBlockRenderer 
        block={block} 
        theme={theme} 
        isEditing={isEditing}
        isHovered={isHovered}
        onUpdate={onUpdate}
      />
    );
  }

  if (isListBlock(block)) {
    return (
      <ListBlockRenderer 
        block={block} 
        theme={theme}
        isEditing={isEditing}
        isHovered={isHovered}
        onUpdate={onUpdate}
      />
    );
  }

  if (isImageBlock(block)) {
    return (
      <ImageBlockRenderer 
        block={block} 
        theme={theme}
        isEditing={isEditing}
        isHovered={isHovered}
        onUpdate={onUpdate}
      />
    );
  }

  if (isColumnBlock(block)) {
    return (
      <ColumnBlockRenderer 
        block={block} 
        theme={theme}
        isEditing={isEditing}
        isHovered={isHovered}
        onUpdate={onUpdate}
      />
    );
  }

  if (isCodeBlock(block)) {
    return (
      <CodeBlockRenderer 
        block={block} 
        theme={theme}
        isEditing={isEditing}
      />
    );
  }

  if (isEmbedBlock(block)) {
    return (
      <EmbedBlockRenderer 
        block={block} 
        theme={theme}
      />
    );
  }

  if (block.type === "divider") {
    return <DividerBlockRenderer block={block as DividerBlock} theme={theme} />;
  }

  if (block.type === "quote") {
    return <QuoteBlockRenderer block={block as QuoteBlock} theme={theme} />;
  }

  if (block.type === "callout") {
    return <CalloutBlockRenderer block={block as CalloutBlock} theme={theme} />;
  }

  if (isChartBlock(block)) {
    return <ChartBlockRenderer block={block} theme={theme} />;
  }

  return null;
}

// Text Block Renderer
function TextBlockRenderer({ 
  block, 
  theme,
  isEditing,
  isHovered,
  onUpdate,
}: { 
  block: TextBlock; 
  theme: Theme;
  isEditing?: boolean;
  isHovered?: boolean;
  onUpdate?: (block: ContentBlock) => void;
}) {
  const [localContent, setLocalContent] = useState(block.content);
  const isHeading = block.type === "heading";
  
  const headingStyles: Record<number, string> = {
    1: "text-4xl md:text-5xl font-bold",
    2: "text-3xl md:text-4xl font-bold",
    3: "text-2xl md:text-3xl font-semibold",
    4: "text-xl md:text-2xl font-semibold",
  };

  const style: React.CSSProperties = {
    fontFamily: isHeading ? theme.fonts.heading.family : theme.fonts.body.family,
    color: isHeading ? theme.colors.heading : theme.colors.text,
    textAlign: block.style?.alignment || "left",
  };

  const className = isHeading 
    ? headingStyles[block.level || 1] 
    : "text-base md:text-lg leading-relaxed";

  if (isEditing) {
    return (
      <textarea
        value={localContent}
        onChange={(e) => {
          setLocalContent(e.target.value);
          onUpdate?.({ ...block, content: e.target.value });
        }}
        className={`${className} w-full bg-transparent border-none outline-none resize-none`}
        style={style}
        rows={isHeading ? 1 : 3}
      />
    );
  }

  return (
    <div 
      className={`${className} ${isHovered ? "ring-2 ring-white/20 rounded-lg" : ""}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}

// List Block Renderer
function ListBlockRenderer({ 
  block, 
  theme,
  isEditing,
  isHovered,
  onUpdate,
}: { 
  block: ListBlock; 
  theme: Theme;
  isEditing?: boolean;
  isHovered?: boolean;
  onUpdate?: (block: ContentBlock) => void;
}) {
  const ListTag = block.listType === "ordered" ? "ol" : "ul";
  
  const listStyle = block.listType === "ordered" 
    ? "list-decimal" 
    : block.listType === "checkbox"
    ? "list-none"
    : "list-disc";

  return (
    <ListTag 
      className={`${listStyle} pl-6 space-y-2`}
      style={{ 
        fontFamily: theme.fonts.body.family,
        color: theme.colors.text,
      }}
    >
      {block.items.map((item, index) => (
        <li key={item.id} className="leading-relaxed">
          {block.listType === "checkbox" && (
            <input 
              type="checkbox" 
              checked={item.checked} 
              className="mr-2"
              onChange={() => {
                const newItems = [...block.items];
                newItems[index] = { ...item, checked: !item.checked };
                onUpdate?.({ ...block, items: newItems });
              }}
            />
          )}
          <span dangerouslySetInnerHTML={{ __html: item.content }} />
        </li>
      ))}
    </ListTag>
  );
}

// Image Block Renderer with WYSIWYG features
function ImageBlockRenderer({ 
  block, 
  theme,
  isEditing,
  isHovered,
}: { 
  block: ImageBlock; 
  theme: Theme;
  isEditing?: boolean;
  isHovered?: boolean;
  onUpdate?: (block: ContentBlock) => void;
}) {
  const containerStyle: React.CSSProperties = {
    width: block.size?.width || "100%",
    height: block.size?.height || "auto",
    position: "relative",
  };

  const imageStyle: React.CSSProperties = {
    objectFit: block.objectFit || "cover",
    objectPosition: block.objectPosition || "center",
    filter: block.filter ? `
      brightness(${block.filter.brightness || 100}%)
      contrast(${block.filter.contrast || 100}%)
      saturate(${block.filter.saturation || 100}%)
      blur(${block.filter.blur || 0}px)
      ${block.filter.grayscale ? "grayscale(100%)" : ""}
    ` : undefined,
  };

  const maskClass = {
    none: "",
    circle: "rounded-full",
    rounded: "rounded-2xl",
    blob: "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]",
    hexagon: "clip-path-hexagon",
  }[block.mask || "none"];

  return (
    <div 
      style={containerStyle}
      className={`relative group ${isHovered ? "ring-2 ring-white/30 rounded-lg" : ""}`}
    >
      <img
        src={block.url}
        alt={block.alt}
        className={`w-full h-full ${maskClass}`}
        style={imageStyle}
        draggable={false}
      />
      {block.caption && (
        <p 
          className="text-sm mt-2 text-center opacity-70"
          style={{ color: theme.colors.textMuted }}
        >
          {block.caption}
        </p>
      )}
      {/* WYSIWYG controls shown on hover */}
      {isEditing && isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 bg-black/50 rounded-lg p-1">
          <button className="p-1.5 hover:bg-white/20 rounded" title="Crop">
            <CropIcon />
          </button>
          <button className="p-1.5 hover:bg-white/20 rounded" title="Resize">
            <ResizeIcon />
          </button>
          <button className="p-1.5 hover:bg-white/20 rounded" title="Mask">
            <MaskIcon />
          </button>
        </div>
      )}
    </div>
  );
}

// Column Block Renderer (recursive)
function ColumnBlockRenderer({ 
  block, 
  theme,
  isEditing,
  isHovered,
}: { 
  block: ColumnBlock; 
  theme: Theme;
  isEditing?: boolean;
  isHovered?: boolean;
  onUpdate?: (block: ContentBlock) => void;
}) {
  return (
    <div 
      className="flex gap-4"
      style={{ 
        gap: block.gap || "1rem",
        alignItems: block.verticalAlign === "center" ? "center" 
          : block.verticalAlign === "bottom" ? "flex-end" 
          : block.verticalAlign === "stretch" ? "stretch"
          : "flex-start",
      }}
    >
      {block.columns.map((column) => (
        <div 
          key={column.id}
          style={{ width: `${column.width}%` }}
          className="flex flex-col gap-4"
        >
          {column.blocks.map((childBlock) => (
            <BlockRenderer
              key={childBlock.id}
              block={childBlock}
              theme={theme}
              isEditing={isEditing}
              isHovered={isHovered}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Code Block Renderer
function CodeBlockRenderer({ 
  block, 
  theme,
}: { 
  block: CodeBlock; 
  theme: Theme;
  isEditing?: boolean;
}) {
  return (
    <div className="relative rounded-lg overflow-hidden">
      {block.filename && (
        <div 
          className="px-4 py-2 text-sm font-mono border-b"
          style={{ 
            backgroundColor: theme.colors.backgroundAlt,
            borderColor: theme.colors.border,
            color: theme.colors.textMuted,
          }}
        >
          {block.filename}
        </div>
      )}
      <pre 
        className="p-4 overflow-x-auto"
        style={{ 
          backgroundColor: theme.colors.backgroundAlt,
          fontFamily: "monospace",
        }}
      >
        <code 
          className={`language-${block.language || "plaintext"}`}
          style={{ color: theme.colors.text }}
        >
          {block.content}
        </code>
      </pre>
    </div>
  );
}

// Embed Block Renderer
function EmbedBlockRenderer({ 
  block, 
  theme,
}: { 
  block: EmbedBlock; 
  theme: Theme;
}) {
  const getEmbedUrl = () => {
    if (block.embedType === "youtube") {
      const videoId = block.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (block.embedType === "vimeo") {
      const videoId = block.url.match(/vimeo\.com\/(\d+)/)?.[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return block.url;
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden"
      style={{ aspectRatio: block.aspectRatio || 16/9 }}
    >
      <iframe
        src={getEmbedUrl()}
        className="absolute inset-0 w-full h-full border-0"
        allowFullScreen={block.allowFullscreen}
        title="Embedded content"
      />
    </div>
  );
}

// Divider Block Renderer
function DividerBlockRenderer({ 
  block, 
  theme,
}: { 
  block: DividerBlock; 
  theme: Theme;
}) {
  const borderStyle = block.variant === "dashed" ? "dashed" 
    : block.variant === "dotted" ? "dotted" 
    : "solid";

  if (block.variant === "gradient") {
    return (
      <div 
        className="h-px my-6"
        style={{ 
          background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`,
        }}
      />
    );
  }

  return (
    <hr 
      className="my-6"
      style={{ 
        borderStyle,
        borderWidth: block.thickness || 1,
        borderColor: block.color || theme.colors.border,
      }}
    />
  );
}

// Quote Block Renderer
function QuoteBlockRenderer({ 
  block, 
  theme,
}: { 
  block: QuoteBlock; 
  theme: Theme;
}) {
  return (
    <blockquote 
      className="border-l-4 pl-6 py-2 my-4"
      style={{ 
        borderColor: theme.colors.primary,
        fontFamily: theme.fonts.body.family,
      }}
    >
      <p 
        className="text-lg italic"
        style={{ color: theme.colors.text }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
      {(block.author || block.source) && (
        <footer 
          className="mt-2 text-sm"
          style={{ color: theme.colors.textMuted }}
        >
          {block.author && <span>— {block.author}</span>}
          {block.source && <span>, {block.source}</span>}
        </footer>
      )}
    </blockquote>
  );
}

// Callout Block Renderer
function CalloutBlockRenderer({ 
  block, 
  theme,
}: { 
  block: CalloutBlock; 
  theme: Theme;
}) {
  const variantColors = {
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "ℹ️" },
    warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "⚠️" },
    success: { bg: "bg-green-500/10", border: "border-green-500/30", icon: "✅" },
    error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "❌" },
    tip: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "💡" },
  };

  const variant = variantColors[block.variant || "info"];

  return (
    <div 
      className={`${variant.bg} ${variant.border} border rounded-lg p-4 my-4`}
    >
      <div className="flex gap-3">
        <span className="text-xl">{block.icon || variant.icon}</span>
        <div>
          {block.title && (
            <p 
              className="font-semibold mb-1"
              style={{ color: theme.colors.heading }}
            >
              {block.title}
            </p>
          )}
          <p 
            style={{ color: theme.colors.text }}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      </div>
    </div>
  );
}

// Chart Block Renderer
function ChartBlockRenderer({ 
  block, 
  theme,
}: { 
  block: ChartBlock; 
  theme: Theme;
}) {
  // Simple chart placeholder - would integrate with actual chart library
  return (
    <div 
      className="rounded-lg p-4"
      style={{ backgroundColor: theme.colors.backgroundAlt }}
    >
      <p className="text-center" style={{ color: theme.colors.textMuted }}>
        Chart: {block.chartType}
      </p>
    </div>
  );
}

// Icon components
function CropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" />
      <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" />
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21l-6-6m6 6v-4.8m0 4.8h-4.8" />
      <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
      <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
      <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
    </svg>
  );
}

function MaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" />
    </svg>
  );
}
