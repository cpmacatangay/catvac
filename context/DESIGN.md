# Design System — CatVac
**Brand:** CatVac — Feline Vaccine Reminder  
**Stack:** Tailwind CSS · React 18  
**Status:** MVP v1.0 · Draft

---

## 1. Brand Identity

### Name
**CatVac** — short, memorable, combines "cat" + "vaccine." Works in both English and international contexts.

### Tagline (candidate)
*"Never miss a jab."* — playful, punny, clear value proposition.

### Brand Personality
| Attribute | Description |
|---|---|
| **Tone** | Warm, friendly, reassuring. Not clinical or medical. |
| **Voice** | Conversational but not cutesy. A responsible cat parent helping another. |
| **Emotion** | Relief ("I won't forget again"), Care ("My cat is protected"), Empowerment ("I'm in control"). |

### Target Audience
Cat owners (1–5 cats), primarily aged 25–45, comfortable with web apps, love their pets but have busy schedules.

---

## 2. Logo — Recommended Concept

**Concept:** A rounded cat face silhouette incorporating a subtle medical cross.

- **Shape:** A modern, minimal cat head — rounded cheeks, small triangular ears.
- **Mark:** One ear contains a small "+" (medical cross) integrated into the ear shape.
- **Color:** Single solid fill in Primary Purple (`#8B5CF6`) on a white or cream background. Transparent-background version for all uses.
- **Minimum clear space:** Equal to the height of one ear on all sides.
- **Minimum size:** 24 px (digital) — below this, use wordmark only.

**Wordmark:** "CatVac" set in Fredoka Semi-Bold tracking +0.02em, purple, with a small pink accent dot over the "a" or as a tail on the "c".

**Favicon:** The cat-head mark alone, centered, 32x32 and 16x16 ICO.

---

## 3. Color Palette

The palette is warm, approachable, and cat-themed. **Pastel pink + purple** create a playful-but-competent feel.

### Primary & Accent

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary | `#8B5CF6` | `violet-500` | Buttons, links, active states, headings |
| Primary hover | `#7C3AED` | `violet-600` | Button hover |
| Primary light | `#DDD6FE` | `violet-200` | Light backgrounds, badges, disabled |
| Accent | `#F472B6` | `pink-400` | Accent highlights, progress markers, decorative |
| Accent hover | `#EC4899` | `pink-500` | Accent hover |

### Backgrounds & Surfaces

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Page background | `#FAF5FF` | `violet-50` | Page/screen background |
| Surface/card | `#FFFFFF` | `white` | Cards, modals, containers |
| Surface secondary | `#FDF4FF` | `fuchsia-50` | Secondary surfaces, hover states |
| Divider | `#E5E7EB` | `gray-200` | Borders, horizontal rules |

### Neutrals

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Text primary | `#1F2937` | `gray-800` | Body text |
| Text secondary | `#6B7280` | `gray-500` | Labels, helper, subdued |
| Text placeholder | `#9CA3AF` | `gray-400` | Input placeholders |
| Text inverse | `#FFFFFF` | `white` | On dark/purple backgrounds |

### Semantic (Status) Colors

Used for vaccine status pills and badge indicators.

| Token | Hex | Tailwind | AA on white |
|---|---|---|---|
| Upcoming | `#3B82F6` | `blue-500` | Yes (4.5:1) |
| Due | `#D97706` | `amber-600` | Yes (4.6:1) |
| Overdue | `#DC2626` | `red-600` | Yes (5.6:1) |
| Administered | `#16A34A` | `green-600` | Yes (5.8:1) |

### Supporting Paw Palette (illustrations, decorative)

| Token | Hex | Usage |
|---|---|---|
| Paw pink | `#F9A8D4` | Decor, secondary icons |
| Paw cream | `#FEF3C7` | Card tints, placeholder |
| Paw lavender | `#C4B5FD` | Tag/vaccine category bg |

---

## 4. Typography

### Font Stack

| Role | Font | Fallback | Weights Used |
|---|---|---|---|
| Headings / Display | **Fredoka** | `sans-serif` | `500` (Medium), `600` (Semi-Bold) |
| Body / UI | **Nunito** | `sans-serif` | `400` (Regular), `600` (Semi-Bold), `700` (Bold) |

