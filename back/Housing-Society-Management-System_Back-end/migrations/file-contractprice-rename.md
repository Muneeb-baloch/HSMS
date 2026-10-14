# Migration: File.totalAmount/downPayment → contractPrice (+ ledger-derived downPayment)

**Status:** Completed  
**Date:** 2026-10-14

## Summary
`File.totalAmount` and `File.downPayment` were hand-typed numbers with no DB-level
link to `Plot.plotTotalAmount` or the `Installment` ledger — the root cause of a
price-reconciliation anomaly (see `src/File/models/models-file.ts` history).

- `totalAmount` → renamed to `contractPrice`: still a required, stored Number,
  but now server-snapshotted from `Plot.plotTotalAmount` at booking
  (`fileService.createFile`) and never client-supplied.
- `downPayment` → removed as a stored field entirely. It's now computed from
  the `Installment` ledger (`kind: 'down_payment'` category rows) by
  `fileService.attachFinancials()` and attached to API responses — `0` when
  no such row exists, instead of a free-typed number.
- `balanceAmount` → the stored-field virtual now only holds pre-ledger-generation
  accuracy (`contractPrice`, since no payments exist yet); real post-generation
  balance is computed the same way as `downPayment`.

## Data audit (2026-10-14)
Confirmed via direct query before this landed: 0 `Installment` ledger rows, only
2 `InstallmentCategory` docs ("Down Payment", "Monthly Instalment"), no
`transfers` collection — **no real financial data existed**, only one test
`File` document.

## Backfill performed
Ran `scripts/backfill-file-contractprice.ts` once against the dev DB:
- Found 1 File doc missing `contractPrice`.
- File `"6863325"` (fileRegNo) → `contractPrice` set to `25200` (re-derived
  fresh from its linked Plot's `plotTotalAmount`), **not** carried over from
  the old hand-typed `totalAmount` (`10040`) — that mismatch between the two
  numbers was exactly the anomaly this migration exists to eliminate.
- That same file has no `Installment` ledger yet (predates the atomic booking
  generator) — run the "Generate Installments from Plan" action for it
  manually if its schedule is needed, or re-book a fresh test file to exercise
  the full atomic flow end-to-end.

## Re-running
Safe to re-run `scripts/backfill-file-contractprice.ts` — it only touches File
docs where `contractPrice` is missing, so it's a no-op once every File has
been migrated.
