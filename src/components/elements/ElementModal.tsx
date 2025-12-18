"use client";

import { useState, useEffect } from "react";
import { X, Shapes, Sparkles, Type, AlertCircle, Award, Minus, ArrowRight } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { type SlideElement, type ElementType } from "~/components/presentation/types";
import { type Theme } from "~/lib/themes";

interface ElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (element: SlideElement) => void;
  theme?: Theme;
  existingElement?: SlideElement | null;
}

// Element templates
const ELEMENT_TEMPLATES = [
  // Shapes
  { id: "rect", type: "shape" as ElementType, name: "Rectangle", variant: "rectangle", category: "shapes", icon: "Square" },
  { id: "rounded-rect", type: "shape" as ElementType, name: "Rounded Rectangle", variant: "rounded-rectangle", category: "shapes", icon: "RectangleHorizontal" },
  { id: "circle", type: "shape" as ElementType, name: "Circle", variant: "circle", category: "shapes", icon: "Circle" },
  { id: "triangle", type: "shape" as ElementType, name: "Triangle", variant: "triangle", category: "shapes", icon: "Triangle" },
  { id: "diamond", type: "shape" as ElementType, name: "Diamond", variant: "diamond", category: "shapes", icon: "Diamond" },
  { id: "hexagon", type: "shape" as ElementType, name: "Hexagon", variant: "hexagon", category: "shapes", icon: "Hexagon" },
  { id: "star", type: "shape" as ElementType, name: "Star", variant: "star", category: "shapes", icon: "Star" },
  
  // Callouts
  { id: "callout-info", type: "callout" as ElementType, name: "Info Box", variant: "info", category: "callouts", icon: "Info", content: "Important information here" },
  { id: "callout-success", type: "callout" as ElementType, name: "Success Box", variant: "success", category: "callouts", icon: "CheckCircle", content: "Success message" },
  { id: "callout-warning", type: "callout" as ElementType, name: "Warning Box", variant: "warning", category: "callouts", icon: "AlertTriangle", content: "Warning message" },
  { id: "callout-tip", type: "callout" as ElementType, name: "Tip Box", variant: "tip", category: "callouts", icon: "Lightbulb", content: "Pro tip here" },
  { id: "callout-note", type: "callout" as ElementType, name: "Note Box", variant: "note", category: "callouts", icon: "StickyNote", content: "Note content" },
  
  // Badges
  { id: "badge-solid", type: "badge" as ElementType, name: "Solid Badge", variant: "solid", category: "badges", content: "NEW" },
  { id: "badge-outline", type: "badge" as ElementType, name: "Outline Badge", variant: "outline", category: "badges", content: "BETA" },
  { id: "badge-gradient", type: "badge" as ElementType, name: "Gradient Badge", variant: "gradient", category: "badges", content: "PRO" },
  { id: "badge-pill", type: "badge" as ElementType, name: "Pill Badge", variant: "pill", category: "badges", content: "Featured" },
  
  // Dividers
  { id: "divider-solid", type: "divider" as ElementType, name: "Solid Line", variant: "solid", category: "dividers" },
  { id: "divider-dashed", type: "divider" as ElementType, name: "Dashed Line", variant: "dashed", category: "dividers" },
  { id: "divider-gradient", type: "divider" as ElementType, name: "Gradient Line", variant: "gradient", category: "dividers" },
  { id: "divider-double", type: "divider" as ElementType, name: "Double Line", variant: "double", category: "dividers" },
  
  // Quote & Stats
  { id: "quote-box", type: "quote-box" as ElementType, name: "Quote Box", category: "content", content: "Your inspiring quote here", icon: "Quote" },
  { id: "stat-card", type: "stat-card" as ElementType, name: "Stat Card", category: "content", content: "99%", icon: "TrendingUp" },
  { id: "highlight-box", type: "highlight-box" as ElementType, name: "Highlight Box", category: "content", content: "Key point to highlight" },
  
  // Arrows & Brackets
  { id: "arrow-right", type: "arrow" as ElementType, name: "Arrow Right", variant: "right", category: "connectors", icon: "ArrowRight" },
  { id: "arrow-down", type: "arrow" as ElementType, name: "Arrow Down", variant: "down", category: "connectors", icon: "ArrowDown" },
  { id: "bracket-left", type: "bracket" as ElementType, name: "Left Bracket", variant: "left", category: "connectors" },
  { id: "bracket-right", type: "bracket" as ElementType, name: "Right Bracket", variant: "right", category: "connectors" },
];

