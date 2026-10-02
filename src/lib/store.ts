import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCity, getReel, REELS, upcomingFor, type Comment, type Mode, type Question, type Tier } from './mockData'
import type { ReportReason } from './moderation'
import { defaultConfig, priceTrip, type TripConfig } from './pricing'
import { addDays, toISODate, uid } from './utils'

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

// The viewer's identity on comments
export const ME = { handle: 'you' }

export type ThemePref = 'system' | 'light' | 'dark'

export interface Profile {
  name: string
  username: string
  bio: string
  hue: [string, string]
}

/** Booking defaults and playback/privacy behaviour. 'auto' means "use the creator's pick". */
export interface Prefs {
  mode: 'auto' | Mode
  tier: 'auto' | Tier
  travelers: number
  autoplay: boolean
  liveTicker: boolean
  reduceMotion: boolean
  dataSaver: boolean
  pauseHistory: boolean
  strictFilter: boolean
}

export interface NotifPrefs {
  enabled: boolean
  uploads: boolean
  answers: boolean
  priceDrops: boolean
}

export const DEFAULT_PROFILE: Profile = { name: 'Riya Sharma', username: 'riya.roams', bio: 'Weekend wanderer from Hyderabad. Beaches over mountains, always.', hue: ['#F57224', '#8B5CF6'] }
export const DEFAULT_PREFS: Prefs = { mode: 'auto', tier: 'auto', travelers: 2, autoplay: true, liveTicker: true, reduceMotion: false, dataSaver: false, pauseHistory: false, strictFilter: false }
export const DEFAULT_NOTIFS: NotifPrefs = { enabled: true, uploads: true, answers: true, priceDrops: true }

export type SheetStep = 'build' | 'crew' | 'pay' | 'processing' | 'success'

interface AppState {
  origin: string
  originDetected: boolean
  liked: string[]
  following: string[]
  bells: string[]
  myComments: Comment[]
  likedComments: string[]
  // moderation
  hiddenComments: string[]
  reports: { id: string; reason: ReportReason; at: number }[]
  blockedUsers: string[]
  // Q&A
  myQuestions: Question[]
  upvotedQuestions: string[]
  // history and sharing
  history: { reelId: string; at: number }[]
  shares: Record<string, number>
  // new uploads from creators you've belled
  uploadDue: Record<string, number>
  released: { reelId: string; at: number }[]
  seenUploads: string[]
  dreams: Dream[]
  trips: Trip[]
  verifiedReels: string[]
  gems: number
  onboarded: boolean
  theme: ThemePref
  setTheme: (t: ThemePref) => void
  profile: Profile
  prefs: Prefs
  notifs: NotifPrefs
  setProfile: (p: Partial<Profile>) => void
  setPref: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void
  setNotif: <K extends keyof NotifPrefs>(k: K, v: NotifPrefs[K]) => void
  setOrigin: (id: string, detected?: boolean) => void
  toggleLike: (reelId: string) => void
  toggleFollow: (handle: string) => void
  toggleBell: (handle: string) => void
  addComment: (reelId: string, text: string, parentId?: string) => Comment
  deleteComment: (id: string) => void
  toggleCommentLike: (id: string) => void
  hideComment: (id: string) => void
  unhideComment: (id: string) => void
  reportComment: (id: string, reason: ReportReason) => void
  blockUser: (handle: string) => void
  unblockUser: (handle: string) => void
  askQuestion: (creator: string, text: string) => Question
  answerQuestion: (id: string, answer: string) => void
  deleteQuestion: (id: string) => void
  toggleUpvote: (id: string) => void
  addHistory: (reelId: string) => void
  clearHistory: () => void
  addShare: (reelId: string) => void
  releaseUpload: (reelId: string) => void
  markUploadsSeen: (reelIds: string[]) => void
  saveDream: (cfg: TripConfig) => Dream | null
  removeDream: (id: string) => void
  dropDreamPrice: (id: string, amount: number) => void
  addTrip: (t: Omit<Trip, 'id' | 'createdAt'>) => Trip
  verifyReel: (id: string) => void
  setOnboarded: () => void
}

// A pre-booked trip so the Trips tab is never empty during a demo
const seedReel = REELS[0]
const seedCfg: TripConfig = { ...defaultConfig(seedReel, 'hyd'), startDate: addDays(toISODate(new Date()), 9) }
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

// ---- Sample activity --------------------------------------------------------
// So the profile, history and library look lived-in on a fresh install. Also loadable
// from Settings › Your data. Replace with the user's real activity once accounts land.

const H = 3_600_000
const D = 24 * H