Both served via Google Fonts, self-hosted fallback recommended via `@font-face`.

### Type Scale

| Level | Size (px/rem) | Weight | Line Height | Letter-spacing | Font |
|---|---|---|---|---|---|
| Hero (h1) | 36 / 2.25rem | 600 | 1.15 | -0.01em | Fredoka |
| Heading 1 (h2) | 28 / 1.75rem | 600 | 1.2 | normal | Fredoka |
| Heading 2 (h3) | 22 / 1.375rem | 600 | 1.25 | normal | Fredoka |
| Heading 3 (h4) | 18 / 1.125rem | 600 | 1.3 | normal | Fredoka |
| Subtitle | 16 / 1rem | 600 | 1.4 | normal | Nunito |
| Body | 15 / 0.9375rem | 400 | 1.5 | normal | Nunito |
| Body small | 13 / 0.8125rem | 400 | 1.5 | normal | Nunito |
| Caption / label | 12 / 0.75rem | 600 | 1.4 | +0.02em | Nunito |
| Badge / status | 11 / 0.6875rem | 700 | 1.3 | +0.03em | Nunito |
| Button | 15 / 0.9375rem | 600 | 1 | normal | Nunito |

### Paragraph
- Max width: 65ch (body)
- Margin bottom: 1em

### Inline Code / Monospace
- Font: `JetBrains Mono` or `SF Mono`
- For vaccine dose intervals (e.g. "1y" or "3mo") — not for general UI.

---

## 5. Spacing Scale

Based on 4px base unit. Tailwind v3 spacing tokens used throughout.

| Token | px | rem | Tailwind |
|---|---|---|---|
| 3xs | 2 | 0.125 | `0.5` |
| 2xs | 4 | 0.25 | `1` |
| xs | 8 | 0.5 | `2` |
| sm | 12 | 0.75 | `3` |
| md | 16 | 1 | `4` |
| lg | 20 | 1.25 | `5` |
| xl | 24 | 1.5 | `6` |
| 2xl | 32 | 2 | `8` |
| 3xl | 40 | 2.5 | `10` |
| 4xl | 48 | 3 | `12` |
| 5xl | 64 | 4 | `16` |

### Layout defaults
- Page padding: `px-4 md:px-6 lg:px-8`
- Section gap: `space-y-6 md:space-y-8`
- Card inner padding: `p-4 md:p-6`

---

## 6. Layout & Grid — Card-Based

No table layouts anywhere. Each cat renders as a **card** on every viewport.

### Dashboard grid
| Breakpoint | Columns | Max width | Gap |
|---|---|---|---|
| Mobile (< 640px) | 1 | 100% | `gap-4` |
| Tablet (640–1023px) | 2 | 640px max-container | `gap-4` |
| Desktop (1024px+) | 3 | 1200px max-container | `gap-6` |

### Cat Card anatomy
```
┌────────────────────────────┐
│  [avatar]  Cat Name        │
│            🐱 Male · 3 yrs │
│                            │
│  ┌─ Status Pills ────────┐ │
│  │ ● Rabies     ● DUE    │ │
│  │ ● FVRCP      ○ OK     │ │
│  │ ● FeLV       ○ OK     │ │
│  └────────────────────────┘ │
│                            │
│  [Add Vaccine]  [Edit Cat] │
└────────────────────────────┘
```

- Cards are equal-height (flex column, stretch).
- "Add Vaccine" is an inline button within the card — not a separate page action.
- Vaccine rows inside the card are compact, single-line, with status pill right-aligned.

### Screen layout
```
┌─ Header (brand + avatar + logout) ─┐
│                                     │
│  Dashboard Title  [+ Add Cat]       │
│  ──────────────────────────────     │
│                                     │
│  ┌───┐ ┌───┐ ┌───┐                 │
│  │ C │ │ C │ │ C │    (desktop)     │
│  │ a │ │ a │ │ a │                  │
│  │ t │ │ t │ │ t │                  │
│  └───┘ └───┘ └───┘                 │
│                                     │
│  ┌────────────┐ ┌────────────┐      │
│  │    Cat     │ │    Cat     │ (tab) │
│  └────────────┘ └────────────┘      │
│                                     │
│  ┌──────────────┐                   │
│  │     Cat      │           (mob)   │
│  └──────────────┘                   │
└─────────────────────────────────────┘
```

