import styles from './CheatSheet.module.css'

export default function CheatSheet({ profile, cheatSheet, onReset }) {
  const { rules, cpm } = cheatSheet
  const generatedDate = cheatSheet.generatedAt
    ? new Date(cheatSheet.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  const fuelDesc = profile.type === 'ev'
    ? `${profile.miPerKwh} mi/kWh · $${profile.electricityRate}/kWh`
    : `${profile.mpg} MPG · $${profile.gasPrice}/gal`

  return (
    <div className={styles.wrap}>
      {/* Screenshot-worthy card */}
      <div className={styles.card} id="cheatsheet-card">
        <div className={styles.cardTop}>
          <div>
            <p className={styles.cardTitle}>Your Cheat Sheet</p>
            <p className={styles.cardSub}>{profile.carLabel} · {fuelDesc} · goal ${profile.targetHourly}/hr</p>
          </div>
          <div className={styles.cpmBadge}>
            <span className={styles.cpmNum}>${cpm.toFixed(3)}</span>
            <span className={styles.cpmLabel}>/mile cost</span>
          </div>
        </div>

        {/* 4-column table */}
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span>Distance</span>
            <span>Gas Cost</span>
            <span>Min Accept</span>
            <span>App Shows</span>
          </div>
          {rules.map((rule, i) => (
            <RuleRow key={i} rule={rule} isLast={i === rules.length - 1} />
          ))}
        </div>

        <p className={styles.cardFooter}>
          Sitting still beats a bad job · generated {generatedDate}
        </p>
      </div>

      {/* Action row */}
      <div className={styles.actions}>
        <button className={styles.btnReset} onClick={onReset}>
          Edit Profile
        </button>
      </div>

      {/* How to use */}
      <div className={styles.howto}>
        <p className={styles.howtoTitle}>How to use this</p>
        <ol className={styles.howtoList}>
          <li>When Uber shows a new job, check the distance.</li>
          <li>Find that row — see the <strong>Min Accept</strong> number.</li>
          <li>If the app shows less than <strong>App Shows</strong> range, it's likely a low offer or tip bait.</li>
          <li>Log your last job in <strong>Log Job</strong> to track your real hourly.</li>
        </ol>
      </div>
    </div>
  )
}

function RuleRow({ rule, isLast }) {
  const rowClass = [styles.tableRow, isLast ? styles.tableRowLast : ''].join(' ')

  // Color the min payout by band difficulty
  const minColor = rule.skip
    ? 'var(--red)'
    : rule.minPayout >= 20
      ? 'var(--yellow)'
      : rule.minPayout >= 12
        ? 'var(--purple)'
        : 'var(--green)'

  return (
    <div className={rowClass}>
      <span className={styles.cellDist}>{rule.label}</span>
      <span className={styles.cellGas}>${rule.gasCost.toFixed(2)}</span>
      <span className={styles.cellMin} style={{ color: minColor }}>
        {rule.skip ? 'skip it' : `$${rule.minPayout}`}
      </span>
      <span className={styles.cellApp}>
        {rule.skip
          ? <span className={styles.skipDash}>—</span>
          : <span className={styles.appRange}>${rule.appShowsLow}–${rule.appShowsHigh}</span>
        }
      </span>
    </div>
  )
}
