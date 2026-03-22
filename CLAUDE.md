# GigRate — Claude Instructions

## Project
Mobile-first web app for Uber Eats drivers. Vite + React → Vercel.
See design doc and engineering plan in `~/.gstack/projects/aarondworetzky-imminent-studio/`.

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Stack
- Vite + React (no Next.js)
- localStorage only — no backend, no database
- Deploy: Vercel (`vercel --prod`)
- No external APIs

## Key constraints
- Mobile-first, max content width 480px
- Min touch target 48px on all interactive elements
- Dark mode default, light mode toggle
- JetBrains Mono for all financial numbers (tabular-nums)
- No real-time per-order input — cheat sheet is the decision tool
