import { useState } from "react";
import { PageData, PageItem } from "@/types";
import EditPageLink from "./EditPageLink";
import { Button } from "@/components/ui/button";
import { DragDropProvider } from "@dnd-kit/react";
import { Plus } from "lucide-react";
import { ThemeConfig } from "@/lib/themes";

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
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      const reorderedItems = newItems.map((item, index) => ({
        ...item,
        order: index,
      }));

      onItemsReorder?.(reorderedItems);
    }
  };

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
                alt={pageData.title}
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
        {items && items.length > 0 && (
          <div className="pf-links">
            <DragDropProvider onDragEnd={handleDragEnd}>
              <div className="pf-links__grid">
                {items
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <EditPageLink
                      key={item.id}
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
        )}
      </div>
    </>
  );
}
