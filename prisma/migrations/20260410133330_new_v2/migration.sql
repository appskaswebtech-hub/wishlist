-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StoreSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "showShareButton" BOOLEAN NOT NULL DEFAULT true,
    "showItemCount" BOOLEAN NOT NULL DEFAULT true,
    "maxItemsPerList" INTEGER NOT NULL DEFAULT 50,
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "showPrice" BOOLEAN NOT NULL DEFAULT true,
    "showAddToCart" BOOLEAN NOT NULL DEFAULT true,
    "showVendor" BOOLEAN NOT NULL DEFAULT false,
    "gridColumns" INTEGER NOT NULL DEFAULT 4,
    "iconStyle" TEXT NOT NULL DEFAULT 'heart',
    "activeColor" TEXT NOT NULL DEFAULT '#e74c6f',
    "headerIconEnabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StoreSettings" ("id", "maxItemsPerList", "showItemCount", "showShareButton", "storeId") SELECT "id", "maxItemsPerList", "showItemCount", "showShareButton", "storeId" FROM "StoreSettings";
DROP TABLE "StoreSettings";
ALTER TABLE "new_StoreSettings" RENAME TO "StoreSettings";
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