const CATEGORIES = [
  { id: "shapes", name: "Shapes", icon: Shapes },
  { id: "callouts", name: "Callouts", icon: AlertCircle },
  { id: "badges", name: "Badges", icon: Award },
  { id: "dividers", name: "Dividers", icon: Minus },
  { id: "content", name: "Content", icon: Type },
  { id: "connectors", name: "Connectors", icon: ArrowRight },
];

// Helper to get theme-based colors
const getThemeColors = (theme?: Theme) => {
  const primary = theme?.colors.primary || "#06b6d4";
  const secondary = theme?.colors.secondary || "#1e3a8a";
  const accent = theme?.colors.accent || "#8b5cf6";
  const text = theme?.colors.text || "#1e293b";
  const background = theme?.colors.background || "#ffffff";
  
  return [
    { name: "Primary", value: primary },
    { name: "Secondary", value: secondary },
    { name: "Accent", value: accent },
    { name: "Text", value: text },
    { name: "Background", value: background },
    { name: "White", value: "#ffffff" },
    { name: "Black", value: "#000000" },
  ];
};

export default function ElementModal({ isOpen, onClose, onInsert, theme, existingElement }: ElementModalProps) {
  const [mode, setMode] = useState<"templates" | "customize">(existingElement ? "customize" : "templates");
  const [selectedCategory, setSelectedCategory] = useState("shapes");
  const [selectedElement, setSelectedElement] = useState<typeof ELEMENT_TEMPLATES[0] | null>(null);
  
  // Get theme-based colors
  const themeColors = getThemeColors(theme);
  const primaryColor = theme?.colors.primary || "#06b6d4";
  
  // Customization state
  const [content, setContent] = useState(existingElement?.content || "");
  const [color, setColor] = useState(existingElement?.color || primaryColor);
  const [backgroundColor, setBackgroundColor] = useState(existingElement?.backgroundColor || "transparent");
  const [opacity, setOpacity] = useState(existingElement?.opacity || 100);
  const [fontSize, setFontSize] = useState<"xs" | "sm" | "md" | "lg" | "xl">(existingElement?.fontSize || "md");

  useEffect(() => {
    if (isOpen) {
      setMode(existingElement ? "customize" : "templates");
      if (existingElement) {
        setContent(existingElement.content || "");
        setColor(existingElement.color || primaryColor);
        setBackgroundColor(existingElement.backgroundColor || "transparent");
        setOpacity(existingElement.opacity || 100);
        setFontSize(existingElement.fontSize || "md");
      }
    }
  }, [isOpen, existingElement, primaryColor]);

  if (!isOpen) return null;

  const handleTemplateSelect = (template: typeof ELEMENT_TEMPLATES[0]) => {
    setSelectedElement(template);
    setContent(template.content || "");
    setMode("customize");
  };

  const handleInsert = () => {
    if (!selectedElement && !existingElement) return;
    
    const baseElement = existingElement || selectedElement;
    if (!baseElement) return;

    const element: SlideElement = {
      id: existingElement?.id || `element-${Date.now()}`,
      type: baseElement.type as ElementType,
      x: existingElement?.x ?? 50,
      y: existingElement?.y ?? 50,
      width: existingElement?.width ?? getDefaultWidth(baseElement.type as ElementType),
      height: existingElement?.height ?? getDefaultHeight(baseElement.type as ElementType),
      content: content || baseElement.content,
      variant: (baseElement as any).variant,
      icon: (baseElement as any).icon,
      color: color,
      backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
      opacity,
      fontSize,
      zIndex: existingElement?.zIndex ?? 10,
    };

    onInsert(element);
    onClose();
  };

  const getDefaultWidth = (type: ElementType): number => {
    switch (type) {
      case "divider": return 40;
      case "badge": return 15;
      case "shape": return 20;
      case "arrow": return 15;
      case "bracket": return 5;
      default: return 30;
    }
  };

  const getDefaultHeight = (type: ElementType): number => {
    switch (type) {
      case "divider": return 2;
      case "badge": return 5;
      case "shape": return 15;
      case "arrow": return 8;
      case "bracket": return 20;
      default: return 15;
    }
  };

  const renderIcon = (iconName: string, size: number = 20) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
    if (IconComponent) return <IconComponent size={size} />;
    return <Shapes size={size} />;
  };

  const filteredTemplates = ELEMENT_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
              <Shapes size={20} className="text-[#06b6d4]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {existingElement ? "Edit Element" : "Add Element"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mode === "templates" ? "Choose an element to add to your slide" : "Customize your element"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          {mode === "templates" ? (
            <div className="p-6">
              {/* Category tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <cat.icon size={16} />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Templates grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {filteredTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="group p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-[#06b6d4] hover:shadow-md transition-all bg-white dark:bg-slate-700/50 text-center"
                  >
                    <div className="h-12 flex items-center justify-center mb-2 text-slate-500 group-hover:text-[#06b6d4] transition-colors">
                      {template.icon ? renderIcon(template.icon, 28) : <Shapes size={28} />}
                    </div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#06b6d4] dark:group-hover:text-cyan-400">
                      {template.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Back button */}
              {!existingElement && (
                <button
                  onClick={() => { setMode("templates"); setSelectedElement(null); }}
                  className="text-sm text-slate-500 hover:text-[#06b6d4] transition-colors"
                >
                  ← Back to templates
                </button>
              )}

              {/* Preview */}
              <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center min-h-[120px]">
                <ElementPreview
                  element={{
                    type: (selectedElement?.type || existingElement?.type) as ElementType,
                    variant: (selectedElement as any)?.variant || existingElement?.variant,
                    content,
                    icon: (selectedElement as any)?.icon || existingElement?.icon,
                    color: color === "primary" ? theme?.colors.primary || "#06b6d4" : color,
                    backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
                    opacity,
                    fontSize,
                  }}
                />
              </div>

              {/* Customization options */}
              <div className="grid grid-cols-2 gap-4">
                {/* Content input (for elements that have text) */}
                {(selectedElement?.content !== undefined || existingElement?.content !== undefined) && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
                    <input
                      type="text"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent"
                      placeholder="Enter text..."
                    />
                  </div>
                )}

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color (Theme)</label>
                  <div className="flex flex-wrap gap-2">
                    {themeColors.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition ${color === c.value ? "border-cyan-500 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBackgroundColor("transparent")}
                      className={`w-8 h-8 rounded-full border-2 transition bg-white dark:bg-slate-700 ${backgroundColor === "transparent" ? "border-cyan-500" : "border-slate-300"}`}
                      title="Transparent"
                    >
                      <span className="text-xs text-slate-400">∅</span>
                    </button>
                    {themeColors.slice(0, 5).map(c => (
                      <button
                        key={c.value}
                        onClick={() => setBackgroundColor(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition ${backgroundColor === c.value ? "border-cyan-500 scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Opacity: {opacity}%</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Font Size */}
                {(selectedElement?.content !== undefined || existingElement?.content !== undefined) && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                    >
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Insert button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInsert}
                  className="px-6 py-2 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  {existingElement ? "Update Element" : "Add to Slide"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Element preview component
function ElementPreview({ element }: { element: Partial<SlideElement> }) {
  const { type, variant, content, icon, color, backgroundColor, opacity, fontSize } = element;
  
  const fontSizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[fontSize || "md"];

  const renderIcon = (iconName: string, size: number = 16) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>>)[iconName];
    if (IconComponent) return <IconComponent size={size} style={{ color }} />;
    return null;
  };

  const style: React.CSSProperties = {
    opacity: (opacity || 100) / 100,
    color,
    backgroundColor,
  };

  switch (type) {
    case "shape":
      return (
        <div
          className={`w-20 h-20 ${variant === "circle" ? "rounded-full" : variant === "rounded-rectangle" ? "rounded-xl" : ""}`}
          style={{
            ...style,
            backgroundColor: backgroundColor || color,
            clipPath: variant === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
              : variant === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
              : variant === "hexagon" ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
              : variant === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
              : undefined,
          }}
        />
      );

    case "callout": {
      const calloutColors: Record<string, { bg: string; border: string; icon: string }> = {
        info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500" },
        success: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-500" },
        warning: { bg: "bg-yellow-50", border: "border-yellow-200", icon: "text-yellow-500" },
        tip: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-500" },
        note: { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-500" },
      };
      const defaultStyle = { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500" };
      const calloutStyle = calloutColors[variant || "info"] ?? defaultStyle;
      return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${calloutStyle.bg} ${calloutStyle.border}`} style={{ opacity: (opacity || 100) / 100 }}>
          {icon && <span className={calloutStyle.icon}>{renderIcon(icon, 20)}</span>}
          <span className={`${fontSizeClass} text-slate-700`}>{content || "Callout text"}</span>
        </div>
      );
    }

    case "badge":
      return (
        <span
          className={`inline-flex items-center px-3 py-1 ${fontSizeClass} font-semibold ${
            variant === "pill" ? "rounded-full" : "rounded-md"
          } ${variant === "outline" ? "border-2" : ""}`}
          style={{
            ...style,
            backgroundColor: variant === "outline" ? "transparent" : (backgroundColor || color),
            borderColor: variant === "outline" ? color : undefined,
            color: variant === "outline" ? color : (backgroundColor ? color : "#fff"),
            background: variant === "gradient" ? `linear-gradient(135deg, ${color}, ${adjustColor(color || "#06b6d4", -30)})` : undefined,
          }}
        >
          {content || "Badge"}
        </span>
      );

    case "divider":
      return (
        <div
          className="w-48 h-1"
          style={{
            ...style,
            backgroundColor: variant === "gradient" ? undefined : color,
            background: variant === "gradient" ? `linear-gradient(90deg, transparent, ${color}, transparent)` : undefined,
            borderTop: variant === "dashed" ? `2px dashed ${color}` : variant === "dotted" ? `2px dotted ${color}` : variant === "double" ? `4px double ${color}` : undefined,
            height: variant === "dashed" || variant === "dotted" || variant === "double" ? 0 : undefined,
          }}
        />
      );

    case "quote-box":
      return (
        <div className="flex items-start gap-3 p-4 border-l-4" style={{ borderColor: color, opacity: (opacity || 100) / 100 }}>
          <span className={`${fontSizeClass} italic text-slate-600`}>"{content || "Quote text"}"</span>
        </div>
      );

    case "stat-card":
      return (
        <div className="text-center p-4 rounded-xl" style={{ backgroundColor: backgroundColor || "rgba(0,0,0,0.05)", opacity: (opacity || 100) / 100 }}>
          <div className="text-3xl font-bold" style={{ color }}>{content || "99%"}</div>
          <div className="text-xs text-slate-500 mt-1">Statistic</div>
        </div>
      );

    case "highlight-box":
      return (
        <div
          className={`px-4 py-2 rounded-lg ${fontSizeClass} font-medium`}
          style={{
            backgroundColor: `${color}20`,
            color,
            opacity: (opacity || 100) / 100,
          }}
        >
          {content || "Highlighted text"}
        </div>
      );

    case "arrow":
      return (
        <div style={{ color, opacity: (opacity || 100) / 100 }}>
          {renderIcon(variant === "down" ? "ArrowDown" : "ArrowRight", 32)}
        </div>
      );

    case "bracket":
      return (
        <div className="text-4xl font-light" style={{ color, opacity: (opacity || 100) / 100 }}>
          {variant === "left" ? "{" : "}"}
        </div>
      );

    default:
      return <div className="w-16 h-16 bg-slate-200 rounded" />;
  }
}

// Helper to adjust color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
