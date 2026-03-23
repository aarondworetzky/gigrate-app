import { useState, useEffect } from 'react'
import {
  costPerMile, shiftEffectiveHourly, shiftGasSpent,
  shiftGrossEarned, trajectoryPrompt, isNewShift, fmt$, fmtHourly
} from '../lib/math'
import { loadShift, addJobToShift, resetShift } from '../lib/storage'
import styles from './Logger.module.css'

export default function Logger({ profile }) {
  const [shift, setShift] = useState(loadShift)
  const [payout, setPayout] = useState('')
  const [miles, setMiles] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [error, setError] = useState('')
  const [justLogged, setJustLogged] = useState(false)

  const cpm = costPerMile({
    type: profile.type,
    mpg: profile.mpg,
    gasPrice: profile.gasPrice,
    miPerKwh: profile.miPerKwh,
    electricityRate: profile.electricityRate,
  })

  // Auto-detect new shift on mount
  useEffect(() => {
    if (shift.lastJobAt && isNewShift(shift.lastJobAt)) {
      const fresh = resetShift()
      setShift(fresh)
    }
  }, [])

  function validate() {
    setError('')
    if (!payout || parseFloat(payout) < 0) { setError('Enter the actual payout (can be $0 for tip bait).'); return false }
    if (!miles || parseFloat(miles) <= 0)  { setError('Enter miles driven.'); return false }
    if (!durationMin || parseInt(durationMin) <= 0) { setError('Enter how many minutes the job took.'); return false }
    return true
  }

  function logJob() {
    if (!validate()) return
    const job = {
      payout: parseFloat(payout),
      miles: parseFloat(miles),
      durationMin: parseInt(durationMin),
    }
    const updated = addJobToShift(job)
    setShift({ ...updated })
    setPayout(''); setMiles(''); setDurationMin('')
    setJustLogged(true)
    setTimeout(() => setJustLogged(false), 2000)
  }

  function handleNewShift() {
    const fresh = resetShift()
    setShift(fresh)
  }

  const jobs = shift.jobs || []
  const hasJobs = jobs.length > 0
  const effectiveHourly = hasJobs ? shiftEffectiveHourly(jobs, cpm) : null
  const gasSpent = hasJobs ? shiftGasSpent(jobs, cpm) : null
  const grossEarned = hasJobs ? shiftGrossEarned(jobs) : null
  const netEarned = hasJobs ? grossEarned - gasSpent : null
  const traj = hasJobs ? trajectoryPrompt({ jobs, cpm, targetHourly: profile.targetHourly }) : null

  const hourlyStatus = effectiveHourly !== null
    ? effectiveHourly >= profile.targetHourly ? 'good'
    : effectiveHourly >= profile.targetHourly * 0.75 ? 'warn' : 'bad'
    : null

  return (
    <div className={styles.wrap}>
      {/* Log form */}
      <div className={styles.card}>
        <p className={styles.cardLabel}>Log last delivery</p>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Actual payout (after tip)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>$</span>
              <input
                className={styles.input}
                type="number" min="0" step="0.01"
                placeholder="0.00"
                value={payout}
                onChange={e => setPayout(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <p className={styles.hint}>Use the final amount — tip bait is real.</p>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Miles driven</label>
              <input className={styles.input} type="number" min="0.1" step="0.1"
                placeholder="0.0" value={miles} onChange={e => setMiles(e.target.value)} inputMode="decimal" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Minutes</label>
              <input className={styles.input} type="number" min="1" step="1"
                placeholder="0" value={durationMin} onChange={e => setDurationMin(e.target.value)} inputMode="numeric" />
              <p className={styles.hint}>Include wait time at the restaurant — you're paid for this.</p>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={`${styles.btnLog} ${justLogged ? styles.btnLogged : ''}`}
            onClick={logJob}
          >
            {justLogged ? '✓ Logged' : 'Log It'}
          </button>
        </div>
      </div>

      {/* Shift stats */}
      {hasJobs && (
        <>
          {/* Awareness bomb */}
          <div className={styles.bombCard}>
            <p className={styles.bombLabel}>Tonight's effective hourly</p>
            <p className={`${styles.bombNum} ${styles[hourlyStatus]}`}>
              {fmtHourly(effectiveHourly)}
            </p>
            <p className={styles.bombSub}>
              {jobs.length} {jobs.length === 1 ? 'delivery' : 'deliveries'} · after gas
            </p>
          </div>

          {/* Stats */}
          <div className={styles.statsCard}>
            <StatRow label="Gross earned" value={fmt$(grossEarned)} />
            <StatRow label="Gas spent" value={`−${fmt$(gasSpent)}`} dimmed />
            <StatRow label="Net earned" value={fmt$(netEarned)} highlight={netEarned < 0 ? 'bad' : 'good'} />
            <StatRow label="Deliveries" value={jobs.length} />
          </div>

          {/* Trajectory */}
          {traj && (
            <div className={`${styles.traj} ${traj.status === 'on_track' ? styles.trajGood : ''}`}>
              <p className={styles.trajLabel}>
                {traj.status === 'on_track' ? 'On Track' : 'Next Jobs'}
              </p>
              <p className={styles.trajMsg}>{traj.message}</p>
            </div>
          )}

          {/* New shift */}
          <button className={styles.btnNewShift} onClick={handleNewShift}>
            Start New Shift
          </button>
        </>
      )}

      {!hasJobs && (
        <div className={styles.empty}>
          <p>Log your first delivery to see your real hourly.</p>
        </div>
      )}
    </div>
  )
}

function StatRow({ label, value, dimmed, highlight }) {
  return (
    <div className={styles.statRow}>
      <span className={`${styles.statLabel} ${dimmed ? styles.dimmed : ''}`}>{label}</span>
      <span className={`${styles.statValue} ${highlight ? styles[highlight] : ''}`}>{value}</span>
    </div>
  )
}