function sampleDream(reelId: string, origin: string, dropPct: number): Dream {
  const reel = getReel(reelId)!
  const config = { ...defaultConfig(reel, origin), startDate: addDays(toISODate(new Date()), 18) }
  const price = priceTrip(config, reel, getCity(origin)).total
  const now = Math.round(price * (1 - dropPct))
  return {
    id: `seed-dream-${reelId}`,
    config,
    savedPrice: price,
    currentPrice: now,
    history: [1.06, 1.04, 1.07, 1.02, 1, 1 - dropPct / 2, 1 - dropPct].map((j) => Math.round(price * j)),
    savedAt: Date.now() - 4 * D,
  }
}

const pastReel = getReel('rishikesh-soul')!
const pastCfg: TripConfig = { ...defaultConfig(pastReel, 'hyd'), mode: 'train', travelers: 3, startDate: addDays(toISODate(new Date()), -24) }
const pastPrice = priceTrip(pastCfg, pastReel, getCity('hyd'))

export function sampleActivity(): Partial<AppState> {
  const now = Date.now()
  return {
    following: ['mallanagouda.biradar', 'tara.on.trails', 'chitra.jagadal'],
    bells: ['mallanagouda.biradar', 'tara.on.trails'],
    liked: ['goa-luxe', 'jaipur-heritage', 'rishikesh-soul', 'gokarna-pack'],
    history: [
      { reelId: 'goa-luxe', at: now - 25 * 60_000 },
      { reelId: 'jaipur-heritage', at: now - 3 * H },
      { reelId: 'gokarna-pack', at: now - 9 * H },
      { reelId: 'rishikesh-soul', at: now - 1 * D },
      { reelId: 'alleppey-slow', at: now - 2 * D },
    ],
    dreams: [sampleDream('jaipur-heritage', 'hyd', 0.08), sampleDream('alleppey-slow', 'hyd', 0)],
    trips: [
      seedTrip,
      {
        id: 'seed-rishikesh',
        bookingId: 'IXR-3QW7LD',
        pnr: '8817420356',
        config: pastCfg,
        total: pastPrice.total,
        paidByYou: Math.round(pastPrice.total / 3),
        crew: ['Kavya', 'Rohan'],
        createdAt: now - 40 * D,
      },
    ],
    myComments: [
      { id: 'seed-c1', reelId: 'goa-luxe', user: ME.handle, text: 'Is the pool villa worth it for a 3-night trip? Planning for our anniversary 🥂', at: now - 2 * D, likes: 14 },
      { id: 'seed-c2', reelId: 'goa-luxe', user: ME.handle, text: 'Thank you! Booking it this week 🙌', at: now - 40 * H, likes: 3, parentId: 'goa-luxe-0' },
      { id: 'seed-c3', reelId: 'jaipur-heritage', user: ME.handle, text: 'The haveli rooftop dinner looks unreal. Saved to my Dream Board!', at: now - 5 * H, likes: 8 },
      { id: 'seed-c4', reelId: 'rishikesh-soul', user: ME.handle, text: 'Did this exact trip last month with friends. The aarti at Triveni Ghat was magical ✨', at: now - 6 * D, likes: 41 },
    ],
    likedComments: ['goa-luxe-0', 'jaipur-heritage-0', 'rishikesh-soul-3'],
    myQuestions: [
      {
        id: 'seed-q1',
        creator: 'tara.on.trails',
        user: ME.handle,
        text: 'What should I pack for the rafting day?',
        at: now - 3 * D,
        upvotes: 27,
        answer: 'Quick-dry clothes, sandals with straps, a spare set for after, and sunscreen. Leave your phone at camp or in a dry bag!',
        answeredAt: now - 3 * D + 2 * H,
      },
      {
        id: 'seed-q2',
        creator: 'chitra.jagadal',
        user: ME.handle,
        text: 'Is October a good month for Jaipur?',
        at: now - 20 * H,
        upvotes: 9,
        answer: 'October is lovely! The heat breaks, evenings are pleasant and the city lights up for Diwali towards the end of the month.',
        answeredAt: now - 18 * H,
      },
    ],
    upvotedQuestions: ['q-tara.on.trails-0'],
    shares: { 'goa-luxe': 2, 'jaipur-heritage': 1 },
  }
}

