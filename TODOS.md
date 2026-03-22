# GigRate — TODOS

## TODO: Gas price staleness prompt
**What:** Show "last updated" date on cheat sheet. If gas price input is >30 days old,
prompt driver to refresh before starting a shift.
**Why:** Stale gas prices mean wrong thresholds — driver accepts jobs that don't cover costs.
**Pros:** Thresholds stay accurate without driver having to remember.
**Cons:** Adds a re-onboarding flow.
**Context:** Cheat sheet is generated once at onboarding. Gas prices in CA fluctuate weekly.
A simple "Generated 35 days ago — prices may have changed. Refresh?" banner is enough.
**Depends on:** Core cheat sheet generator shipped in V1.

## TODO: Prop 22 / true net earnings awareness
**What:** At end of shift, show: gross earned - actual gas cost = true net. Compare to
Prop 22 minimum wage floor ($18.97/hr in 2025, CA only). Flag if net is negative.
**Why:** The real awareness bomb isn't "you made $20" — it's "you made $20 but spent $25
on gas. Net: -$5." That's the moment drivers understand the problem deeply.
**Pros:** Highest emotional impact feature. Could be the viral "screenshot this" moment.
**Cons:** Requires shift-level data (total earned + total miles). Prop 22 figure needs
annual update.
**Context:** Renato already knows Prop 22 minimum exists. The value isn't the wage floor —
it's "did you actually profit tonight after gas?" Show the net, not just the gross.
**Depends on:** Shift summary logging (end-of-shift total earned + total miles).
