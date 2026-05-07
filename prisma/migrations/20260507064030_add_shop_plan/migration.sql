-- CreateTable
CREATE TABLE "ShopPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'none',
    "subscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "billingStartedAt" DATETIME,
    "trialEndsAt" DATETIME,
    "wishlistCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopPlan_shop_key" ON "ShopPlan"("shop");