/** Adds the sample activity to whatever the viewer already has, without duplicates */
export function mergeSample(s: AppState): Partial<AppState> {
  const sample = sampleActivity()
  const byId = <T extends { id: string }>(a: T[], b: T[] = []) => [...a, ...b.filter((x) => !a.some((y) => y.id === x.id))]
  const uniq = (a: string[], b: string[] = []) => [...new Set([...a, ...b])]
  return {
    following: uniq(s.following, sample.following),
    bells: uniq(s.bells, sample.bells),
    liked: uniq(s.liked, sample.liked),
    history: [...s.history, ...(sample.history ?? []).filter((h) => !s.history.some((x) => x.reelId === h.reelId))].sort((a, b) => b.at - a.at),
    dreams: byId(s.dreams, sample.dreams),
    trips: byId(s.trips, sample.trips),
    myComments: byId(s.myComments, sample.myComments),
    likedComments: uniq(s.likedComments, sample.likedComments),
    myQuestions: byId(s.myQuestions, sample.myQuestions),
    upvotedQuestions: uniq(s.upvotedQuestions, sample.upvotedQuestions),
  }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      origin: 'hyd',
      originDetected: false,
      liked: [],
      following: [],
      bells: [],
      myComments: [],
      likedComments: [],
      hiddenComments: [],
      reports: [],
      blockedUsers: [],
      myQuestions: [],
      upvotedQuestions: [],
      history: [],
      shares: {},
      uploadDue: {},
      released: [],
      seenUploads: [],
      dreams: [],
      trips: [seedTrip],
      // a fresh install starts with sample activity so the profile isn't empty
      ...sampleActivity(),
      verifiedReels: ['goa-luxe', 'gokarna-pack', 'jaipur-heritage', 'alleppey-slow', 'rishikesh-soul'],
      gems: 24850,
      onboarded: false,
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      profile: DEFAULT_PROFILE,
      prefs: DEFAULT_PREFS,
      notifs: DEFAULT_NOTIFS,
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      setPref: (k, v) => set((s) => ({ prefs: { ...s.prefs, [k]: v } })),
      setNotif: (k, v) => set((s) => ({ notifs: { ...s.notifs, [k]: v } })),
      setOrigin: (id, detected = false) => set({ origin: id, originDetected: detected }),
      toggleLike: (id) =>
        set((s) => ({ liked: s.liked.includes(id) ? s.liked.filter((x) => x !== id) : [...s.liked, id] })),
      // Subscribing turns the bell on too, like YouTube's default; unsubscribing clears it
      toggleFollow: (h) =>
        set((s) =>
          s.following.includes(h)
            ? { following: s.following.filter((x) => x !== h), bells: s.bells.filter((x) => x !== h) }
            : { following: [...s.following, h], bells: [...new Set([...s.bells, h])], uploadDue: scheduleUpload(s, h) },
        ),
      toggleBell: (h) =>
        set((s) =>
          s.bells.includes(h)
            ? { bells: s.bells.filter((x) => x !== h) }
            : { bells: [...s.bells, h], uploadDue: scheduleUpload(s, h) },
        ),
      addComment: (reelId, text, parentId) => {
        const c: Comment = { id: uid('C'), reelId, user: ME.handle, text: text.trim(), at: Date.now(), likes: 0, parentId }
        set((s) => ({ myComments: [...s.myComments, c] }))
        return c
      },
      deleteComment: (id) =>
        set((s) => ({ myComments: s.myComments.filter((c) => c.id !== id && c.parentId !== id) })),
      toggleCommentLike: (id) =>
        set((s) => ({ likedComments: s.likedComments.includes(id) ? s.likedComments.filter((x) => x !== id) : [...s.likedComments, id] })),
      hideComment: (id) => set((s) => ({ hiddenComments: [...new Set([...s.hiddenComments, id])] })),
      unhideComment: (id) =>
        set((s) => ({ hiddenComments: s.hiddenComments.filter((x) => x !== id), reports: s.reports.filter((r) => r.id !== id) })),
      // a reported comment is hidden for the reporter straight away, then queued for review
      reportComment: (id, reason) =>
        set((s) => ({
          reports: [...s.reports.filter((r) => r.id !== id), { id, reason, at: Date.now() }],
          hiddenComments: [...new Set([...s.hiddenComments, id])],
        })),
      blockUser: (h) => set((s) => ({ blockedUsers: [...new Set([...s.blockedUsers, h])] })),
      unblockUser: (h) => set((s) => ({ blockedUsers: s.blockedUsers.filter((x) => x !== h) })),
      askQuestion: (creator, text) => {
        // the creator "answers" 6 to 10 seconds later; the Simulator in App resolves it
        const q: Question = { id: uid('Q'), creator, user: ME.handle, text: text.trim(), at: Date.now(), upvotes: 0, answerAt: Date.now() + 6000 + Math.random() * 4000 }
        set((s) => ({ myQuestions: [...s.myQuestions, q] }))
        return q
      },
      answerQuestion: (id, answer) =>
        set((s) => ({ myQuestions: s.myQuestions.map((q) => (q.id === id ? { ...q, answer, answeredAt: Date.now() } : q)) })),
      deleteQuestion: (id) => set((s) => ({ myQuestions: s.myQuestions.filter((q) => q.id !== id) })),
      toggleUpvote: (id) =>
        set((s) => ({ upvotedQuestions: s.upvotedQuestions.includes(id) ? s.upvotedQuestions.filter((x) => x !== id) : [...s.upvotedQuestions, id] })),
      addHistory: (reelId) =>
        set((s) => ({ history: [{ reelId, at: Date.now() }, ...s.history.filter((h) => h.reelId !== reelId)].slice(0, 40) })),
      clearHistory: () => set({ history: [] }),
      addShare: (reelId) => set((s) => ({ shares: { ...s.shares, [reelId]: (s.shares[reelId] ?? 0) + 1 } })),
      releaseUpload: (reelId) =>
        set((s) => {
          const reel = getReel(reelId)
          const { [reel?.creator.handle ?? '']: _, ...due } = s.uploadDue
          if (s.released.some((r) => r.reelId === reelId)) return { uploadDue: due }
          return { released: [{ reelId, at: Date.now() }, ...s.released], uploadDue: due }
        }),
      markUploadsSeen: (ids) => set((s) => ({ seenUploads: [...new Set([...s.seenUploads, ...ids])] })),
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
    {
      name: 'trip-reels-v1',
      // fill in settings added after a device first saved its state
      merge: (persisted, current) => {
        const p = { ...((persisted ?? {}) as Partial<AppState>) } as Record<string, unknown>
        // repair saved data from older versions: wrong-typed fields fall back to defaults
        // instead of crashing a screen later
        const cur = current as unknown as Record<string, unknown>
        for (const k of Object.keys(p)) {
          const want = cur[k]
          if (typeof want === 'function' || (want !== undefined && Array.isArray(want) !== Array.isArray(p[k])) || (want !== undefined && p[k] !== null && typeof want !== typeof p[k])) delete p[k]
        }
        if (Array.isArray(p.history)) p.history = (p.history as AppState['history']).filter((h) => h && typeof h.reelId === 'string' && getReel(h.reelId))
        if (Array.isArray(p.trips)) p.trips = (p.trips as Trip[]).filter((t) => t?.config && getReel(t.config.reelId))
        if (Array.isArray(p.dreams)) p.dreams = (p.dreams as Dream[]).filter((d) => d?.config && getReel(d.config.reelId))
        return {
          ...current,
          ...(p as Partial<AppState>),
          profile: { ...current.profile, ...(p.profile as Partial<Profile>) },
          prefs: { ...current.prefs, ...(p.prefs as Partial<Prefs>) },
          notifs: { ...current.notifs, ...(p.notifs as Partial<NotifPrefs>) },
        }
      },
    },
  ),
)

