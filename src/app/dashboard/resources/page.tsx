"use client";

import { useState, useMemo } from "react";
import { 
  Smile, Box, Star, Search, Copy, Check, X, Shapes, Sparkles
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import ResourcesStickyHeader from "./ResourcesStickyHeader";

// Element categories and templates (same as ElementModal for consistency)
const ELEMENT_TEMPLATES = [
  // Shapes
  { id: "rect", type: "shape", name: "Rectangle", variant: "rectangle", category: "shapes", icon: "Square", description: "Basic rectangle shape" },
  { id: "rounded-rect", type: "shape", name: "Rounded Rectangle", variant: "rounded-rectangle", category: "shapes", icon: "RectangleHorizontal", description: "Soft rounded corners" },
  { id: "circle", type: "shape", name: "Circle", variant: "circle", category: "shapes", icon: "Circle", description: "Perfect circle shape" },
  { id: "triangle", type: "shape", name: "Triangle", variant: "triangle", category: "shapes", icon: "Triangle", description: "Triangular shape" },
  { id: "diamond", type: "shape", name: "Diamond", variant: "diamond", category: "shapes", icon: "Diamond", description: "Diamond/rhombus shape" },
  { id: "hexagon", type: "shape", name: "Hexagon", variant: "hexagon", category: "shapes", icon: "Hexagon", description: "Six-sided polygon" },
  { id: "star", type: "shape", name: "Star", variant: "star", category: "shapes", icon: "Star", description: "Five-pointed star" },
  
  // Callouts
  { id: "callout-info", type: "callout", name: "Info Box", variant: "info", category: "callouts", icon: "Info", description: "Highlight important info" },
  { id: "callout-success", type: "callout", name: "Success Box", variant: "success", category: "callouts", icon: "CheckCircle", description: "Show success messages" },
  { id: "callout-warning", type: "callout", name: "Warning Box", variant: "warning", category: "callouts", icon: "AlertTriangle", description: "Display warnings" },
  { id: "callout-tip", type: "callout", name: "Tip Box", variant: "tip", category: "callouts", icon: "Lightbulb", description: "Share pro tips" },
  { id: "callout-note", type: "callout", name: "Note Box", variant: "note", category: "callouts", icon: "StickyNote", description: "Add side notes" },
  
  // Badges
  { id: "badge-solid", type: "badge", name: "Solid Badge", variant: "solid", category: "badges", description: "Solid color badge" },
  { id: "badge-outline", type: "badge", name: "Outline Badge", variant: "outline", category: "badges", description: "Outlined badge style" },
  { id: "badge-gradient", type: "badge", name: "Gradient Badge", variant: "gradient", category: "badges", description: "Gradient background" },
  { id: "badge-pill", type: "badge", name: "Pill Badge", variant: "pill", category: "badges", description: "Rounded pill shape" },
  
  // Dividers
  { id: "divider-solid", type: "divider", name: "Solid Line", variant: "solid", category: "dividers", description: "Simple solid line" },
  { id: "divider-dashed", type: "divider", name: "Dashed Line", variant: "dashed", category: "dividers", description: "Dashed line style" },
  { id: "divider-gradient", type: "divider", name: "Gradient Line", variant: "gradient", category: "dividers", description: "Fading gradient" },
  { id: "divider-double", type: "divider", name: "Double Line", variant: "double", category: "dividers", description: "Double line style" },
  
  // Content blocks
  { id: "quote-box", type: "quote-box", name: "Quote Box", category: "content", icon: "Quote", description: "Stylish quote block" },
  { id: "stat-card", type: "stat-card", name: "Stat Card", category: "content", icon: "TrendingUp", description: "Display statistics" },
  { id: "highlight-box", type: "highlight-box", name: "Highlight Box", category: "content", description: "Highlight key points" },
  
  // Connectors
  { id: "arrow-right", type: "arrow", name: "Arrow Right", variant: "right", category: "connectors", icon: "ArrowRight", description: "Right pointing arrow" },
  { id: "arrow-down", type: "arrow", name: "Arrow Down", variant: "down", category: "connectors", icon: "ArrowDown", description: "Down pointing arrow" },
  { id: "bracket-left", type: "bracket", name: "Left Bracket", variant: "left", category: "connectors", description: "Opening bracket" },
  { id: "bracket-right", type: "bracket", name: "Right Bracket", variant: "right", category: "connectors", description: "Closing bracket" },
];

// Popular Lucide icons for slides
const POPULAR_ICONS = [
  "Star", "Heart", "Check", "X", "Plus", "Minus", "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
  "ChevronRight", "ChevronLeft", "ChevronUp", "ChevronDown", "Play", "Pause", "Settings", "User",
  "Users", "Mail", "Phone", "MapPin", "Calendar", "Clock", "Search", "Home", "Menu", "MoreHorizontal",
  "Edit", "Trash", "Download", "Upload", "Share", "Link", "ExternalLink", "Eye", "EyeOff", "Lock",
  "Unlock", "Key", "Shield", "AlertCircle", "AlertTriangle", "Info", "HelpCircle", "CheckCircle",
  "XCircle", "Zap", "Sparkles", "Sun", "Moon", "Cloud", "Droplet", "Flame", "Leaf", "Globe",
  "Target", "Award", "Trophy", "Gift", "Bookmark", "Flag", "Tag", "Hash", "AtSign", "Percent",
  "DollarSign", "CreditCard", "ShoppingCart", "Package", "Truck", "Building", "Briefcase", "Laptop",
  "Smartphone", "Tablet", "Monitor", "Cpu", "Database", "Server", "Wifi", "Bluetooth", "Battery",
  "Camera", "Image", "Video", "Music", "Mic", "Volume2", "Bell", "MessageCircle", "Send", "Inbox",
  "FileText", "Folder", "Archive", "Clipboard", "PenTool", "Brush", "Palette", "Layers", "Grid",
  "Layout", "Maximize", "Minimize", "Move", "RotateCw", "RefreshCw", "Repeat", "Shuffle", "Filter",
  "BarChart", "PieChart", "LineChart", "TrendingUp", "TrendingDown", "Activity", "Gauge", "Percent"
];

const CATEGORIES = [
  { id: "elements", name: "Slide Elements", icon: Shapes, description: "Shapes, callouts, badges & more" },
  { id: "icons", name: "Icons", icon: Smile, description: "100+ Lucide icons for slides" },
];

const ELEMENT_SUBCATEGORIES = [
  { id: "all", name: "All" },
  { id: "shapes", name: "Shapes" },
  { id: "callouts", name: "Callouts" },
  { id: "badges", name: "Badges" },
  { id: "dividers", name: "Dividers" },
  { id: "content", name: "Content" },
  { id: "connectors", name: "Connectors" },
];

type ResourceType = "elements" | "icons";

export default function ResourcesPage() {
  const [activeType, setActiveType] = useState<ResourceType>("elements");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);

  // Filter elements
  const filteredElements = useMemo(() => {
    let elements = ELEMENT_TEMPLATES;
    if (activeSubcategory !== "all") {
      elements = elements.filter(el => el.category === activeSubcategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      elements = elements.filter(el => 
        el.name.toLowerCase().includes(query) || 
        el.description?.toLowerCase().includes(query) ||
        el.category.toLowerCase().includes(query)
      );
    }
    if (showFavorites) {
      elements = elements.filter(el => favorites.has(`element-${el.id}`));
    }
    return elements;
  }, [activeSubcategory, searchQuery, showFavorites, favorites]);

  // Filter icons
  const filteredIcons = useMemo(() => {
    let icons = POPULAR_ICONS;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      icons = icons.filter(icon => icon.toLowerCase().includes(query));
    }
    if (showFavorites) {
      icons = icons.filter(icon => favorites.has(`icon-${icon}`));
    }
    return icons;
  }, [searchQuery, showFavorites, favorites]);

  // Copy to clipboard
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  // Render icon component
  const renderIcon = (iconName: string, size: number = 24) => {
    const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
    if (IconComponent) return <IconComponent size={size} />;
    return <Smile size={size} />;
  };

  // Render element preview
  const renderElementPreview = (element: typeof ELEMENT_TEMPLATES[0]) => {
    const color = "#06b6d4";
    
    switch (element.type) {
      case "shape":
        return (
          <div
            className={`w-12 h-12 ${element.variant === "circle" ? "rounded-full" : element.variant === "rounded-rectangle" ? "rounded-xl" : ""}`}
            style={{
              backgroundColor: color,
              clipPath: element.variant === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" 
                : element.variant === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                : element.variant === "hexagon" ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
                : element.variant === "star" ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                : undefined,
            }}
          />
        );
      case "callout":
        const calloutColors: Record<string, string> = {
          info: "bg-blue-100 border-blue-300 text-blue-600",
          success: "bg-green-100 border-green-300 text-green-600",
          warning: "bg-yellow-100 border-yellow-300 text-yellow-600",
          tip: "bg-cyan-100 border-cyan-300 text-cyan-600",
          note: "bg-slate-100 border-slate-300 text-slate-600",
        };
        return (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${calloutColors[element.variant || "info"]}`}>
            {element.icon && renderIcon(element.icon, 16)}
            <span className="text-xs font-medium">Info</span>
          </div>
        );
      case "badge":
        return (
          <span
            className={`px-3 py-1 text-xs font-semibold text-white ${element.variant === "pill" ? "rounded-full" : "rounded-md"}`}
            style={{ 
              backgroundColor: element.variant === "outline" ? "transparent" : color,
              border: element.variant === "outline" ? `2px solid ${color}` : undefined,
              color: element.variant === "outline" ? color : "#fff",
              background: element.variant === "gradient" ? `linear-gradient(135deg, ${color}, #0891b2)` : undefined,
            }}
          >
            Badge
          </span>
        );
      case "divider":
        return (
          <div
            className="w-24 h-0.5"
            style={{
              backgroundColor: element.variant === "gradient" ? undefined : color,
              background: element.variant === "gradient" ? `linear-gradient(90deg, transparent, ${color}, transparent)` : undefined,
              borderTop: element.variant === "dashed" ? `2px dashed ${color}` : element.variant === "dotted" ? `2px dotted ${color}` : element.variant === "double" ? `4px double ${color}` : undefined,
              height: element.variant === "dashed" || element.variant === "dotted" || element.variant === "double" ? 0 : undefined,
            }}
          />
        );
      case "quote-box":
        return (
          <div className="flex items-center gap-2 px-3 py-2 border-l-4" style={{ borderColor: color }}>
            <span className="text-xs italic text-slate-600">"Quote"</span>
          </div>
        );
      case "stat-card":
        return (
          <div className="text-center px-4 py-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <div className="text-lg font-bold" style={{ color }}>99%</div>
            <div className="text-[10px] text-slate-500">Stat</div>
          </div>
        );
      case "highlight-box":
        return (
          <div className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: `${color}20`, color }}>
            Highlight
          </div>
        );
      case "arrow":
        return renderIcon(element.variant === "down" ? "ArrowDown" : "ArrowRight", 28);
      case "bracket":
        return <span className="text-3xl font-light" style={{ color }}>{element.variant === "left" ? "{" : "}"}</span>;
      default:
        return element.icon ? renderIcon(element.icon, 28) : <Box size={28} />;
    }
  };

  return (
    <div className="space-y-6 h-full">
      <ResourcesStickyHeader />

      {/* Info banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a]/10 to-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#06b6d4]/20 rounded-lg">
            <Sparkles size={20} className="text-[#06b6d4]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Slide Elements Library</h3>
            <p className="text-sm text-slate-600 mt-1">
              Browse shapes, callouts, badges, and icons. Add them to your slides using the "Add Element" button in the slide menu.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search elements and icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#06b6d4] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/20"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setActiveType(cat.id as ResourceType); setActiveSubcategory("all"); }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeType === cat.id
                ? "bg-[#06b6d4]/10 font-bold text-[#1e3a8a]"
                : "text-slate-600 hover:bg-slate-100 hover:text-[#06b6d4]"
            }`}
          >
            <cat.icon size={16} />
            {cat.name}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
            showFavorites ? "bg-yellow-100 text-yellow-700" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Star size={16} className={showFavorites ? "fill-yellow-500" : ""} />
          Favorites
        </button>
      </div>

      {/* Subcategory filters for elements */}
      {activeType === "elements" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {ELEMENT_SUBCATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSubcategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeSubcategory === cat.id
                  ? "bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {activeType === "elements" ? (
          filteredElements.length === 0 ? (
            <EmptyState type="elements" showFavorites={showFavorites} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredElements.map((element) => {
                const itemId = `element-${element.id}`;
                const isFavorite = favorites.has(itemId);
                const isCopied = copiedItem === itemId;
                
                return (
                  <div
                    key={element.id}
                    className="group relative flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#06b6d4] hover:shadow-lg"
                  >
                    {/* Preview */}
                    <div className="h-16 flex items-center justify-center mb-3 text-slate-600 group-hover:text-[#06b6d4] transition-colors">
                      {renderElementPreview(element)}
                    </div>
                    
                    {/* Info */}
                    <h4 className="text-sm font-medium text-slate-700 text-center">{element.name}</h4>
                    <p className="text-[10px] text-slate-400 text-center mt-0.5 capitalize">{element.category}</p>
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleFavorite(itemId)}
                        className={`p-1.5 rounded-md transition ${
                          isFavorite ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500 hover:bg-yellow-100 hover:text-yellow-600"
                        }`}
                      >
                        <Star size={14} className={isFavorite ? "fill-yellow-500" : ""} />
                      </button>
                    </div>
                    
                    {/* Usage hint */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1e3a8a] to-[#06b6d4] text-white text-[10px] text-center py-1.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      Use in Slide Menu → Add Element
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Icons Grid */
          filteredIcons.length === 0 ? (
            <EmptyState type="icons" showFavorites={showFavorites} />
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {filteredIcons.map((iconName) => {
                const itemId = `icon-${iconName}`;
                const isFavorite = favorites.has(itemId);
                const isIconCopied = copiedItem === itemId;
                
                return (
                  <div
                    key={iconName}
                    className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border border-slate-100 bg-white p-2 transition-all hover:border-[#06b6d4] hover:bg-cyan-50/50 hover:shadow-md"
                  >
                    <div className="text-slate-600 transition-colors group-hover:text-[#06b6d4]">
                      {renderIcon(iconName, 24)}
                    </div>
                    <span className="mt-1 text-[9px] text-slate-500 truncate w-full text-center">
                      {iconName}
                    </span>
                    
                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => copyToClipboard(`<${iconName} />`, itemId)}
                        className={`rounded-md p-1.5 transition ${
                          isIconCopied ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600 hover:bg-[#06b6d4] hover:text-white"
                        }`}
                        title="Copy component"
                      >
                        {isIconCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={() => toggleFavorite(itemId)}
                        className={`rounded-md p-1.5 transition ${
                          isFavorite ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-600"
                        }`}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star size={14} className={isFavorite ? "fill-yellow-500" : ""} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

    </div>
  );
}

// Empty state component
function EmptyState({ type, showFavorites }: { type: string; showFavorites: boolean }) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-100">
        {type === "elements" && <Shapes size={28} className="text-[#06b6d4]" />}
        {type === "icons" && <Smile size={28} className="text-[#06b6d4]" />}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-700">
        {showFavorites ? `No favorite ${type}` : `No ${type} found`}
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        {showFavorites ? `Star some ${type} to see them here.` : `Try adjusting your search or filters.`}
      </p>
    </div>
  );
}
