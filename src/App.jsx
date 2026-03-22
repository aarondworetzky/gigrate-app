import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding'
import CheatSheet from './components/CheatSheet'
import Logger from './components/Logger'
import { loadProfile, loadCheatSheet, loadTheme, saveTheme } from './lib/storage'
import styles from './App.module.css'

export default function App() {
  const [profile, setProfile] = useState(null)
  const [cheatSheet, setCheatSheet] = useState(null)
  const [view, setView] = useState('cheatsheet') // 'cheatsheet' | 'logger'
  const [theme, setTheme] = useState('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedTheme = loadTheme()
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : '')

    const p = loadProfile()
    const cs = loadCheatSheet()
    if (p) setProfile(p)
    if (cs) setCheatSheet(cs)
    setReady(true)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    saveTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'light' ? 'light' : '')
  }

  function handleOnboardingComplete(p, cs) {
    setProfile(p)
    setCheatSheet(cs)
  }

  function handleReset() {
    setProfile(null)
    setCheatSheet(null)
  }

  if (!ready) return null

  // No profile yet → onboarding
  if (!profile || !cheatSheet) {
    return <Onboarding onComplete={handleOnboardingComplete} theme={theme} onToggleTheme={toggleTheme} />
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>GigRate</span>
        <nav className={styles.nav}>
          <button
            className={`${styles.tab} ${view === 'cheatsheet' ? styles.tabActive : ''}`}
            onClick={() => setView('cheatsheet')}
          >
            Cheat Sheet
          </button>
          <button
            className={`${styles.tab} ${view === 'logger' ? styles.tabActive : ''}`}
            onClick={() => setView('logger')}
          >
            Log Job
          </button>
        </nav>
        <button className={styles.themeBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀︎' : '◑'}
        </button>
      </header>

      <main className={styles.main}>
        {view === 'cheatsheet' && (
          <CheatSheet profile={profile} cheatSheet={cheatSheet} onReset={handleReset} />
        )}
        {view === 'logger' && (
          <Logger profile={profile} />
        )}
      </main>
    </div>
  )
}
