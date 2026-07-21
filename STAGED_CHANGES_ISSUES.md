# Issues Found in Staged Changes

## Critical Bugs

### 1. Loan return doesn't restore `availableQuantity` 
**File:** `src/modules/loan/loan.service.ts:61-75`
- `updateById`: When `returnDate` is set (loan returned), `item.availableQuantity` should be incremented by `loanQuantity`
- Currently just updates the loan without adjusting inventory

### 2. Loan delete doesn't restore `availableQuantity`
**File:** `src/modules/loan/loan.service.ts:77-79`
- `deleteById`: When deleting an active loan (no `returnDate`), `item.availableQuantity` should be incremented by `loanQuantity`
- Currently just deletes the loan without adjusting inventory

### 3. Item update allows invalid `availableQuantity`
**File:** `src/modules/item/item.service.ts:52-59`
- `updateById` directly passes `data` to Prisma without validating `availableQuantity <= totalQuantity`
- Create validator has this check (`create-item.validator.ts:42-48`), but update doesn't

---

## Breaking Changes (Removed Features)

### 4. Stock check endpoint removed
**Files:** 
- `src/modules/item/item.controller.ts` (removed `getStockById` method)
- `src/modules/item/item.routes.ts` (removed `GET /:id/stock` route)
- `src/modules/item/item.dtos.ts` (removed `ItemStockDTO`)
- `src/modules/item/item.service.ts` (removed `getStockById` method)

### 5. Entire Movement module deleted
**Files deleted:**
- `src/modules/movement/movement.controller.ts`
- `src/modules/movement/movement.dtos.ts`
- `src/modules/movement/movement.routes.ts`
- `src/modules/movement/movement.service.ts`

**Features removed:**
- Movement tracking (audit trail for ENTRADA/SAIDA)
- Manual stock adjustments (ENTRADA/SAIDA via `POST /movement`)
- Loan auto-movements (SAIDA on loan create, ENTRADA on return)
- Listing all movements (`GET /movement`)
- Listing movements by item (`GET /movement/item/:itemId`)

### 6. Prisma schema changes
**File:** `prisma/schema.prisma`
- Removed `MovementType` enum
- Removed `StockMovement` model
- Added `availableQuantity` field to `Item` model with default 0
- Removed `movements` relation from `Item` and `Loan` models
- **Requires migration**

### 7. Language messages for Movement removed
**File:** `src/languages/pt.ts`
- Removed `MOVEMENT.NOT_FOUND.GENERAL`
- Removed `MOVEMENT.VALIDATION.TYPE_REQUIRED`
- Removed `MOVEMENT.VALIDATION.TYPE_INVALID`
- Removed `MOVEMENT.VALIDATION.ITEM_NOT_FOUND`

---

## Missing Validations

### 8. No validation on item update for `availableQuantity <= totalQuantity`
**Fix needed in:** `src/modules/item/item.service.ts:updateById`
- Should validate before updating (reuse logic from `create-item.validator.ts`)

---

## Summary Table

| Issue | Severity | Type | Files Affected |
|-------|----------|------|----------------|
| Loan return doesn't restore stock | Critical | Bug | loan.service.ts |
| Loan delete doesn't restore stock | Critical | Bug | loan.service.ts |
| Item update allows invalid stock | Critical | Bug | item.service.ts |
| Stock check endpoint removed | High | Breaking | item.controller.ts, item.routes.ts, item.dtos.ts, item.service.ts |
| Movement module deleted | High | Breaking | movement/* (4 files), prisma/schema.prisma |
| Language messages removed | Medium | Breaking | src/languages/pt.ts |
| Missing update validation | Medium | Bug | item.service.ts |

---

## Recommended Fixes

1. **Add stock restoration in LoanService:**
   ```typescript
   // In updateById - when returnDate is set
   if (!existing.returnDate && data.returnDate) {
       await itemService.updateById(existing.itemId, {
           availableQuantity: existing.item.availableQuantity + existing.loanQuantity
       });
   }
   
   // In deleteById - for active loans
   const existing = await prisma.loan.findUnique({ where: { id } });
   if (existing && !existing.returnDate) {
       await itemService.updateById(existing.itemId, {
           availableQuantity: existing.item.availableQuantity + existing.loanQuantity
       });
   }
   ```

2. **Add validation in ItemService.updateById:**
   ```typescript
   async updateById(id: number, data: UpdateItemDTO): Promise<ItemDTO> {
       if (data.availableQuantity !== undefined && data.totalQuantity !== undefined) {
           if (data.availableQuantity > data.totalQuantity) {
               throw new Error(MESSAGES.ITEM.VALIDATION.AVAILABLE_QUANTITY_EXCEEDS_TOTAL);
           }
       }
       // ... rest of method
   }
   ```

3. **Run migration after schema changes:**
   ```bash
   npx prisma migrate dev --name add_available_quantity_remove_movement
   ```