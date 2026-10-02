import { useMemo } from 'react'
import { GUIDE_STATS, LB_DESTS, REELS, SEED_QUESTIONS, getReel, type Comment, type Question, type Reel } from './mockData'
import { hasProfanity } from './moderation'
import { useApp } from './store'

/** Every reel the viewer can see: freshly released uploads first, then the catalogue */
export function useAllReels(): Reel[] {
  const released = useApp((s) => s.released)
  return useMemo(() => {
    const fresh = [...released].sort((a, b) => b.at - a.at).map((r) => getReel(r.reelId)).filter((r): r is Reel => !!r)
    return [...fresh, ...REELS]
  }, [released])
}

export function useReelsBy(handle: string) {
  const all = useAllReels()
  return useMemo(() => all.filter((r) => r.creator.handle === handle), [all, handle])
}

/** Released uploads the viewer hasn't watched or opened the channel for yet */
export function useUnseenUploads() {
  const released = useApp((s) => s.released)
  const seen = useApp((s) => s.seenUploads)
  const following = useApp((s) => s.following)
  return useMemo(
    () => released.map((r) => getReel(r.reelId)).filter((r): r is Reel => !!r && !seen.includes(r.id) && following.includes(r.creator.handle)),
    [released, seen, following],
  )
}

export function useIsNew(reelId: string) {
  return useApp((s) => s.released.some((r) => r.reelId === reelId) && !s.seenUploads.includes(reelId))
}

/** Hidden, reported and blocked content filtered out, for any list of comments or questions */
export function useModerationFilter() {
  const hidden = useApp((s) => s.hiddenComments)
  const blocked = useApp((s) => s.blockedUsers)
  const strict = useApp((s) => s.prefs.strictFilter)
  // strict mode hides anything with blocked language instead of masking it
  return useMemo(
    () => <T extends Comment | Question>(items: T[]) =>
      items.filter((c) => !hidden.includes(c.id) && !blocked.includes(c.user) && !(strict && hasProfanity(c.text))),
    [hidden, blocked, strict],
  )
}

/** A creator's Q&A: seeded history plus the viewer's own questions */
export function useQuestions(creator: string) {
  const mine = useApp((s) => s.myQuestions)
  const filter = useModerationFilter()
  return useMemo(
    () => filter([...SEED_QUESTIONS.filter((q) => q.creator === creator), ...mine.filter((q) => q.creator === creator)]),
    [creator, mine, filter],
  )
}

// ---- Leaderboards -----------------------------------------------------------

export type Period = 'week' | 'month'

export interface Standing {
  handle: string
  clones: number
  rank: number
  delta: number | null // places moved since last week, null when unknown
  yours: number // trips the viewer booked through this creator in the period
}

/** Rankings per destination (or all of India), including the viewer's own bookings */
export function useLeaderboard(dest: string | 'all', period: Period): Standing[] {
  const trips = useApp((s) => s.trips)
  return useMemo(() => {
    const window = period === 'week' ? 7 : 30
    const since = Date.now() - window * 86_400_000
    const yours: Record<string, number> = {}
    for (const t of trips) {
      if (t.id.startsWith('seed') || t.createdAt < since) continue
      const reel = getReel(t.config.reelId)
      if (!reel || (dest !== 'all' && destKey(reel) !== dest)) continue
      yours[reel.creator.handle] = (yours[reel.creator.handle] ?? 0) + 1
    }
    const totals: Record<string, { clones: number; last: number | null }> = {}
    for (const g of GUIDE_STATS) {
      if (dest !== 'all' && g.dest !== dest) continue
      const t = (totals[g.handle] ??= { clones: 0, last: dest === 'all' ? null : g.lastWeekRank })
      t.clones += g[period]
    }
    for (const h of Object.keys(yours)) totals[h] ??= { clones: 0, last: null }
    return Object.entries(totals)
      .map(([handle, t]) => ({ handle, clones: t.clones + (yours[handle] ?? 0), last: t.last, yours: yours[handle] ?? 0 }))
      .sort((a, b) => b.clones - a.clones)
      .map((s, i) => ({ handle: s.handle, clones: s.clones, rank: i + 1, delta: s.last === null || period === 'month' ? null : s.last - (i + 1), yours: s.yours }))
  }, [trips, dest, period])
}

// leaderboard destination ids match reel destination ids
export const destKey = (reel: Reel) => reel.destination.id

/** "Top Goa guide this month" badges: destinations where this creator ranks first by monthly clones */
export function topGuideTitles(handle: string) {
  return LB_DESTS.filter((d) => {
    const rows = GUIDE_STATS.filter((g) => g.dest === d.id).sort((a, b) => b.month - a.month)
    return rows[0]?.handle === handle
  })
}
