/**
 * GigRate — localStorage persistence
 * Keys are constants to avoid typo bugs.
 */

const KEYS = {
  PROFILE:    'gr_profile',
  CHEATSHEET: 'gr_cheatsheet',
  SHIFT:      'gr_shift',
  THEME:      'gr_theme',
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing or storage full — fail silently
  }
}

export function saveProfile(profile) {
  safeSet(KEYS.PROFILE, profile)
}

export function loadProfile() {
  return safeGet(KEYS.PROFILE)
}

export function saveCheatSheet(sheet) {
  safeSet(KEYS.CHEATSHEET, { ...sheet, generatedAt: Date.now() })
}

export function loadCheatSheet() {
  return safeGet(KEYS.CHEATSHEET)
}

export function loadShift() {
  return safeGet(KEYS.SHIFT) || { jobs: [], startedAt: null }
}

export function saveShift(shift) {
  safeSet(KEYS.SHIFT, shift)
}

export function addJobToShift(job) {
  const shift = loadShift()
  const now = Date.now()
  shift.jobs.push({ ...job, loggedAt: now })
  if (!shift.startedAt) shift.startedAt = now
  shift.lastJobAt = now
  safeSet(KEYS.SHIFT, shift)
  return shift
}

export function resetShift() {
  const fresh = { jobs: [], startedAt: Date.now(), lastJobAt: null }
  safeSet(KEYS.SHIFT, fresh)
  return fresh
}

export function loadTheme() {
  return safeGet(KEYS.THEME) || 'dark'
}

export function saveTheme(theme) {
  safeSet(KEYS.THEME, theme)
}
