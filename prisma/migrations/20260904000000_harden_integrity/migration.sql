ALTER TABLE "User"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Client"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Item"
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Loan"
    ADD COLUMN "createdById" INTEGER,
    ADD COLUMN "returnedById" INTEGER,
    ADD COLUMN "cancelledAt" TIMESTAMP(3),
    ADD COLUMN "cancelledById" INTEGER,
    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Item"
    ADD CONSTRAINT "Item_totalQuantity_nonnegative" CHECK ("totalQuantity" >= 0),
    ADD CONSTRAINT "Item_availableQuantity_valid" CHECK (
        "availableQuantity" >= 0 AND "availableQuantity" <= "totalQuantity"
    );

ALTER TABLE "Loan"
    ADD CONSTRAINT "Loan_quantity_positive" CHECK ("loanQuantity" > 0),
    ADD CONSTRAINT "Loan_dueDate_valid" CHECK ("dueDate" >= "loanDate"),
    ADD CONSTRAINT "Loan_returnDate_valid" CHECK (
        "returnDate" IS NULL OR "returnDate" >= "loanDate"
    );

ALTER TABLE "Loan"
    ADD CONSTRAINT "Loan_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Loan_returnedById_fkey"
        FOREIGN KEY ("returnedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Loan_cancelledById_fkey"
        FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "AuthToken_refreshTokenHash_key" ON "AuthToken"("refreshTokenHash");
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");
CREATE UNIQUE INDEX "User_email_lower_key" ON "User"(LOWER("email"));
CREATE UNIQUE INDEX "Client_email_lower_key" ON "Client"(LOWER("email"));
CREATE INDEX "Item_category_idx" ON "Item"("category");
CREATE INDEX "Item_location_idx" ON "Item"("location");
CREATE INDEX "Loan_clientId_idx" ON "Loan"("clientId");
CREATE INDEX "Loan_itemId_idx" ON "Loan"("itemId");
CREATE INDEX "Loan_dueDate_idx" ON "Loan"("dueDate");
CREATE INDEX "Loan_returnDate_idx" ON "Loan"("returnDate");
CREATE INDEX "Loan_cancelledAt_idx" ON "Loan"("cancelledAt");
CREATE INDEX "Loan_active_dueDate_idx" ON "Loan"("dueDate")
    WHERE "returnDate" IS NULL AND "cancelledAt" IS NULL;

CREATE TABLE "InventoryAdjustment" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "previousTotal" INTEGER NOT NULL,
    "newTotal" INTEGER NOT NULL,
    "previousAvailable" INTEGER NOT NULL,
    "newAvailable" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryAdjustment_values_valid" CHECK (
        "previousTotal" >= 0 AND "newTotal" >= 0
        AND "previousAvailable" >= 0 AND "previousAvailable" <= "previousTotal"
        AND "newAvailable" >= 0 AND "newAvailable" <= "newTotal"
    )
);

ALTER TABLE "InventoryAdjustment"
    ADD CONSTRAINT "InventoryAdjustment_itemId_fkey"
        FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT "InventoryAdjustment_actorId_fkey"
        FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "InventoryAdjustment_itemId_createdAt_idx"
    ON "InventoryAdjustment"("itemId", "createdAt");
CREATE INDEX "InventoryAdjustment_actorId_idx" ON "InventoryAdjustment"("actorId");
