"use client";

import { ImageIcon } from "lucide-react";
import type { SlideImage } from "./types";

interface SlideImageProps {
  image: SlideImage;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLImageElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLImageElement>) => void;
}

function getImageStyle(image: SlideImage): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (image.filter) {
    const filters: string[] = [];
    if (image.filter.brightness !== undefined && image.filter.brightness !== 100) {
      filters.push(`brightness(${image.filter.brightness}%)`);
    }
    if (image.filter.contrast !== undefined && image.filter.contrast !== 100) {
      filters.push(`contrast(${image.filter.contrast}%)`);
    }
    if (image.filter.saturation !== undefined && image.filter.saturation !== 100) {
      filters.push(`saturate(${image.filter.saturation}%)`);
    }
    if (filters.length > 0) {
      style.filter = filters.join(" ");
    }
  }

  if (image.objectFit && image.objectFit !== "cover") {
    style.objectFit = image.objectFit;
  }

  if (image.crop && (image.crop.x !== 0 || image.crop.y !== 0 || image.crop.width !== 100 || image.crop.height !== 100)) {
    const scaleX = 100 / image.crop.width;
    const scaleY = 100 / image.crop.height;
    const scale = Math.max(scaleX, scaleY);

    const offsetX = -image.crop.x * scale;
    const offsetY = -image.crop.y * scale;

    style.transform = `scale(${scale})`;
    style.transformOrigin = "top left";
    style.marginLeft = `${offsetX}%`;
    style.marginTop = `${offsetY}%`;
  }

  return style;
}

export default function SlideImg({ image, alt, className = "", style = {}, draggable, onDragStart, onDragEnd }: SlideImageProps) {
  if (image.source === "placeholder" || !image.url) {
    return (
      <div className={className} style={style}>
        <div className="w-full h-full rounded-lg border border-gray-300 bg-gray-200 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <ImageIcon size={34} className="text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-500">Image placeholder</span>
          </div>
        </div>
      </div>
    );
  }
  const imageStyles = getImageStyle(image);

  const objectFitClass = image.objectFit === "contain" ? "object-contain" : 
                         image.objectFit === "fill" ? "object-fill" :
                         image.objectFit === "none" ? "object-none" :
                         "object-cover";

  const cleanedClassName = className
    .replace(/\bobject-(cover|contain|fill|none)\b/g, "")
    .trim();

  const finalClassName = `${cleanedClassName} ${objectFitClass}`.trim();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={image.url} 
      alt={alt} 
      className={finalClassName}
      style={{ ...style, ...imageStyles }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    />
  );
}
