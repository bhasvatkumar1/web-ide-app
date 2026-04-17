# Design Brief

## Direction

VS Code Pro — Premium developer environment with exact VS Code aesthetic: deep charcoal sidebar (#1e1e1e ≈ L14.5%), darker editor (#252526 ≈ L12%), electric blue accents (H210°), precise geometry, zero ornamentation.

## Tone

Utilitarian excellence — Developers demand restraint, precision, and intentional color. No decoration, no gradients. Deep focus mode as a design principle.

## Differentiation

Exact VS Code color replication in OKLCH with perfect dark mode execution; activity bar on left with icon-only navigation; status bar at bottom with file info; breadcrumb trail showing hierarchy; custom VS Code-style scrollbars.

## Color Palette

| Token              | OKLCH              | Role                            |
| ------------------ | ------------------ | ------------------------------- |
| background         | 0.12 0 0           | Editor canvas, pure black       |
| foreground         | 0.92 0 0           | Primary text, high contrast     |
| card               | 0.145 0 0          | Sidebar, panels                 |
| primary            | 0.75 0.2 210       | Electric blue accents, focus    |
| accent             | 0.68 0.18 145      | Green activity indicators       |
| muted              | 0.18 0 0           | Secondary surfaces              |
| muted-foreground   | 0.5 0 0            | Disabled text, tertiary info    |
| border             | 0.25 0 0           | Subtle dividers                 |
| destructive        | 0.58 0.19 22       | Error/warning red               |
| sidebar            | 0.145 0 0          | Left sidebar background         |
| sidebar-foreground | 0.92 0 0           | Sidebar text                    |
| sidebar-primary    | 0.75 0.2 210       | Active file indicator           |

## Typography

- Display: Space Grotesk — geometric, clean confidence for headings and UI labels
- Body: DM Sans — excellent small-text readability for editor UI, metadata, tooltips
- Mono: Geist Mono — code rendering, file paths, status bar metrics
- Scale: headings `font-bold tracking-tight`, labels `text-xs font-semibold`, body `text-sm`

## Elevation & Depth

No shadows except subtle 1px definition borders. Surfaces defined by background color lightness difference (editor: L12%, sidebar: L14.5%, card: L18%). Elevation through lightness hierarchy, not depth effects.

## Structural Zones

| Zone        | Background       | Border          | Notes                                          |
| ----------- | ---------------- | --------------- | ---------------------------------------------- |
| Activity    | sidebar (L14.5%) | —               | Icon-only, far left, 40px width, vertical bar |
| Sidebar     | card (L14.5%)    | border (L25%)   | File tree, breadcrumb, collapsible animation  |
| Editor      | background (L12%) | border (L25%)   | Tabs, code area, minimap on right             |
| Status      | card (L14.5%)    | border-t (L25%) | File info, cursor pos, metrics, far right     |

## Spacing & Rhythm

Compact 4px base unit with 2px micro-spacing inside components; 8px padding for sidebar items; 12px gaps between major sections. Activity bar icons 40px square. Editor tabs 36px height. Status bar 28px height. Breadcrumb text-xs with 4px separator gaps. Density matches VS Code's professional workbench.

## Component Patterns

- **Activity icon**: 40px square, rounded-none, text-primary on hover, ::before left border on active
- **File tree item**: 28px height, 2px horizontal padding, hover: bg-muted/30, text-primary when active
- **Editor tab**: border-b-2 border-transparent, hover: bg-muted/30, active: border-primary text-primary
- **Status bar item**: text-xs text-muted-foreground, gap-3 between groups
- **Breadcrumb**: text-xs, separator '/', gap-1 between items

## Motion

- Tab/file selection: `transition-smooth` (0.3s cubic-bezier); hover states immediate visual feedback
- Sidebar toggle: `slide-in-left` / `slide-out-left` (0.3s ease-out)
- Activity indicator pulse: `pulse-subtle` (2s infinite) for unsaved/modified states
- No bounce, no overshoot — professional precision

## Constraints

- Border-radius: 0, 2px, 4px only (no rounded-lg defaults)
- No transparency layers in dark mode (use background lightness instead)
- All color tokens via CSS variables (no arbitrary #hex or rgb)
- Icons monochrome, 18-24px, text-current color inheritance
- Keyboard-first interaction (Tab, Enter, Escape, Ctrl+K for search)

## Signature Detail

Custom VS Code-style scrollbars (10px wide, rounded-xs, subtle color with hover state) — small detail that completes the developer tool aesthetic and signals production polish.
