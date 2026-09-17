---
name: saas-ui-redesign
description: Redesign the Vue 3 client into a modern SaaS interface — collapsible left sidebar replacing the top nav, CSS design tokens, consistent spacing, polished cards and tables. Use this skill when asked to redesign, restyle, modernize, or "make the UI look professional", to replace the top nav bar with a vertical sidebar, or to apply a design system across client/src.
---

# SaaS UI Redesign

Convert this app's top-nav layout into a modern SaaS shell: a collapsible vertical
sidebar on the left, a tokenized color system, and one consistent spacing rhythm
across every view.

This is a **styling and layout** change. No data flow, no API, no filter semantics
change. If a step would alter behavior, stop and flag it instead.

## Hard rules

1. **Delegate every `.vue` file write to the `vue-expert` subagent.** CLAUDE.md
   mandates it: "ANY time you need to create or significantly modify a .vue file,
   you MUST delegate to vue-expert." Give it the token block and the target markup
   from this skill verbatim — do not let it invent a parallel palette.
2. **Never touch `server/`.** This skill only reaches `client/src/`.
3. **No emojis anywhere in the UI.** Icons are inline SVG (see Step 3). Do not add
   an icon dependency — this repo is public and `client/package-lock.json` is
   gitignored on purpose.
4. **Preserve all four filters, i18n, and currency behavior.** Every string stays
   behind `t('...')`; every money value stays behind `formatCurrency`.
5. **Work in phases and verify after each.** Do not rewrite 17 components in one
   pass — Step 6 gives the order.

## Preflight — the ground truth you are changing

Confirm these before editing; they are what makes the redesign non-trivial here.

| Fact | Why it matters |
|---|---|
| `client/src/App.vue` has the **only unscoped `<style>` block** | It is the de-facto global stylesheet: `.card`, `.stat-card`, `.badge`, `.stats-grid`, `.page-header`, and all `table` styling live there. Retokenizing it cascades to every view for free. |
| **464 hardcoded hex literals, 50 distinct, zero CSS variables** across `client/src` | There is no token layer to edit. Step 1 creates one; Step 2 migrates to it. This is the bulk of the work. |
| 15 of 17 `.vue` files use `<style scoped>` | Scoped blocks each repeat the same greys. They must be swept individually (Step 6). |
| `FilterBar.vue` is `position: sticky; top: 70px` | 70px is the old top-nav height. Removing the nav leaves the bar floating in dead space. Must become `top: 0` inside the content column. |
| `App.vue` hardcodes the string `Reports` in its nav | Every other nav label uses `t('nav.*')`. `nav.reports` does not exist in the locales. Step 8 adds it. |
| Nav has 6 links; `views/` has 7 files | `Backlog.vue` is unrouted dead code. Do **not** add it to the sidebar. |
| `ProfileMenu.vue` opens a dropdown | It moves to the sidebar *footer*, so the dropdown must open upward. |

Read `client/src/App.vue` end-to-end before the first edit. It is 486 lines and it is
the spine of this task.

## Target layout

```
EXPANDED (260px)                      COLLAPSED (64px)
+----------------+------------------+ +----+------------------------+
| Catalyst       |  Filter bar      | | C  |  Filter bar            |
| Components     +------------------+ |    +------------------------+
|                |                  | | #  |                        |
| [#] Overview   |   router-view    | | #  |   router-view          |
| [#] Inventory  |                  | | #  |                        |
| [#] Orders     |                  | | #  |                        |
| [#] Finance    |                  | | #  |                        |
| [#] Demand     |                  | | #  |                        |
| [#] Reports    |                  | | #  |                        |
|                |                  | |    |                        |
| --------------  |                  | |    |                        |
| [EN] Language  |                  | | EN |                        |
| [JD] John Doe  |                  | | JD |                        |
| <<  collapse   |                  | | >> |                        |
+----------------+------------------+ +----+------------------------+
```

- Sidebar is `position: fixed`, full height, its own scroll region.
- Content column is offset by `margin-left: var(--sidebar-w)` and the width
  transitions with the sidebar.
- The filter bar becomes the content column's sticky toolbar at `top: 0`.
- There is **no top nav bar** and no separate topbar. Brand, nav, language switcher,
  and profile all live in the sidebar.

## Step 1 — Create the token layer

Add this to the top of `App.vue`'s unscoped `<style>` block. Everything else in the
redesign references these names; no component may reintroduce a raw hex.

