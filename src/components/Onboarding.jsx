import { useState } from 'react'
import cars from '../data/cars.json'
import { costPerMile, generateCheatSheet } from '../lib/math'
import { saveProfile, saveCheatSheet } from '../lib/storage'
import styles from './Onboarding.module.css'

const STEPS = ['Your car', 'Fuel cost', 'Your route', 'Your goal']
const GAS_CARS = cars.filter(c => c.type === 'gas')
const EV_CARS  = cars.filter(c => c.type === 'ev')

export default function Onboarding({ onComplete, theme, onToggleTheme }) {
  const [step, setStep] = useState(0)
  const [carId, setCarId] = useState('')
  const [customMpg, setCustomMpg] = useState('')
  const [customMiKwh, setCustomMiKwh] = useState('')
  const [gasPrice, setGasPrice] = useState('')
  const [electricityRate, setElectricityRate] = useState('')
  const [hotspotMiles, setHotspotMiles] = useState('')
  const [targetHourly, setTargetHourly] = useState('')
  const [error, setError] = useState('')

  const selectedCar = cars.find(c => c.id === carId) || null
  const isEv = selectedCar?.type === 'ev'

  function validate() {
    setError('')
    if (step === 0 && !carId) { setError('Select your car to continue.'); return false }
    if (step === 0 && selectedCar?.mpg === null && !isEv && !customMpg) {
      setError('Enter your car\'s MPG.'); return false
    }
    if (step === 0 && isEv && selectedCar?.mi_per_kwh === null && !customMiKwh) {
      setError('Enter your car\'s miles per kWh.'); return false
    }
    if (step === 1 && !isEv && (!gasPrice || parseFloat(gasPrice) <= 0)) {
      setError('Enter the current gas price.'); return false
    }
    if (step === 1 && isEv && (!electricityRate || parseFloat(electricityRate) <= 0)) {
      setError('Enter your electricity rate ($/kWh).'); return false
    }
    if (step === 2 && (!hotspotMiles || parseFloat(hotspotMiles) < 0)) {
      setError('Enter your miles to hotspot (0 if you start in one).'); return false
    }
    if (step === 3 && (!targetHourly || parseFloat(targetHourly) <= 0)) {
      setError('Enter your target hourly rate.'); return false
    }
    return true
  }

  function next() {
    if (!validate()) return
    if (step < STEPS.length - 1) { setStep(s => s + 1) }
    else { finish() }
  }

  function back() { setError(''); setStep(s => s - 1) }

  function finish() {
    const car = selectedCar
    const mpg = car.mpg ?? parseFloat(customMpg)
    const miPerKwh = car.mi_per_kwh ?? parseFloat(customMiKwh)
    const profile = {
      carId,
      carLabel: `${car.make} ${car.model}`,
      type: car.type,
      mpg,
      miPerKwh,
      gasPrice: parseFloat(gasPrice) || 0,
      electricityRate: parseFloat(electricityRate) || 0,
      hotspotMiles: parseFloat(hotspotMiles) || 0,
      targetHourly: parseFloat(targetHourly),
      createdAt: Date.now(),
    }
    const cpm = costPerMile({
      type: profile.type,
      mpg: profile.mpg,
      gasPrice: profile.gasPrice,
      miPerKwh: profile.miPerKwh,
      electricityRate: profile.electricityRate,
    })
    const rules = generateCheatSheet({ cpm, targetHourly: profile.targetHourly })
    const sheet = { rules, cpm, generatedAt: Date.now() }

    saveProfile(profile)
    saveCheatSheet(sheet)
    onComplete(profile, sheet)
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className={styles.wrap}>
      <header className={styles.hdr}>
        <span className={styles.brand}>GigRate</span>
        <button className={styles.themeBtn} onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀︎' : '◑'}
        </button>
      </header>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.body}>
        <p className={styles.stepLabel}>Step {step + 1} of {STEPS.length}</p>
        <h1 className={styles.heading}>{STEPS[step]}</h1>

        {step === 0 && <StepCar
          carId={carId} setCarId={setCarId}
          customMpg={customMpg} setCustomMpg={setCustomMpg}
          customMiKwh={customMiKwh} setCustomMiKwh={setCustomMiKwh}
          selectedCar={selectedCar} isEv={isEv}
          gasCars={GAS_CARS} evCars={EV_CARS}
        />}
        {step === 1 && <StepFuel
          isEv={isEv}
          gasPrice={gasPrice} setGasPrice={setGasPrice}
          electricityRate={electricityRate} setElectricityRate={setElectricityRate}
        />}
        {step === 2 && <StepRoute hotspotMiles={hotspotMiles} setHotspotMiles={setHotspotMiles} />}
        {step === 3 && <StepGoal targetHourly={targetHourly} setTargetHourly={setTargetHourly} />}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {step > 0 && <button className={styles.btnBack} onClick={back}>← Back</button>}
          <button className={styles.btnNext} onClick={next}>
            {step < STEPS.length - 1 ? 'Continue →' : 'Generate My Cheat Sheet'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepCar({ carId, setCarId, customMpg, setCustomMpg, customMiKwh, setCustomMiKwh, selectedCar, isEv, gasCars, evCars }) {
  return (
    <div className={styles.fields}>
      <p className={styles.desc}>We'll calculate your real cost per mile.</p>
      <label className={styles.label}>Make & Model</label>
      <select className={styles.select} value={carId} onChange={e => setCarId(e.target.value)}>
        <option value="">Select your car…</option>
        <optgroup label="⛽ Gas">
          {gasCars.map(c => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model}{c.years ? ` (${c.years})` : ''}{c.mpg ? ` — ${c.mpg} MPG` : ''}
            </option>
          ))}
        </optgroup>
        <optgroup label="⚡ Electric">
          {evCars.map(c => (
            <option key={c.id} value={c.id}>
              {c.make} {c.model}{c.years ? ` (${c.years})` : ''}{c.mi_per_kwh ? ` — ${c.mi_per_kwh} mi/kWh` : ''}
            </option>
          ))}
        </optgroup>
      </select>

      {selectedCar?.mpg === null && !isEv && (
        <div className={styles.field}>
          <label className={styles.label}>MPG</label>
          <input className={styles.input} type="number" min="1" placeholder="e.g. 30"
            value={customMpg} onChange={e => setCustomMpg(e.target.value)} />
        </div>
      )}
      {isEv && selectedCar?.mi_per_kwh === null && (
        <div className={styles.field}>
          <label className={styles.label}>Miles per kWh</label>
          <input className={styles.input} type="number" min="0.1" step="0.1" placeholder="e.g. 3.5"
            value={customMiKwh} onChange={e => setCustomMiKwh(e.target.value)} />
        </div>
      )}
    </div>
  )
}

