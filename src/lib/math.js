/**
 * GigRate — core math
 * All functions are pure (no side effects) for easy testing.
 */

/** Cost per mile in dollars */
export function costPerMile({ type, mpg, gasPrice, miPerKwh, electricityRate }) {
  if (type === 'ev') {
    const eff = miPerKwh > 0 ? miPerKwh : 1
    return electricityRate / eff
  }
  const m = mpg > 0 ? mpg : 1
  return gasPrice / m
}

/**
 * Minimum payout to break even on a job, given a target hourly.
 * min = fuel_cost + (target_hourly * duration_hours)
 */
export function minPayoutForJob({ miles, durationMin, cpm, targetHourly }) {
  const fuelCost = miles * cpm
  const timeCost = targetHourly * (durationMin / 60)
  return fuelCost + timeCost
}

/**
 * Generate cheat sheet rule bands.
 * Bands: 0-3, 3-7, 7-15, 15+ miles
 * Average speed assumed 20 mph in urban delivery context.
 *
 * Each band returns:
 *   label       — display string e.g. "0 – 3 miles"
 *   minMiles    — band lower bound
 *   maxMiles    — band upper bound
 *   gasCost     — fuel cost for the mid-point distance (cpm * midMiles)
 *   minPayout   — minimum payout to accept (fuel + time value)
 *   appShowsLow — minPayout (app shows at least this)
 *   appShowsHigh — minPayout + typical tip ceiling for this band
 *   skip        — true for the 15+ band (flag to render "skip it" instead)
 */
export function generateCheatSheet({ cpm, targetHourly }) {
  const AVG_SPEED_MPH = 20

  // Typical tip ranges seen in Uber Eats notifications by distance band.
  // These are the *additional* amounts above base pay shown in the app.
  const bands = [
    { label: '0 – 3 mi',  minMiles: 0,  maxMiles: 3,  tipRange: [2, 4]  },
    { label: '3 – 7 mi',  minMiles: 3,  maxMiles: 7,  tipRange: [3, 5]  },
    { label: '7 – 15 mi', minMiles: 7,  maxMiles: 15, tipRange: [4, 7]  },
    { label: '15+ mi',    minMiles: 15, maxMiles: 25, tipRange: [5, 10], skip: true },
  ]

  return bands.map(band => {
    const midMiles = (band.minMiles + band.maxMiles) / 2
    const estMinutes = (midMiles / AVG_SPEED_MPH) * 60
    const gasCost = midMiles * cpm
    const min = minPayoutForJob({
      miles: midMiles,
      durationMin: estMinutes,
      cpm,
      targetHourly,
    })
    const minPayout = Math.ceil(min)
    const [tipLow, tipHigh] = band.tipRange
    return {
      label: band.label,
      minMiles: band.minMiles,
      maxMiles: band.maxMiles,
      gasCost,
      minPayout,
      minPerMile: parseFloat((minPayout / midMiles).toFixed(2)),
      appShowsLow: minPayout + tipLow,
      appShowsHigh: minPayout + tipHigh,
      skip: band.skip || false,
    }
  })
}

/** Net payout after fuel cost for a single job */
export function netPayout({ payout, miles, cpm }) {
  return payout - miles * cpm
}

/** Effective hourly rate for an array of logged jobs */
export function shiftEffectiveHourly(jobs, cpm) {
  if (!jobs || jobs.length === 0) return 0
  const totalNet = jobs.reduce((sum, j) => sum + netPayout({ payout: j.payout, miles: j.miles, cpm }), 0)
  const totalMin = jobs.reduce((sum, j) => sum + j.durationMin, 0)
  if (totalMin === 0) return 0
  return (totalNet / totalMin) * 60
}

/** Total gas spent on a shift */
export function shiftGasSpent(jobs, cpm) {
  if (!jobs || jobs.length === 0) return 0
  return jobs.reduce((sum, j) => sum + j.miles * cpm, 0)
}

/** Total gross earned */
export function shiftGrossEarned(jobs) {
  if (!jobs || jobs.length === 0) return 0
  return jobs.reduce((sum, j) => sum + j.payout, 0)
}

/**
 * Trajectory prompt: what $/mile is needed for remaining jobs to hit target hourly.
 * Returns { needed: number, message: string, status: 'on_track'|'behind'|'insufficient_data' }
 */
export function trajectoryPrompt({ jobs, cpm, targetHourly, remainingJobs = 2 }) {
  if (!jobs || jobs.length === 0) {
    return { status: 'insufficient_data', message: 'Log your first job to see your trajectory.' }
  }

  const currentHourly = shiftEffectiveHourly(jobs, cpm)

  if (currentHourly >= targetHourly) {
    const perMile = (currentHourly / 60 * 20 + cpm).toFixed(2) // rough $/mile equiv
    return {
      status: 'on_track',
      message: `You're on track at $${currentHourly.toFixed(2)}/hr. Keep accepting jobs above $${perMile}/mile.`,
      currentHourly,
    }
  }

  // How much net do we need from remaining jobs to lift the overall hourly to target?
  const totalMinSoFar = jobs.reduce((s, j) => s + j.durationMin, 0)
  const estMinPerJob = totalMinSoFar / jobs.length
  const estRemainingMin = remainingJobs * estMinPerJob
  const totalMinProjected = totalMinSoFar + estRemainingMin
  const totalNetNeeded = targetHourly * (totalMinProjected / 60)
  const netSoFar = jobs.reduce((s, j) => s + netPayout({ payout: j.payout, miles: j.miles, cpm }), 0)
  const netNeededFromRemaining = totalNetNeeded - netSoFar
  const grossNeededPerJob = (netNeededFromRemaining / remainingJobs) + cpm * (estMinPerJob / 60 * 20)
  const neededPerMile = grossNeededPerJob / ((estMinPerJob / 60) * 20)

  return {
    status: 'behind',
    needed: Math.max(0, neededPerMile),
    currentHourly,
    message: `You're at $${currentHourly.toFixed(2)}/hr. To hit $${targetHourly}/hr, your next ${remainingJobs} jobs need to average $${Math.max(0, neededPerMile).toFixed(2)}+/mile.`,
  }
}

/** Detect if a new shift should auto-start (gap > 2 hours since last job) */
export function isNewShift(lastJobTimestamp) {
  if (!lastJobTimestamp) return true
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000
  return Date.now() - lastJobTimestamp > TWO_HOURS_MS
}

export function fmt$(n) {
  return '$' + Math.abs(n).toFixed(2)
}

export function fmtHourly(n) {
  return '$' + n.toFixed(2) + '/hr'
}
