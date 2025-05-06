-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "productCode" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "size" TEXT,
    "portalDescription" TEXT,
    "totalStock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "portalDesc" TEXT,
    "productLine" TEXT NOT NULL,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "primaryPackageQty" INTEGER,
    "description" TEXT NOT NULL,
    "modelCode" TEXT,
    "closedLength" DOUBLE PRECISION,
    "closedWidth" DOUBLE PRECISION,
    "primaryPackageWeight" DOUBLE PRECISION,
    "closedDepth" DOUBLE PRECISION,
    "primaryPackageType" TEXT,
    "paperType" TEXT DEFAULT 'Outro',
    "packagingType" TEXT DEFAULT 'Outra',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_productCode_key" ON "Product"("productCode");