function StepFuel({ isEv, gasPrice, setGasPrice, electricityRate, setElectricityRate }) {
  return (
    <div className={styles.fields}>
      {!isEv ? (
        <>
          <p className={styles.desc}>What's gas near you right now?</p>
          <div className={styles.field}>
            <label className={styles.label}>Gas price ($/gallon)</label>
            <input className={styles.input} type="number" min="0.01" step="0.01" placeholder="e.g. 4.50"
              value={gasPrice} onChange={e => setGasPrice(e.target.value)} inputMode="decimal" />
          </div>
        </>
      ) : (
        <>
          <p className={styles.desc}>What do you pay for electricity?</p>
          <div className={styles.field}>
            <label className={styles.label}>Electricity rate ($/kWh)</label>
            <input className={styles.input} type="number" min="0.01" step="0.01" placeholder="e.g. 0.25"
              value={electricityRate} onChange={e => setElectricityRate(e.target.value)} inputMode="decimal" />
          </div>
          <p className={styles.hint}>Check your electricity bill or use 0.15 as a US average.</p>
        </>
      )}
    </div>
  )
}

function StepRoute({ hotspotMiles, setHotspotMiles }) {
  return (
    <div className={styles.fields}>
      <p className={styles.desc}>How far do you drive before you start accepting jobs?</p>
      <div className={styles.field}>
        <label className={styles.label}>Miles from home to where you start</label>
        <input className={styles.input} type="number" min="0" step="0.1" placeholder="e.g. 4 (or 0)"
          value={hotspotMiles} onChange={e => setHotspotMiles(e.target.value)} inputMode="decimal" />
      </div>
      <p className={styles.hint}>e.g. driving to a gym, coffee shop, or parking spot near your hotspot. This fuel cost is factored into your real earnings. Enter 0 if you start right at home.</p>
    </div>
  )
}

function StepGoal({ targetHourly, setTargetHourly }) {
  return (
    <div className={styles.fields}>
      <p className={styles.desc}>What's your minimum acceptable hourly rate — after gas?</p>
      <div className={styles.field}>
        <label className={styles.label}>Target ($/hr after gas)</label>
        <input className={styles.input} type="number" min="1" step="1" placeholder="e.g. 15"
          value={targetHourly} onChange={e => setTargetHourly(e.target.value)} inputMode="numeric" />
      </div>
      <p className={styles.hint}>California Prop 22 guarantees ~$18.97/hr active time minimum. Your real cost accounting may be lower.</p>
    </div>
  )
}
