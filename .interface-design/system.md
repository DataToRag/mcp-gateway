# DataToRAG Design System

## Direction

**Who:** Non-technical users (business owners, marketers, team leads) who want their AI assistant to access their data without engineering help.

**Feel:** Calm, warm, trustworthy. Like plugging in a USB cable — simple and confident. Not a developer tool. Not a terminal. A clean control panel with clear switches.

**Domain metaphor:** Connection switches — sources are on or off. The act of connecting should feel like flipping a switch, not configuring a server.

## Depth Strategy

Subtle shadows only. No harsh borders for structure.

- Cards: `shadow-[0_1px_3px_rgba(0,0,0,0.04)]` default, `shadow-[0_8px_24px_rgba(0,0,0,0.06)]` hover
- Modals/dropdowns: `shadow-[0_4px_24px_rgba(0,0,0,0.06)]`
- Borders: `border-border` (warm stone-200) — present but quiet
- No border-heavy layouts, no drop-shadow drama

## Surfaces

Warm off-white base with whisper elevation shifts:

- `--background: #FAFAF8` — base canvas
- `--secondary: #F0EFEB` — elevated surface / muted bg
- `--accent: #F0FDFA` — teal-tinted highlight surface
- `bg-secondary/50` — section backgrounds (how it works, developer snippet)
- Dark code blocks: `bg-[#1C1917]` with `text-[#E7E5E4]`

## Color Tokens

```css
--background: #FAFAF8      /* warm off-white */
--foreground: #1C1917       /* warm near-black (stone-900) */
--primary: #0F766E          /* teal-700 — action, connected, go */
--primary-foreground: #FFF
--secondary: #F0EFEB        /* warm cream */
--secondary-foreground: #44403C  /* stone-700 */
--muted: #F0EFEB
--muted-foreground: #78716C /* stone-500 */
--accent: #F0FDFA           /* teal-50 tint */
--accent-foreground: #0F766E
--border: #E7E5E4           /* stone-200 */
--ring: #0F766E
--destructive: #DC2626
--success: #16A34A
--warning: #D97706
```

## Typography

- **Body:** Inter — clean, modern, friendly, highly readable
- **Display/headings:** Montserrat — personality without quirk
- **Code:** PT Mono
- **Weights:** Inter 400/500/600, Montserrat 500/600/700/800
- **Headings:** font-display (Montserrat), tight tracking, bold/extrabold
- **Body text:** font-sans (Inter), text-sm or text-base, leading-relaxed for descriptions

## Spacing

Base unit: 4px. Scale: 4/8/12/16/20/24/32/48/64.

- Component padding: p-5 or p-6
- Section vertical: py-16 or py-20
- Card gap: gap-5
- Content max-width: max-w-5xl (home), max-w-4xl (detail/dashboard)

## Border Radius

Friendly and rounded:

- `rounded-2xl` (16px) — cards, code blocks, modals
- `rounded-xl` (12px) — icon containers, inset panels
- `rounded-lg` (8px) — buttons, nav items, inputs
- `rounded-full` — badges, pills, step numbers
- `--radius: 0.75rem` (12px) — CSS variable default

## Component Patterns

### Cards (Data Source / Tool)
- `rounded-2xl border border-border bg-background p-6`
- Shadow lift on hover with `-translate-y-0.5`
- Icon: initial letter in `rounded-xl bg-accent` container
- Title transitions to `text-primary` on group hover
- Metadata as `rounded-full bg-accent` pills

### Badges / Pills
- `rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground`
- Or `bg-secondary` for neutral badges

### Code Blocks
- `rounded-2xl border border-border bg-[#1C1917] p-5 font-mono text-sm text-[#E7E5E4]`
- Dark inversion regardless of page theme

### Section Backgrounds
- Alternate between plain `bg-background` and `bg-secondary/50` with `border-y border-border`

### Buttons
- Primary: `bg-primary text-primary-foreground rounded-[var(--radius)] px-6 py-3`
- Secondary/outline: `border border-border text-secondary-foreground rounded-[var(--radius)] px-6 py-3`

### "How it works" Steps
- Numbered circles: `h-8 w-8 rounded-full bg-primary text-primary-foreground`
- Horizontal 3-column grid on sm+

## Terminology

User-facing language avoids technical jargon:

| Internal | User-facing |
|----------|-------------|
| MCP Server | Data Source |
| Tools | Capabilities |
| Active Servers | Connected Sources |
| tool count | X capabilities |
| credits/call | (hide or simplify) |

## Animation

- `fadeInUp`: 0.5s, 12px travel, cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Staggered delays: 0.05s increments per card
- Keep animations subtle — no bounce, no spring
