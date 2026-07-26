# Historical staged-change notes

The issues documented in the original staged changes have been addressed in the current implementation:

- Loan creation reserves available stock atomically.
- Returning, reopening, or deleting a loan updates stock in the same transaction.
- Item quantity validation applies to both creation and updates.
- Seed data initializes available stock and accounts for active loans.
- The schema change is represented by the initial Prisma migration.

The movement module and the stock-detail endpoint were intentionally removed. These are breaking API changes and should be communicated to existing frontend clients.