// Keep every open tab in sync: a comment or subscription in one tab shows up in the others
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'trip-reels-v1') useApp.persist.rehydrate()
  })
}

/** The viewer's booking defaults applied on top of a reel's recommended trip */
export function withPrefs(cfg: TripConfig): TripConfig {
  const { prefs } = useApp.getState()
  return {
    ...cfg,
    mode: prefs.mode === 'auto' ? cfg.mode : prefs.mode,
    tier: prefs.tier === 'auto' ? cfg.tier : prefs.tier,
    travelers: prefs.travelers,
  }
}

/** True when a push banner of this kind should show */
export const canNotify = (kind: Exclude<keyof NotifPrefs, 'enabled'>) => {
  const n = useApp.getState().notifs
  return n.enabled && n[kind]
}

// A creator you just belled "posts" their next trip about 12 seconds later (once)
function scheduleUpload(s: AppState, handle: string) {
  const next = upcomingFor(handle)
  if (!next || s.released.some((r) => r.reelId === next.id) || s.uploadDue[handle]) return s.uploadDue
  return { ...s.uploadDue, [handle]: Date.now() + 12000 }
}

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
  shareReelId: string | null
  mapReelId: string | null
  openShare: (reelId: string | null) => void
  openMap: (reelId: string | null) => void
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
  shareReelId: null,
  mapReelId: null,
  openShare: (reelId) => set({ shareReelId: reelId }),
  openMap: (reelId) => set({ mapReelId: reelId }),
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