```css
:root {
  /* surfaces & ink — zinc ramp */
  --bg:            #fafafa;
  --surface:       #ffffff;
  --surface-2:     #f4f4f5;   /* hover rows, subtle fills */
  --border:        #e4e4e7;
  --border-strong: #d4d4d8;
  --fg:            #18181b;
  --fg-muted:      #71717a;
  --fg-subtle:     #a1a1aa;

  /* accent — indigo */
  --accent:        #4f46e5;
  --accent-hover:  #4338ca;
  --accent-sub:    #eef2ff;   /* active nav pill, info badge bg */
  --accent-fg:     #3730a3;   /* text on --accent-sub */

  /* status — reserved, never reused as a chart series */
  --success:    #16a34a;  --success-bg: #f0fdf4;  --success-fg: #15803d;
  --warning:    #d97706;  --warning-bg: #fffbeb;  --warning-fg: #b45309;
  --danger:     #dc2626;  --danger-bg:  #fef2f2;  --danger-fg:  #b91c1c;

  /* chart series — fixed order, never cycled. See Step 7. */
  --chart-1: #4f46e5;
  --chart-2: #0d9488;
  --chart-3: #d97706;
  --chart-4: #e11d48;
  --chart-5: #a21caf;

  /* spacing rhythm — 4 8 12 16 24 32 48, no other values */
  --sp-1: 0.25rem;  --sp-2: 0.5rem;   --sp-3: 0.75rem;
  --sp-4: 1rem;     --sp-6: 1.5rem;   --sp-8: 2rem;   --sp-12: 3rem;

  /* radius */
  --r-sm: 8px;  --r-md: 10px;  --r-lg: 14px;

  /* elevation — layered 2-stop */
  --shadow-sm: 0 1px 2px rgba(24, 24, 27, 0.04),
               0 1px 3px rgba(24, 24, 27, 0.06);
  --shadow-md: 0 2px 4px rgba(24, 24, 27, 0.04),
               0 8px 16px rgba(24, 24, 27, 0.08);

  /* layout */
  --sidebar-w:           260px;
  --sidebar-w-collapsed: 64px;
}
```

Then point the existing globals at the tokens: `body { background: var(--bg); color: var(--fg); }`,
`.card`/`.stat-card` to `--surface` + `--border` + `--r-md` + `--shadow-sm`, `thead` to
`--surface-2`, `tbody tr:hover` to `--surface-2`.

**Rule from here on: no new hex literal enters `client/src`.** If a value is needed
that no token covers, add a token.

## Step 2 — Color migration map

Apply mechanically. Left column is what is in the repo today; right is its replacement.

| Current | Token | Current | Token |
|---|---|---|---|
| `#0f172a` `#1e293b` | `var(--fg)` | `#10b981` `#059669` | `var(--success)` |
| `#334155` | `var(--fg)` | `#d1fae5` | `var(--success-bg)` |
| `#475569` `#64748b` | `var(--fg-muted)` | `#065f46` | `var(--success-fg)` |
| `#94a3b8` | `var(--fg-subtle)` | `#f59e0b` `#ea580c` | `var(--warning)` |
| `#cbd5e1` | `var(--border-strong)` | `#fed7aa` `#fffbeb` | `var(--warning-bg)` |
| `#e2e8f0` | `var(--border)` | `#92400e` | `var(--warning-fg)` |
| `#f1f5f9` | `var(--surface-2)` | `#ef4444` `#dc2626` | `var(--danger)` |
| `#f8fafc` | `var(--bg)` | `#fecaca` `#fee2e2` `#fef2f2` | `var(--danger-bg)` |
| `white` `#ffffff` | `var(--surface)` | `#991b1b` | `var(--danger-fg)` |
| `#2563eb` `#3b82f6` | `var(--accent)` | `#dbeafe` `#eff6ff` | `var(--accent-sub)` |
| `#1e40af` | `var(--accent-fg)` | `#667eea` `#8b5cf6` | `var(--chart-1)` / `var(--chart-5)` |

Verify the sweep with `grep -rnoE '#[0-9a-fA-F]{3,6}\b' client/src` — the only
survivors should be the token definitions in `App.vue`.

## Step 3 — Build `AppSidebar.vue`

New file `client/src/components/AppSidebar.vue`. Data-driven nav, inline SVG icons,
i18n labels, collapse state from a composable.

```vue
<script setup>
import { useSidebar } from '../composables/useSidebar'
import { useI18n } from '../composables/useI18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ProfileMenu from './ProfileMenu.vue'

const { collapsed, toggle } = useSidebar()
const { t } = useI18n()

// Single source of truth for nav. Order matches the old top-nav tabs.
// Backlog.vue is intentionally absent — it is unrouted.
const navItems = [
  { to: '/',          key: 'nav.overview',       icon: 'grid' },
  { to: '/inventory', key: 'nav.inventory',      icon: 'box' },
  { to: '/orders',    key: 'nav.orders',         icon: 'cart' },
  { to: '/spending',  key: 'nav.finance',        icon: 'coin' },
  { to: '/demand',    key: 'nav.demandForecast', icon: 'trend' },
  { to: '/reports',   key: 'nav.reports',        icon: 'doc' },
]
</script>
```

