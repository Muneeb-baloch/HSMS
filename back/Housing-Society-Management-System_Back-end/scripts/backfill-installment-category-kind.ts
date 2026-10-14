/**
 * Backfills `InstallmentCategory.kind` for any existing category documents
 * created before the `kind` enum was added (down_payment | installment |
 * possession_fee | legal_fee | other). Matches by `instCatName` against the
 * same canonical names used in `DEFAULT_INSTALLMENT_CATEGORIES`
 * (src/Installment/types/types-installment-category.ts) so it stays correct
 * if more categories are added later. Anything that doesn't match a known
 * name is left on the schema default (`other`) and logged for manual review.
 *
 * Idempotent — safe to re-run; only touches docs where `kind` is unset.
 *
 * Usage: npx tsx scripts/backfill-installment-category-kind.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import InstallmentCategory, {
  InstallmentCategoryKind,
} from '../src/Installment/models/models-installment-category';
import { DEFAULT_INSTALLMENT_CATEGORIES } from '../src/Installment/types/types-installment-category';

dotenv.config();

const KIND_BY_NAME = new Map(
  DEFAULT_INSTALLMENT_CATEGORIES.map(c => [c.instCatName.toLowerCase(), c.kind])
);

// Fallback keyword matching for real-world name variants that don't exactly
// match the seed list (e.g. British "Instalment" vs seeded "Installment").
// Order matters — more specific keywords first.
const KEYWORD_FALLBACKS: Array<[RegExp, InstallmentCategoryKind]> = [
  [/down/i, InstallmentCategoryKind.DOWN_PAYMENT],
  [/transfer/i, InstallmentCategoryKind.OTHER], // never installment/down_payment — Transfer module owns this money
  [/possession/i, InstallmentCategoryKind.POSSESSION_FEE],
  [/legal/i, InstallmentCategoryKind.LEGAL_FEE],
  [/month|install?ment|balloon|quarterly/i, InstallmentCategoryKind.INSTALLMENT],
];

function resolveKind(instCatName: string): { kind: InstallmentCategoryKind; via: string } {
  const exact = KIND_BY_NAME.get(instCatName.toLowerCase());
  if (exact) return { kind: exact, via: 'exact seed-name match' };

  for (const [pattern, kind] of KEYWORD_FALLBACKS) {
    if (pattern.test(instCatName)) return { kind, via: `keyword match /${pattern.source}/` };
  }

  return { kind: InstallmentCategoryKind.OTHER, via: 'no match, defaulted' };
}

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/hsms';
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}\n`);

  const categories = await InstallmentCategory.find({
    $or: [{ kind: { $exists: false } }, { kind: null }],
  });

  console.log(`Found ${categories.length} category doc(s) missing kind.\n`);

  let updated = 0;
  const needsReview: string[] = [];

  for (const category of categories) {
    const { kind, via } = resolveKind(category.instCatName);
    category.kind = kind;
    await category.save();
    console.log(`  "${category.instCatName}" -> kind: ${kind} (${via})`);
    updated++;
    if (via === 'no match, defaulted') {
      needsReview.push(category.instCatName);
    }
  }

  console.log(`\nUpdated ${updated} doc(s).`);
  if (needsReview.length > 0) {
    console.log(`No match found, defaulted to "other" — verify these manually: ${needsReview.join(', ')}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
