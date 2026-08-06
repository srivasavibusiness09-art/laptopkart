# Plan: Rebrand Storefront Accent from Lime Green to Sky Blue

## Goal
Replace the lime-green brand accent (`#76C227` family) with sky/azure blue across the storefront, keeping the emerald `#10B981` for semantic success/status states only (Order Placed, Completed, Approved, success toasts).

## Rationale (Color Theory)
Cream `#F5F2EE` is a warm neutral. Replacing the lime green with sky/azure blue creates a complementary-cool balance. Blue signals trust, reliability, and technology — the exact messaging a refurbished-laptop brand needs (certified, inspected, warrantied). It also unifies the storefront with the admin panel, which already runs cyan/blue (`#38BDF8`), producing one cohesive brand identity.

## Assumptions
- Emerald `#10B981` is kept ONLY for semantic success/status states (Order Placed, Completed, Approved, success toasts). It is NOT part of the brand accent.
- The admin panel is already blue and requires no changes.
- ~95% of green flows through CSS variables and the `COLORS` map, so a token-level swap covers nearly everything. Only ~19 hardcoded hex/rgba spots need manual edits.

## New Palette

### Light theme (on cream `#F5F2EE`)
| Token | Old | New | Notes |
|---|---|---|---|
| `--accent` | `#76C227` | `#0EA5E9` | links, icons, highlights (sky-500) |
| `--accent-2` | `#68b92b` | `#0284C7` | buttons, gradients, selected states (sky-600; darker = white-text contrast) |
| `--accent-3` | `#8BC34A` | `#7DD3FC` | light tints (sky-300) |
| `--success` | `#76C227` | `#0EA5E9` | |

### Dark theme (on navy `#040712`)
| Token | Old | New | Notes |
|---|---|---|---|
| `--accent` | `#76C227` | `#38BDF8` | brighter for dark surfaces (sky-400) |
| `--accent-2` | `#68b92b` | `#0EA5E9` | |
| `--accent-3` | `#8BC34A` | `#7DD3FC` | |
| `--success` | `#76C227` | `#0EA5E9` | |

## Implementation Steps

### 1. `src/styles/globals.css`
Swap the accent/success tokens in BOTH the light block (lines 34–37 and 57) and the dark block (lines 106–108 and 120).

### 2. `src/data/products.ts` (COLORS map)
`green` / `greenDark` / `primary` already map to `--success` / `--accent-2` / `--accent-2`, so they pick up the blue automatically. No change needed.

### 3. Hardcoded lime greens (~19 spots → sky blue `rgba(2,132,199,…)`)
- `src/components/Homepage.tsx` — 8× `rgba(118,194,39,…)`, 1× `rgba(104,185,43,…)`
- `src/components/CartPage.tsx` — 3× `rgba(118,194,39,…)`
- `src/components/ProductDetail.tsx` — 1× `rgba(118,194,39,…)`

### 4. Dark-green video surfaces → deep navy (`src/components/Homepage.tsx`)
| Old | New |
|---|---|
| `#0B3B2E` | `#082F49` |
| `#14532D` | `#0C4A6E` |
| `#0F766E` | `#0369A1` |

Applies to the video poster fallback gradient, the video error state, and the banner backgrounds.

### 5. Brand gradients
`var(--accent) → #6366F1` in `src/components/Navbar.tsx` (line ~112) and `src/components/Footer.tsx` (line ~126) become blue→indigo automatically once the token changes. No manual edit required.

### 6. Admin panel
No changes — already cyan/blue. The `--green: #38BDF8` token is misnamed but blue. Emerald status colors are retained.

### 7. Verification
- Storefront: `npx tsc --noEmit`
- Admin: `cd admin && npm run build`
- Visual check of the hero, video banner, buttons, and checkout flow.

## Scope Summary
- Files touched: ~6 (globals.css + 3 component files, plus verification)
- Total edits: ~25, all mechanical token/hex swaps
- Deliberately unchanged: emerald `#10B981` success/status colors, admin panel colors, brand indigo `#6366F1`
