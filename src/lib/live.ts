import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { LIVE_LINES, LIVE_USERS, SEED_COMMENTS, type Comment, type Reel } from './mockData'
import { useApp } from './store'
import { uid } from './utils'

// Comments that arrived while this tab was open count as "live"
export const SESSION_START = Date.now()

interface LiveState {
  byReel: Record<string, Comment[]>
  push: (c: Comment) => void
}

/** Simulated viewer chatter, in memory only. In production this is a websocket per reel. */
export const useLive = create<LiveState>()((set) => ({
  byReel: {},
  push: (c) => set((s) => ({ byReel: { ...s.byReel, [c.reelId]: [...(s.byReel[c.reelId] ?? []).slice(-59), c] } })),
}))

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

/** Streams viewer comments into a reel while it is on screen */
export function useLiveStream(reel: Reel, active: boolean) {
  const push = useLive((s) => s.push)
  useEffect(() => {
    if (!active) return
    let t = 0
    const tick = () => {
      push({
        id: uid('L'),
        reelId: reel.id,
        user: pick(LIVE_USERS),
        text: pick(LIVE_LINES).replace('{place}', reel.destination.name),
        at: Date.now(),
        likes: Math.floor(Math.random() * 4),
      })
      t = window.setTimeout(tick, 2400 + Math.random() * 3600)
    }
    t = window.setTimeout(tick, 1500)
    return () => clearTimeout(t)
  }, [reel, active, push])
}

/** Every comment on a reel: seeded history, the viewer's own, and live chatter */
export function useReelComments(reelId: string) {
  const mine = useApp((s) => s.myComments)
  const live = useLive((s) => s.byReel[reelId])
  return useMemo(() => {
    const all = [...SEED_COMMENTS.filter((c) => c.reelId === reelId), ...mine.filter((c) => c.reelId === reelId), ...(live ?? [])]
    return all
  }, [reelId, mine, live])
}

/** Display count: the reel's historic total plus anything added this session */
export function useCommentCount(reel: Reel) {
  const mine = useApp((s) => s.myComments.filter((c) => c.reelId === reel.id).length)
  const live = useLive((s) => s.byReel[reel.id]?.length ?? 0)
  return reel.comments + mine + live
}

/** The newest few top-level comments posted during this session, for the on-reel ticker */
export function useLiveTicker(reelId: string, n = 2) {
  const all = useReelComments(reelId)
  return useMemo(
    () => all.filter((c) => !c.parentId && c.at >= SESSION_START).sort((a, b) => a.at - b.at).slice(-n),
    [all, n],
  )
}
