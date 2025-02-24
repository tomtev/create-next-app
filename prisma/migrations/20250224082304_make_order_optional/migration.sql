-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "connectedToken" TEXT,
    "tokenSymbol" TEXT,
    "title" VARCHAR(100),
    "description" VARCHAR(500),
    "image" TEXT,
    "pageType" TEXT DEFAULT 'personal',
    "theme" TEXT,
    "themeFonts" JSONB,
    "themeColors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageItem" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT,
    "order" INTEGER,
    "isPlugin" BOOLEAN NOT NULL DEFAULT false,
    "tokenGated" BOOLEAN NOT NULL DEFAULT false,
    "requiredTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "PageItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_walletAddress_idx" ON "Page"("walletAddress");

-- CreateIndex
CREATE INDEX "PageItem_pageId_idx" ON "PageItem"("pageId");

-- AddForeignKey
ALTER TABLE "PageItem" ADD CONSTRAINT "PageItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