Requirements for the template:

- Root `<aside class="sidebar" :class="{ collapsed }">`.
- Brand block: full company name via `t('nav.companyName')` when expanded, first
  initial only when collapsed. Subtitle `t('nav.subtitle')` hidden when collapsed.
- Each item is a `<router-link>` with `:title="t(item.key)"` so the collapsed rail
  still has an accessible name. Active state via `$route.path === item.to` (exactly
  how `App.vue` does it today — keep that, don't switch to `router-link-active`,
  because `/` would match everything).
- Active style: `background: var(--accent-sub); color: var(--accent);` plus a 3px
  `var(--accent)` left indicator. No `::after` underline — that was a top-nav idiom.
- Footer, pinned with `margin-top: auto`: `<LanguageSwitcher />`, `<ProfileMenu />`,
  then the collapse toggle button.
- Icons: 20×20 inline `<svg>` with `stroke="currentColor"`, `fill="none"`,
  `stroke-width="1.5"`. Put them in a small `<component>`-less `v-if` chain or a
  local `icons.js` map of path strings — no dependency.
- Label text uses `v-show="!collapsed"` (not `v-if`) so the width transition
  doesn't jump.

Sidebar styling:

```css
.sidebar {
  position: fixed; inset: 0 auto 0 0;
  width: var(--sidebar-w);
  display: flex; flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--sp-4) var(--sp-3);
  transition: width 0.18s ease;
  z-index: 100;
  overflow-y: auto;
}
.sidebar.collapsed { width: var(--sidebar-w-collapsed); }
```

## Step 4 — Rewire the `App.vue` shell

Delete `.top-nav`, `.nav-container`, `.nav-tabs`, `.logo`, `.subtitle` from the
template and from the style block. Replace the shell with:

```vue
<template>
  <div class="app" :class="{ 'sidebar-collapsed': collapsed }">
    <AppSidebar />
    <div class="content">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    <ProfileDetailsModal ... />
    <TasksModal ... />
  </div>
</template>
```

```css
.app { min-height: 100vh; background: var(--bg); }

.content {
  margin-left: var(--sidebar-w);
  transition: margin-left 0.18s ease;
  min-width: 0;            /* REQUIRED — see Pitfalls */
}
.app.sidebar-collapsed .content { margin-left: var(--sidebar-w-collapsed); }

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--sp-6) var(--sp-8);
}
```

Keep the modals and all task handlers in `App.vue` exactly as they are — `ProfileMenu`
still emits `show-profile-details` and `show-tasks` up through `AppSidebar`, so add
those two emits as pass-throughs on the sidebar.

New composable `client/src/composables/useSidebar.js`, matching the module-scope
singleton pattern already used by `useFilters` and `useI18n`:

```js
import { ref, watch } from 'vue'

const collapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')
watch(collapsed, v => localStorage.setItem('sidebar-collapsed', String(v)))

export function useSidebar() {
  return { collapsed, toggle: () => { collapsed.value = !collapsed.value } }
}
```

## Step 5 — Re-seat the filter bar

In `FilterBar.vue`:

- `top: 70px` → `top: 0`.
- `background: #f8fafc` → `var(--surface)`; it now sits on `--bg`, so it needs to
  read as a toolbar, not as page background.
- Keep `position: sticky` and the `z-index` below the sidebar's `100`.
- Gap the filter grid on `var(--sp-4)`, labels in `--fg-muted` at 0.75rem uppercase
  with `letter-spacing: 0.05em`; selects get `--r-sm`, `1px solid var(--border)`,
  and an `:focus-visible` ring of `var(--accent)`.
- Leave every `<option>` value untouched. The values are the API contract
  (`'all'`, `2025-01`, `Q1-2025`, lowercase categories).

## Step 6 — Sweep the scoped styles, in this order

Highest hex count first, so the shared globals settle before the long tail. Verify
the app renders after each group.

1. `views/Dashboard.vue` (57) — the reference view; get spacing right here first
2. `components/TasksModal.vue` (42), `views/Spending.vue` (40)
3. `components/InventoryDetailModal.vue` (38), `components/BacklogDetailModal.vue` (32)
4. `components/CostDetailModal.vue` (27), `views/Demand.vue` (25)
5. `views/Reports.vue` (23), `components/ProductDetailModal.vue` (23)
6. `components/ProfileMenu.vue` (19), `components/ProfileDetailsModal.vue` (17)
7. `views/Inventory.vue` (15), `components/LanguageSwitcher.vue` (12), `components/FilterBar.vue` (12)
8. `views/Orders.vue` (6)

Skip `views/Backlog.vue` — dead code. Mention it in your summary rather than styling it.

Per file: swap hexes per Step 2, snap every `padding`/`margin`/`gap` to the `--sp-*`
scale, snap radii to `--r-*`, and delete any local re-declaration of something the
`App.vue` globals already provide.

