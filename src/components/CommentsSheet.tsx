import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowUp, ChevronDown, ChevronUp, Heart, MoreVertical, Pin, SendHorizontal, X } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { UserAvatar } from './social'
import ModerationSheet, { type ModTarget } from './ModerationSheet'
import { getCreator, type Comment, type Reel } from '../lib/mockData'
import { useCommentCount, useReelComments } from '../lib/live'
import { checkPost, mask } from '../lib/moderation'
import { useModerationFilter } from '../lib/reels'
import { ME, useApp } from '../lib/store'
import { ago, compact, cx } from '../lib/utils'

const QUICK = ['🔥', '😍', '👏', '🙌', '🏖️', '✈️', '❤️']

export default function CommentsSheet({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  return (
    <BottomSheet open={!!reel} onClose={onClose} label="Comments" height="74%">
      {reel && <Comments reel={reel} onClose={onClose} />}
    </BottomSheet>
  )
}

function Comments({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const navigate = useNavigate()
  const filter = useModerationFilter()
  const raw = useReelComments(reel.id)
  const all = useMemo(() => filter(raw), [raw, filter])
  const myComments = useApp((s) => s.myComments)
  const [error, setError] = useState<string | null>(null)
  const [modTarget, setModTarget] = useState<ModTarget | null>(null)
  const count = useCommentCount(reel)
  const liked = useApp((s) => s.likedComments)
  const addComment = useApp((s) => s.addComment)
  const [sort, setSort] = useState<'top' | 'new'>('top')
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [seenAt, setSeenAt] = useState(() => Date.now())
  const [, setTick] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // refresh the "5m" stamps
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const score = (c: Comment) => c.likes + (liked.includes(c.id) ? 1 : 0)

  const top = useMemo(() => {
    const roots = all.filter((c) => !c.parentId)
    if (sort === 'new') return roots.sort((a, b) => b.at - a.at)
    // Pinned first, then your own comments (so you see what you just posted), then by likes
    return roots.sort(
      (a, b) =>
        Number(!!b.pinned) - Number(!!a.pinned) ||
        Number(b.user === ME.handle) - Number(a.user === ME.handle) ||
        (a.user === ME.handle && b.user === ME.handle ? b.at - a.at : score(b) - score(a)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, sort, liked])

  const repliesOf = (id: string) => all.filter((c) => c.parentId === id).sort((a, b) => a.at - b.at)

  // in Top, live comments sink to the bottom, so surface a pill instead
  const fresh = sort === 'top' ? top.filter((c) => c.at > seenAt && c.user !== ME.handle).length : 0

  const showNewest = () => {
    setSort('new')
    setSeenAt(Date.now())
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startReply = (c: Comment) => {
    setReplyTo(c)
    // replying to a reply tags the person, YouTube-style
    if (c.parentId) setText(`@${c.user} `)
    inputRef.current?.focus()
  }

  const submit = () => {
    const t = text.trim()
    if (!t) return
    const verdict = checkPost(t, myComments)
    if (!verdict.ok) {
      setError(verdict.reason)
      return
    }
    setError(null)
    const parent = replyTo ? replyTo.parentId ?? replyTo.id : undefined
    addComment(reel.id, t, parent)
    if (parent) setExpanded((e) => [...new Set([...e, parent])])
    else listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setText('')
    setReplyTo(null)
  }

  const openChannel = (handle: string) => {
    if (!getCreator(handle)) return
    onClose()
    navigate(`/c/${handle}`)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-5 pb-3">
        <div>
          <h2 className="text-[16px] font-bold">
            Comments <span className="ml-1 font-semibold text-white/50">{count.toLocaleString('en-IN')}</span>
          </h2>
        </div>
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Sort comments">
          {(['top', 'new'] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={sort === s}
              onClick={() => (s === 'new' ? showNewest() : setSort('top'))}
              className={cx('rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors', sort === s ? 'bg-white text-ixi-night' : 'bg-white/[.07] text-white/75')}
            >
              {s === 'top' ? 'Top' : 'Newest'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <AnimatePresence>
          {fresh > 0 && (
            <motion.button
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onClick={showNewest}
              className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ixi-orange px-3 py-1.5 text-[12px] font-bold shadow-glow"
            >
              <ArrowUp size={13} strokeWidth={3} /> {fresh} new comment{fresh === 1 ? '' : 's'}
            </motion.button>
          )}
        </AnimatePresence>

        <ul ref={listRef} className="no-scrollbar h-full space-y-5 overflow-y-auto px-5 pb-4 pt-1">
          <AnimatePresence initial={false}>
            {top.map((c) => {
              const replies = repliesOf(c.id)
              const open = expanded.includes(c.id)
              return (
                <motion.li key={c.id} layout="position" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Row c={c} reel={reel} onReply={startReply} onUser={openChannel} onMore={setModTarget} />
                  {replies.length > 0 && (
                    <div className="ml-[46px] mt-2">
                      <button
                        onClick={() => setExpanded((e) => (open ? e.filter((x) => x !== c.id) : [...e, c.id]))}
                        className="hit flex items-center gap-1 text-[12px] font-bold text-link"
                        aria-expanded={open}
                      >
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {open ? 'Hide' : `${replies.length}`} {replies.length === 1 ? 'reply' : 'replies'}
                        {!open && replies.some((r) => r.user === reel.creator.handle) && (
                          <span className="ml-1 font-semibold text-white/50">· from the creator</span>
                        )}
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-4 overflow-hidden">
                            {replies.map((r) => (
                              <li key={r.id}>
                                <Row c={r} reel={reel} onReply={startReply} onUser={openChannel} onMore={setModTarget} small />
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
          {top.length === 0 && <li className="py-10 text-center text-[13px] text-white/50">No comments to show. Be the first!</li>}
        </ul>
      </div>

      {/* composer */}
      <div className="pb-safe shrink-0 border-t border-white/10 bg-ixi-navy px-4 pt-2.5">
        <div className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
          {QUICK.map((e) => (
            <button key={e} onClick={() => { setText((t) => t + e); inputRef.current?.focus() }} className="shrink-0 rounded-full px-2 py-1 text-[20px] transition-colors hover:bg-white/10" aria-label={`Add ${e}`}>
              {e}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mb-2 flex items-center justify-between rounded-lg bg-white/[.06] px-3 py-1.5 text-[12px] text-white/70">
                <span>
                  Replying to <span className="font-semibold text-white">@{replyTo.user}</span>
                </span>
                <button onClick={() => { setReplyTo(null); setText('') }} aria-label="Cancel reply"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-start gap-1.5 overflow-hidden rounded-lg bg-abhi/15 px-3 py-2 text-[12px] font-medium text-danger"
            >
              <AlertCircle size={14} className="mt-px shrink-0" /> {error}
            </motion.p>
          )}
        </AnimatePresence>
        <form
          className="flex items-center gap-2.5 pb-3"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <UserAvatar handle={ME.handle} size={32} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (error) setError(null)
            }}
            maxLength={300}
            placeholder={replyTo ? 'Add a reply…' : `Add a comment for @${reel.creator.handle}…`}
            className="min-w-0 flex-1 rounded-full bg-white/[.07] px-4 py-2.5 text-[14px] outline-none placeholder:text-white/40 focus:bg-white/[.1]"
            aria-label={replyTo ? 'Reply' : 'Comment'}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ixi-orange transition-opacity disabled:opacity-30"
            aria-label="Post"
          >
            <SendHorizontal size={17} />
          </button>
        </form>
        <p className="-mt-1.5 pb-2 text-center text-[10px] text-white/35">Be kind. Comments with abuse, spam or links are blocked automatically.</p>
      </div>
      <ModerationSheet target={modTarget} onClose={() => setModTarget(null)} />
    </div>
  )
}

function Row({ c, reel, onReply, onUser, onMore, small }: { c: Comment; reel: Reel; onReply: (c: Comment) => void; onUser: (h: string) => void; onMore: (t: ModTarget) => void; small?: boolean }) {
  const liked = useApp((s) => s.likedComments.includes(c.id))
  const toggleCommentLike = useApp((s) => s.toggleCommentLike)
  const deleteComment = useApp((s) => s.deleteComment)
  const text = mask(c.text)
  const isOwner = c.user === reel.creator.handle
  const mine = c.user === ME.handle
  const isCreator = !!getCreator(c.user)
  const creatorLiked = isOwner || c.likes > 300

  return (
    <div className="flex gap-3">
      <button onClick={() => onUser(c.user)} disabled={!isCreator} aria-label={isCreator ? `Open @${c.user}'s channel` : undefined} className="h-fit">
        <UserAvatar handle={c.user} size={small ? 26 : 34} />
      </button>
      <div className="min-w-0 flex-1 text-[14px]">
        {c.pinned && (
          <div className="mb-0.5 flex items-center gap-1 text-[11px] text-white/50">
            <Pin size={11} /> Pinned by @{reel.creator.handle}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-1.5 text-[12px] text-white/50">
          {isOwner ? (
            <button onClick={() => onUser(c.user)} className="rounded-full bg-white/15 px-2 py-px font-semibold text-white">
              @{c.user}
            </button>
          ) : (
            <button onClick={() => onUser(c.user)} disabled={!isCreator} className={cx('font-semibold', mine ? 'text-ixi-ember' : 'text-white/75')}>
              {mine ? 'You' : `@${c.user}`}
            </button>
          )}
          <span>{ago(c.at)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words leading-snug">{text}</p>
        <div className="mt-1.5 flex items-center gap-4 text-[12px] text-white/55">
          <button onClick={() => toggleCommentLike(c.id)} className="hit flex items-center gap-1" aria-pressed={liked} aria-label={liked ? 'Unlike comment' : 'Like comment'}>
            <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 14 }}>
              <Heart size={15} fill={liked ? '#FF3D57' : 'transparent'} stroke={liked ? '#FF3D57' : 'currentColor'} />
            </motion.span>
            {c.likes + (liked ? 1 : 0) > 0 && compact(c.likes + (liked ? 1 : 0))}
          </button>
          <button onClick={() => onReply(c)} className="hit font-semibold">Reply</button>
          {!isOwner && creatorLiked && !mine && (
            <span className="flex items-center gap-1 text-[11px]" title={`Liked by @${reel.creator.handle}`}>
              <Heart size={11} fill="#FF3D57" stroke="none" /> by creator
            </span>
          )}
          <button
            onClick={() => onMore({ id: c.id, user: c.user, text, kind: 'comment', mine, onDelete: () => deleteComment(c.id) })}
            className="-mr-1 ml-auto grid h-7 w-7 place-items-center rounded-full text-white/45 hover:bg-white/10 hover:text-white"
            aria-label="More options"
          >
            <MoreVertical size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
