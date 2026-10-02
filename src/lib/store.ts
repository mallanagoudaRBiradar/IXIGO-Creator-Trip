import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCity, getReel, REELS } from './mockData'
import { defaultConfig, priceTrip, type TripConfig } from './pricing'
import { addDays, uid } from './utils'

export interface Dream {
  id: string
  config: TripConfig
  savedPrice: number
  currentPrice: number
  history: number[]
  savedAt: number
}

export interface Trip {
  id: string
  bookingId: string
  pnr: string
  config: TripConfig
  total: number
  paidByYou: number
  crew: string[]
  createdAt: number
}

export type SheetStep = 'build' | 'crew' | 'pay' | 'processing' | 'success'

interface AppState {
  origin: string
  originDetected: boolean
  liked: string[]
  following: string[]
  dreams: Dream[]
  trips: Trip[]
  verifiedReels: string[]
  gems: number
  onboarded: boolean
  setOrigin: (id: string, detected?: boolean) => void
  toggleLike: (reelId: string) => void
  toggleFollow: (handle: string) => void
  saveDream: (cfg: TripConfig) => Dream | null
  removeDream: (id: string) => void
  dropDreamPrice: (id: string, amount: number) => void
  addTrip: (t: Omit<Trip, 'id' | 'createdAt'>) => Trip
  verifyReel: (id: string) => void
  setOnboarded: () => void
}

// A pre-booked trip so the Trips tab is never empty during a demo
const seedReel = REELS[0]
const seedCfg: TripConfig = { ...defaultConfig(seedReel, 'hyd'), startDate: addDays(new Date().toISOString().slice(0, 10), 9) }
const seedPrice = priceTrip(seedCfg, seedReel, getCity('hyd'))
const seedTrip: Trip = {
  id: 'seed-goa',
  bookingId: 'IXR-8F2K91',
  pnr: 'Q4ZT7M',
  config: seedCfg,
  total: seedPrice.total,
  paidByYou: seedPrice.total,
  crew: [],
  createdAt: Date.now() - 86400000 * 3,
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      origin: 'hyd',
      originDetected: false,
      liked: [],
      following: [],
      dreams: [],
      trips: [seedTrip],
      verifiedReels: ['goa-luxe', 'gokarna-pack', 'jaipur-heritage', 'alleppey-slow', 'rishikesh-soul'],
      gems: 24850,
      onboarded: false,
      setOrigin: (id, detected = false) => set({ origin: id, originDetected: detected }),
      toggleLike: (id) =>
        set((s) => ({ liked: s.liked.includes(id) ? s.liked.filter((x) => x !== id) : [...s.liked, id] })),
      toggleFollow: (h) =>
        set((s) => ({ following: s.following.includes(h) ? s.following.filter((x) => x !== h) : [...s.following, h] })),
      saveDream: (cfg) => {
        const reel = getReel(cfg.reelId)
        if (!reel) return null
        const existing = get().dreams.find((d) => d.config.reelId === cfg.reelId && d.config.origin === cfg.origin)
        const price = priceTrip(cfg, reel, getCity(cfg.origin)).total
        const jitter = [1.06, 1.03, 1.08, 1.02, 1]
        const dream: Dream = {
          id: existing?.id ?? uid('D'),
          config: cfg,
          savedPrice: price,
          currentPrice: price,
          history: jitter.map((j) => Math.round(price * j)),
          savedAt: Date.now(),
        }
        set((s) => ({ dreams: [dream, ...s.dreams.filter((d) => d.id !== dream.id)] }))
        return dream
      },
      removeDream: (id) => set((s) => ({ dreams: s.dreams.filter((d) => d.id !== id) })),
      dropDreamPrice: (id, amount) =>
        set((s) => ({
          dreams: s.dreams.map((d) =>
            d.id === id
              ? { ...d, currentPrice: Math.max(1000, d.currentPrice - amount), history: [...d.history.slice(-9), Math.max(1000, d.currentPrice - amount)] }
              : d,
          ),
        })),
      addTrip: (t) => {
        const trip: Trip = { ...t, id: uid('T'), createdAt: Date.now() }
        set((s) => ({ trips: [trip, ...s.trips] }))
        return trip
      },
      verifyReel: (id) => set((s) => ({ verifiedReels: [...new Set([...s.verifiedReels, id])] })),
      setOnboarded: () => set({ onboarded: true }),
    }),
    { name: 'trip-reels-v1' },
  ),
)

// ---- UI state (not persisted) ----------------------------------------------

export interface Notice {
  id: string
  title: string
  body: string
  tone?: 'orange' | 'green' | 'blue'
  icon?: string
  actionLabel?: string
  onAction?: () => void
}

interface UIState {
  sheet: { open: boolean; reelId: string | null; step: SheetStep; config?: TripConfig }
  notices: Notice[]
  pickerOpen: boolean
  setPicker: (open: boolean) => void
  openSheet: (reelId: string, step?: SheetStep, config?: TripConfig) => void
  setStep: (step: SheetStep) => void
  closeSheet: () => void
  notify: (n: Omit<Notice, 'id'>) => void
  dismiss: (id: string) => void
}

export const useUI = create<UIState>()((set, get) => ({
  sheet: { open: false, reelId: null, step: 'build' },
  notices: [],
  pickerOpen: false,
  setPicker: (open) => set({ pickerOpen: open }),
  openSheet: (reelId, step = 'build', config) => set({ sheet: { open: true, reelId, step, config } }),
  setStep: (step) => set((s) => ({ sheet: { ...s.sheet, step } })),
  closeSheet: () => set((s) => ({ sheet: { ...s.sheet, open: false } })),
  notify: (n) => {
    const id = uid('N')
    set((s) => ({ notices: [...s.notices.slice(-1), { ...n, id }] }))
    setTimeout(() => get().dismiss(id), 5200)
  },
  dismiss: (id) => set((s) => ({ notices: s.notices.filter((x) => x.id !== id) })),
}))