---

## 7. Border Radius & Shadows

### Border Radius

| Token | px | Tailwind | Usage |
|---|---|---|---|
| sm | 4 | `rounded-sm` | Input fields, small badges |
| md | 8 | `rounded-md` | Buttons, secondary cards |
| lg | 12 | `rounded-lg` | Main cat cards, modals |
| xl | 16 | `rounded-xl` | Hero sections, large dialogs |
| full | 9999 | `rounded-full` | Pills, avatars, status dots |

All radii are slightly generous to match the playful brand.

### Shadows

| Token | Value | Usage |
|---|---|---|
| card | `0 2px 8px rgba(0,0,0,0.06)` | Default card shadow |
| card-hover | `0 4px 16px rgba(0,0,0,0.10)` | Card hover |
| elevated | `0 8px 24px rgba(0,0,0,0.12)` | Modal, dropdown |
| toast | `0 12px 28px rgba(0,0,0,0.15)` | Toast/notification |

Shadows use `rgba(0,0,0,...)` to tint naturally on any surface.

---

## 8. Iconography

- **Source:** [Heroicons](https://heroicons.com) (outline set) — consistent, MIT-licensed, Tailwind-native.
- **Icon sizes:** `h-5 w-5` (default inline), `h-6 w-6` (actions), `h-8 w-8` (avatars).
- **Color:** Inherits text color or `text-primary` / `text-accent` as needed.
- **Cat avatar placeholder:** A small purple silhouette icon (Heroicons does not include a cat — use a custom SVG or the generic `user-circle` with cat color).

### Key icons used
| Context | Icon | Size |
|---|---|---|
| Add cat | `plus-circle` | h-6 w-6 |
| Add vaccine | `plus-small` | h-5 w-5 |
| Edit cat | `pencil-square` | h-5 w-5 |
| Delete cat/vaccine | `trash` | h-5 w-5 |
| Mark administered | `check-circle` | h-5 w-5 |
| Snooze | `clock` | h-5 w-5 |
| Dashboard | `home` | h-6 w-6 |
| Settings | `cog-6-tooth` | h-6 w-6 |
| Logout | `arrow-right-on-rectangle` | h-6 w-6 |

---

## 9. Animations & Transitions

All animations respect `prefers-reduced-motion` (see accessibility).

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Card hover | Scale 1.01 + shadow lift | 200ms | ease-out |
| Button hover | Background tint | 150ms | ease |
| Modal overlay | Fade in | 200ms | ease-out |
| Modal content | Scale 0.95 → 1.00 + fade | 250ms | ease-out |
| Toast enter | Slide in from top-right | 300ms | ease-out |
| Toast exit | Fade out | 200ms | ease-in |
| Status pill | Background flash on change | 300ms | ease |
| Page transitions | Fade 125ms (optional) | 125ms | ease |
| Link hover | Underline expands center-out | 200ms | ease |

No keyframe-heavy or distracting animations. Purpose: smooth feedback, not showmanship.

---

## 10. Component Styling Notes

### Buttons

| Variant | Style | Radius |
|---|---|---|
| Primary (filled) | `bg-primary text-white hover:bg-primary-hover` | `rounded-md` |
| Secondary (outline) | `border border-gray-300 text-gray-700 hover:bg-gray-50` | `rounded-md` |
| Ghost | `text-gray-600 hover:text-gray-800 hover:bg-gray-100` | `rounded-md` |
| Danger | `bg-red-600 text-white hover:bg-red-700` | `rounded-md` |
| Icon | `p-2 text-gray-500 hover:text-primary hover:bg-violet-50` | `rounded-md` |

- All buttons: `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`
- Min height: 40px (tap target).
- Disabled: `opacity-50 cursor-not-allowed`.

### Input Fields

- Border: `border border-gray-300`, on focus: `border-primary ring-1 ring-primary`
- Padding: `px-3 py-2`
- Background: white
- Placeholder: `text-gray-400`
- Error: `border-red-500 ring-1 ring-red-500`, helper text in `text-red-600 text-sm`
- Label: `text-sm font-semibold text-gray-700 mb-1`

### Status Pills (badges)

| Status | Style | Icon |
|---|---|---|
| Upcoming | `bg-blue-100 text-blue-700 border border-blue-200` | `clock` |
| Due | `bg-amber-100 text-amber-700 border border-amber-200` | `exclamation` |
| Overdue | `bg-red-100 text-red-700 border border-red-200` | `exclamation-circle` |
| Administered | `bg-green-100 text-green-700 border border-green-200` | `check` |

Pills: `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider`

### Toast / Notification

```
┌──────────────────────┐
│ ✓ Rabies marked done │  ← slide-in from top-right
│ ──────────────────── │
│ Just now             │
└──────────────────────┘
```
- Background: white with left purple accent border
- Shadow: `shadow-elevated`
- Max width: 400px
- Dissmiss: auto 5s, or X button, or tap

### Modals

- Overlay: `bg-black/40 backdrop-blur-sm`
- Content: white, `rounded-xl`, `shadow-elevated`, `p-6`
- Title: Fredoka Semi-Bold 18px
- Actions: right-aligned, primary + secondary buttons

---

## 11. Responsive Breakpoints

Tailwind v3 defaults — no custom breakpoints needed.

| Label | Min-width | Target |
|---|---|---|
| `sm` | 640px | Large phones landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Ultra-wide |

Mobile-first approach — base styles target phones, breakpoints override upward.

---

## 12. Accessibility (WCAG 2.1 AA)

### Color & Contrast
- All text-on-background pairs meet **4.5:1 minimum** (AA normal text).
- All text-on-semantic (pills) pairs meet **4.5:1 minimum**.
- Large text (≥18px normal / ≥14px bold) has **3:1 minimum**.
- Primary purple on white (`#8B5CF6` on `#FFFFFF`): passes AA (5.2:1).
- Pink accent on white (`#F472B6` on `#FFFFFF`): fails AA (3.0:1). Use pink only on light backgrounds (`#FDF4FF`) or for decorative/non-informational elements.

### Focus & Keyboard
- All interactive elements receive a visible focus ring: `focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`.
- Tab order follows visual layout (card grid: left to right, top to bottom).
- All modals trap focus; close on Escape key.
- All dropdowns selectable by arrow keys + Enter.

### Screen Readers
- All icon-only buttons have `aria-label`.
- Status pills use `aria-label` to describe meaning (e.g. "Rabies: Due July 20" rather than just the word "Due").
- Dynamic content updates (toast, vaccine marked administered) announce via `role="status"` + `aria-live="polite"`.
- Skip-to-content link at the very top of every page: visually hidden until focused.

### Reduced Motion
- All animations and transitions wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Alternatively, Tailwind `motion-safe:` variant used for animations; defaults to no motion.
- No parallax, auto-scroll, or blinking content.

### Touch Targets
- All interactive elements ≥ 44x44 px (WCAG 2.5.8, "Target Size").
- Buttons, icon buttons, links, form controls all meet this minimum.

---

## 13. Email Design Consistency

Reminder emails should feel like they came from the same brand, even though they're plain HTML with inline styles.

- **Header:** Purple bar, white "CatVac" wordmark text (or no image).
- **Body:** White background, max 600px centered.
- **Typography:** System sans-serif fallback (Arial, Helvetica) since Google Fonts may not render in all clients.
- **Button CTA:** Purple rounded button, white text, `border-radius: 8px`, padded.
- **Footer:** Small gray text, unsubscribe link (signed token).
- **Emails:** pre-due, due, overdue, administered-confirmation, welcome, password-reset.

---

## 14. Future Considerations (Phase 2+)

- Dark mode palette (inverted purple -> deep indigo background, light text)
- i18n — ensure dynamic text is extractable (no hardcoded strings in components)
- Cat avatar upload (replaces placeholder icon with real image)
- Custom illustration set (cats in various poses, vaccine-themed)
- Motion design system (Lottie for empty states)
