import { Fragment, useEffect, useRef } from "react";
import { PageItem, PageData } from "@/types";
import { LINK_PRESETS } from "@/lib/linkPresets";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/react/sortable";
import { motion } from "framer-motion";
import { ThemeConfig } from "@/lib/themes";
import { createMagnetEffect } from "@/lib/magnetEffect";

interface EditPageLinkProps {
  item: PageItem;
  pageData: PageData;
  index: number;
  onLinkClick?: (itemId: string) => void;
  error?: string;
  themeStyle?: ThemeConfig;
}

export default function EditPageLink({
  item,
  index,
  onLinkClick,
  error,
  themeStyle,
}: EditPageLinkProps) {
  const { ref: sortableRef } = useSortable({ id: item.id, index });
  const linkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = createMagnetEffect(
      linkRef.current,
      themeStyle?.effects?.linkMagnet
    );
    return () => cleanup?.();
  }, [themeStyle?.effects?.linkMagnet]);

  const preset = LINK_PRESETS[item.presetId];
  if (!preset) return null;

  const Icon = preset.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(item.id);
    }
  };

  const itemContent = (
    <div className="pf-link__inner">
      <div className="pf-link__icon-container">
        <div className="pf-link__icon">
          <Icon className="pf-link__icon" aria-hidden="true" />
        </div>
      </div>
      <div className="pf-link__title">
        <span className="pf-link__title-text">
          {item.title || preset.title}
        </span>
      </div>
      <div className="pf-link__icon-container">
        {item.tokenGated && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="pf-link__icon-lock">
            <path
              fillRule="evenodd"
              d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={sortableRef}
      className="w-full text-left cursor-pointer group relative"
      onClick={handleClick}>
      <div
        className="absolute -left-7 md:-left-11 top-1/2 z-10 -translate-y-1/2 cursor-grab w-6 md:w-9 h-11 flex items-center justify-center rounded-lg hover:bg-black/5"
        onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>
      <motion.div
        initial={item.isNew ? { opacity: 0, scale: 0.5 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: "easeOut",
        }}>
        <div
          ref={linkRef}
          className={`pf-link relative ${
            error ? "border border-red-500 rounded-lg" : ""
          }`}>
          {error && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
          )}
          {itemContent}
          {themeStyle?.effects?.linkGradientBorder && (
            <div
              className="pf-gradient-border pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                ["--pf-gradient-border" as string]: `${themeStyle?.styles?.["--pf-gradient-border"]}`,
              }}>
              <div className="pf-gradient-border__inner absolute inset-0 rounded-[inherit]"></div>
            </div>
          )}: 

          {themeStyle?.effects?.linkPixelBorder && (
            <div
              className="pf-pixel-border absolute pointer-events-none inset-0"
              style={{
                borderImageSource: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                  `<svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${
                    themeStyle?.styles?.["--pf-pixel-border-color"] ||
                    "rgb(33,37,41)"
                  }"/></svg>`
                )}")`,
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
