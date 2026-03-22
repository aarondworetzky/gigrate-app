# Design System — GigRate

## Product Context
- **What this is:** A mobile-first decision tool for Uber Eats drivers. Generates a personalized cheat sheet (min payout thresholds by distance) and logs post-job data to surface real effective hourly after gas cost.
- **Who it's for:** Renato, Anne, and other gig drivers who don't know their true profitability. California-first (Prop 22 context), expandable to any US market.
- **Space/industry:** Gig economy / financial transparency tools
- **Project type:** Mobile-first web app (Vite + React → Vercel)
- **Reference research:** Gridwise, Hurdlr, Para — all light mode, pastel fintech, interchangeable. GigRate differentiates by being dark-mode first, utilitarian, and built for in-car use.

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — built for work, not lifestyle. Feels like a commercial dashboard.
- **Decoration level:** Minimal — typography and color do all the work. No decorative elements that don't earn their place.
- **Mood:** Immediate, trustworthy, precise. The app should feel like it was built by someone who drives, not someone who designs apps for people who drive.
- **Default mode:** Dark — primary use case is in-car, often at night. Light mode available as user toggle.

## Typography
- **Display/Hero:** Plus Jakarta Sans 800 — geometric, warm, excellent at large sizes. Used for page headings and the cheat sheet card header.
- **Body/UI:** DM Sans 400/500/600 — humanist, highly legible on small mobile screens. Used for all labels, body copy, buttons, form fields.
- **Numbers/Data:** JetBrains Mono 400/600/700 — tabular numerals for all financial data. The effective hourly rendered in JetBrains Mono at 56-64px is the awareness bomb moment. Gives calculated data a sense of precision and weight.
- **Loading:** Google Fonts CDN — Plus Jakarta Sans + DM Sans + JetBrains Mono
- **Scale:**
  - xs: 11px / 0.688rem (metadata, mono labels)
  - sm: 13px / 0.813rem (secondary labels, captions)
  - base: 15px / 0.938rem (body, UI)
  - md: 18px / 1.125rem (subheadings, large labels)
  - lg: 22px / 1.375rem (section headings)
  - xl: 28px / 1.75rem (card headings)
  - 2xl: 48px / 3rem (display)
  - 3xl: 64px / 4rem (awareness bomb number)

## Color

### Dark Mode (default)
- **Approach:** Tricolor accent system on near-black surfaces
- **Background:** #111111
- **Surface:** #1C1C1E
- **Surface elevated:** #242426
- **Border:** #2C2C2E
- **Border strong:** #3A3A3C
- **Purple (brand/interactive):** #A855F7 — used for brand elements, interactive states, section labels, buttons, the cheat sheet card accent
- **Yellow (financial data):** #FACC15 — used for all financial numbers, the awareness bomb number, trajectory output accents, the $/mile figures. References fuel and money. Nobody in gig tools uses it.
- **Green (positive/Take It):** #4ADE80 — Take It button, on-target states, positive readings
- **Red (negative/Skip It):** #EF4444 — Skip It button, below-target states
- **Text primary:** #F2F2F7
- **Text secondary:** #8E8E93
- **Text tertiary:** #48484A

### Light Mode
- **Background:** #F7F6FF (subtly purple-tinted white — shares DNA with dark mode)
- **Surface:** #FFFFFF
- **Surface elevated:** #F0EFFE
- **Border:** #E4E2F5
- **Border strong:** #D4D0EE
- **Purple:** #7C3AED (darkened for contrast on white)
- **Yellow:** #FACC15 — used as BACKGROUND FILL only (chips, card accents, highlight borders). Yellow as text on white fails contrast at any saturation — never use as foreground.
- **Green:** #16A34A
- **Red:** #DC2626
- **Text primary:** #18181B
- **Text secondary:** #71717A
- **Text tertiary:** #D4D4D8

### Light mode yellow rule
Yellow is a surface/background token in light mode, not a text color. Elements that render yellow as text in dark mode switch to purple in light mode. Yellow appears as card border accents, trajectory block backgrounds, and warning alert fills.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — drivers are reading quickly, targets must be large
- **Minimum touch target:** 48px height on all interactive elements
- **Scale:** 2(2px) 4(4px) 8(8px) 12(12px) 16(16px) 24(24px) 32(32px) 48(48px) 64(64px)

## Layout
- **Approach:** Single-column, mobile-first. No multi-column layouts in the core app flow.
- **Max content width:** 480px (centered, phone-sized even on desktop)
- **Grid:** Full-width cards with 16px horizontal padding on mobile
- **Border radius:** sm(6px) md(10px) lg(12px) xl(16px) full(9999px)
- **Card elevation:** Surface background + 1px border. No box shadows in dark mode. Subtle shadow in light mode only.

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(150ms) medium(250ms)
- **One expressive moment:** The awareness bomb number (effective hourly reveal) gets a scale-in animation — transform: scale(0.92) → scale(1) over 200ms ease-out. Everything else is instant or short transitions only.
- **Mode toggle:** 250ms transition on background, border, color properties

## Component Specs

### Cheat Sheet Card
- Border: 1px solid purple (dark) / 1px solid yellow (light)
- Top accent bar: 2px solid purple (dark) / 2px solid yellow (light)
- Screenshot-worthy: isolated from nav, clean background, no UI chrome
- Contains: distance bands with min payout thresholds in JetBrains Mono

### Decision Buttons (Take It / Skip It)
- Full-width, 56px height minimum
- Take It: green-dim background + green border + green text, ALL CAPS, letter-spacing 0.04em
- Skip It: red-dim background + red border + red text, ALL CAPS
- These are the most important interactive elements — never reduce their size

### Trajectory Prompt
- Dark: yellow-dim background, yellow border, yellow accent text
- Light: yellow-dim background, yellow border, dark brown text (#78350F)
- The $/mile figure inside is JetBrains Mono bold, always the largest text in the block

### Awareness Bomb Number
- 64px JetBrains Mono 700, tabular-nums
- Dark: yellow (neutral) / green (on target) / red (below target)
- Light: purple (neutral) / green (on target) / red (below target)
- Scale-in animation on reveal

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-21 | Dark mode as default | Primary use case is in-car, often at night. All competitors are light-mode — differentiates immediately. |
| 2026-03-21 | Tricolor accent: purple + yellow + green | Purple = brand, yellow = money/fuel data, green = positive. Avoids blue/green fintech defaults. |
| 2026-03-21 | Yellow as surface-only in light mode | Yellow text on white fails contrast at any saturation. Yellow becomes background fill in light mode; purple carries the text accent role. |
| 2026-03-21 | JetBrains Mono for all financial numbers | Tabular numerals, precise feel. Unusual for consumer app — makes the effective hourly feel like a verdict, not an estimate. |
| 2026-03-21 | Single-column max-width 480px | Drivers use this on their phone. No clever responsive grids needed. |
| 2026-03-21 | No real-time order input | 15-second Uber window is too short to type. Cheat sheet is the decision tool; logger happens post-job. |
