-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "orderPublicId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "status" TEXT NOT NULL,
    "confirmationUrl" TEXT,
    "createRaw" TEXT,
    "webhookRaw" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "confirmationUrl", "createRaw", "createdAt", "currency", "id", "orderId", "orderPublicId", "provider", "providerPaymentId", "status", "updatedAt", "webhookRaw") SELECT "amount", "confirmationUrl", "createRaw", "createdAt", "currency", "id", "orderId", "orderPublicId", "provider", "providerPaymentId", "status", "updatedAt", "webhookRaw" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_orderPublicId_idx" ON "Payment"("orderPublicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