**All six modals must get the same treatment** — one overlay style
(`rgba(24, 24, 27, 0.45)`), one panel style (`--surface`, `--r-lg`, `--shadow-md`),
one header/body/footer rhythm. They are the most visible inconsistency in the app today.

## Step 7 — Charts

The SVG charts are hand-rolled in the views. Repoint their fills to `--chart-1..5`
in the fixed order above; never cycle or generate a hue.

This 5-slot palette is **validated** — it passes lightness band, chroma floor,
CVD separation, normal-vision floor, and contrast-vs-white under strict all-pairs
checking (worst pair ΔE 9.4 deutan / 16.6 normal). Do not substitute colors by eye.
If a series must be added, re-run the `dataviz` skill's
`scripts/validate_palette.js` before shipping it.

Mapping that already fits the data:

- Order status (4 series) → `--chart-1` Delivered, `--chart-2` Shipped,
  `--chart-3` Processing, `--chart-4` Backordered.
  *Exception:* where status is communicated as a state rather than a series
  (badges, the low-stock warning), keep the reserved `--success`/`--warning`/`--danger`
  tokens with their text labels.
- Product categories (5) → `--chart-1..5` in the alphabetical order the API returns.

Keep axes and gridlines recessive (`--border`), and keep numeric labels in
`--fg`/`--fg-muted`, never in the series color.

## Step 8 — i18n

`App.vue` currently hardcodes `Reports`. Add the key to **both** locales before the
sidebar references it:

```js
// client/src/locales/en.js  → nav
reports: 'Reports',
collapseSidebar: 'Collapse sidebar',
expandSidebar: 'Expand sidebar',
```

```js
// client/src/locales/ja.js  → nav
reports: 'レポート',
collapseSidebar: 'サイドバーを折りたたむ',
expandSidebar: 'サイドバーを展開',
```

Check the Japanese labels at 260px — `nav.demandForecast` (`需要予測`) and the
company name are the longest strings and must not wrap into two lines.

## Step 9 — Verify

Servers should already be running (`/start` if not: backend `:8001`, frontend `:3000`).
Use the Playwright MCP tools.

1. Visit all six routes: `/`, `/inventory`, `/orders`, `/spending`, `/demand`, `/reports`.
2. On each: screenshot, confirm the active nav item is the right one, confirm no
   horizontal scrollbar on `body`.
3. Toggle collapse on every route; reload and confirm the state persisted.
4. Change each of the four filters and confirm data still updates (the redesign must
   not have broken `useFilters` wiring).
5. Open all six modals; confirm one consistent panel style and that `ProfileMenu`'s
   dropdown opens **upward** from the sidebar footer.
6. Switch to Japanese; re-screenshot the sidebar and the filter bar.
7. `browser_console_messages` must be clean — no new Vue warnings.
8. Resize to 1280 and 1440 and confirm the content column centers correctly.

Note that `/api/tasks` returns 404 on this branch (the endpoint is not implemented),
so the Tasks modal logs a caught fetch error. That is pre-existing — do not try to
fix it here, and do not mistake it for redesign fallout.

## Pitfalls

- **`min-width: 0` on the content column is mandatory.** Without it, the wide
  `.table-container` tables blow out the grid/flex track and the sidebar gets pushed
  off-screen. This is the single most likely way to break the layout.
- **Don't switch active-link detection to `router-link-active`.** `/` is a prefix of
  every route, so Overview would highlight everywhere. Keep `$route.path === item.to`.
- **Don't delete `.stats-grid`, `.card`, `.badge` or the `table` rules** from
  `App.vue`. They are global and every view depends on them. Retokenize in place.
- **Don't renumber or relabel filter `<option>` values.** They are the API contract.
- **Don't "fix" `Reports.vue`'s hardcoded `http://localhost:8001` URLs** as part of
  this work. It is a real problem, but it is not a styling change — report it instead.
- **Keep `formatCurrency` / `formatCurrencyWithDecimals` calls intact.** Replacing a
  call with a raw template string silently breaks JPY.
- Sidebar `z-index: 100` must stay above the sticky filter bar and below the modals.

## Definition of done

- No top nav bar remains in the markup or the styles.
- Sidebar collapses, persists across reload, and is legible in both locales.
- `grep -rnoE '#[0-9a-fA-F]{3,6}\b' client/src` returns only the `:root` tokens.
- Every padding, margin, gap, and radius comes from a `--sp-*` / `--r-*` token.
- All six routes, all four filters, and all six modals verified in the browser.
- No new console warnings.
- Summary states what changed, and separately lists anything found-but-not-fixed
  (e.g. the `/api/tasks` 404, `Backlog.vue` dead code, `Reports.vue` hardcoded URLs).
