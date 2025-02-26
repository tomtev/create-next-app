import { PageData, PageItem } from "@/types";
import EditPageLink from "./EditPageLink";
import { DragDropProvider } from "@dnd-kit/react";
import { ThemeConfig } from "@/lib/themes";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LINK_PRESETS } from "@/lib/linkPresets";

interface EditPageContentProps {
  pageData: PageData;
  items: PageItem[];
  themeStyle?: ThemeConfig;
  onLinkClick?: (itemId: string) => void;
  onTitleClick?: () => void;
  onDescriptionClick?: () => void;
  onImageClick?: () => void;
  onItemsReorder?: (items: PageItem[]) => void;
  validationErrors?: { [key: string]: string };
  onAddLinkClick?: () => void;
}

export default function EditPageContent({
  pageData,
  items,
  themeStyle,
  onLinkClick,
  onTitleClick,
  onDescriptionClick,
  onImageClick,
  onItemsReorder,
  validationErrors = {},
  onAddLinkClick,
}: EditPageContentProps) {
  const handleDragEnd = (event: any) => {
    const { operation, canceled } = event;
    const { source, target } = operation;

    if (canceled) {
      return;
    }

    if (source && target && source.id !== target.id) {
      const oldIndex = items.findIndex((item) => item.id === source.id);
      const newIndex = items.findIndex((item) => item.id === target.id);

      const newItems = [...items];
      const movedItem = newItems.splice(oldIndex, 1)[0];
      if (!movedItem) return;
      
      newItems.splice(newIndex, 0, movedItem);

      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      console.log('Items reordered:', reorderedItems.map(item => ({ id: item.id, title: item.title, order: item.order })));
      
      onItemsReorder?.(reorderedItems);
    }
  };

  // Filter out items that require a token when no token is connected
  const filteredItems = items.filter(item => {
    const preset = LINK_PRESETS[item.presetId];
    if (preset?.options?.requireToken && !pageData.connectedToken) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="pf-page__container">
        {/* Page Header */}
        <div className="pf-page__header">
          <div className="pf-page__header-inner">
            {pageData?.image && (
              <img
                className="pf-page__image cursor-pointer hover:opacity-90"
                src={pageData.image}
                alt={pageData.title || "Page image"}
                onClick={onImageClick}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <h1
              className={`pf-page__title cursor-pointer ${
                themeStyle?.effects?.titleGradientBackground
                  ? "pf-page__title--has-gradient"
                  : ""
              }`}
              onClick={onTitleClick}>
              <span>{pageData?.title || "Untitled Page"}</span>
            </h1>
            {pageData?.description && (
              <p
                className={`pf-page__description cursor-pointer ${
                  themeStyle?.effects?.descriptionGradientBackground
                    ? "pf-page__description--has-gradient"
                    : ""
                }`}
                onClick={onDescriptionClick}>
                <span>{pageData.description}</span>
              </p>
            )}
          </div>
        </div>

        {/* Social Links & Plugins */}
        {filteredItems.length > 0 ? (
          <div className="pf-links">
            <DragDropProvider onDragEnd={handleDragEnd}>
              <div className="pf-links__grid">
                {filteredItems
                  .filter((item): item is PageItem => !!item)
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <EditPageLink
                      key={`${item.id}-${String(item.customIcon || "default")}`}
                      item={item}
                      index={index}
                      pageData={pageData}
                      onLinkClick={onLinkClick}
                      error={validationErrors[item.id]}
                      themeStyle={themeStyle}
                    />
                  ))}
              </div>
            </DragDropProvider>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <p className="text-gray-500 mb-4">No links added yet</p>
            {onAddLinkClick && (
              <button 
                onClick={onAddLinkClick}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add your first link
              </button>
            )}
          </div>
        )}
        <div className="flex mt-10 items-center justify-center gap-1 text-sm opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-0.5">
            <span>page.fun</span>
            <span className="opacity-50"> / </span>
            <span>{pageData.slug}</span>
          </div>
        </div>
      </div>
    </>
  );
}
