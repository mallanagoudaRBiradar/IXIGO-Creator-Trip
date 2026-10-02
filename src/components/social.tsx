import { motion } from 'framer-motion'
import { BadgeCheck, Bell, BellOff, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCreator, type Creator } from '../lib/mockData'
import { useReelsBy } from '../lib/reels'
import { ME, useApp, useUI } from '../lib/store'
import { compact, cx } from '../lib/utils'
import { Avatar } from './ui'

const GUEST_HUES: [string, string][] = [
  ['#24316A', '#F57224'],
  ['#0EA5E9', '#8B5CF6'],
  ['#14B87A', '#0EA5E9'],
  ['#E8384F', '#F59E0B'],
  ['#8B5CF6', '#E8384F'],
]

/** Avatar for any comment author: the viewer, a known creator, or a stable colour for everyone else */
export function UserAvatar({ handle, size = 34 }: { handle: string; size?: number }) {
  if (handle === ME.handle) return <MyAvatar size={size} />
  const c = getCreator(handle)
  if (c) return <Avatar name={c.name} hue={c.hue} size={size} />
  const h = [...handle].reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return <Avatar name={handle.replace(/[._]/g, ' ')} hue={GUEST_HUES[h % GUEST_HUES.length]} size={size} />
}

function MyAvatar({ size }: { size: number }) {
  const profile = useApp((s) => s.profile)
  return <Avatar name={profile.name} hue={profile.hue} size={size} />
}

export function useSubscribers(c: Creator) {
  const subscribed = useApp((s) => s.following.includes(c.handle))
  return c.subscribers + (subscribed ? 1 : 0)
}

export function SubscribeButton({ creator, size = 'md', className }: { creator: Creator; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const subscribed = useApp((s) => s.following.includes(creator.handle))
  const toggleFollow = useApp((s) => s.toggleFollow)
  const notify = useUI((s) => s.notify)
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFollow(creator.handle)
    notify(
      subscribed
        ? { title: `Unsubscribed from @${creator.handle}`, body: 'Their trips will no longer show in My Channels.', icon: '👋' }
        : { title: `Subscribed to @${creator.handle}`, body: "New trips land in My Channels. We'll ping you when they post.", icon: '🔔', tone: 'green' },
    )
  }
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={subscribed}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1 rounded-full font-bold transition-colors',
        size === 'sm' && 'px-3 py-1 text-[12px]',
        size === 'md' && 'px-4 py-2 text-[13px]',
        size === 'lg' && 'px-5 py-2.5 text-[14px]',
        subscribed ? 'bg-white/15 text-white backdrop-blur' : 'bg-white text-ixi-night',
        className,
      )}
    >
      {subscribed && <Check size={size === 'sm' ? 12 : 15} strokeWidth={3} />}
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </motion.button>
  )
}

export function BellButton({ creator }: { creator: Creator }) {
  const on = useApp((s) => s.bells.includes(creator.handle))
  const toggleBell = useApp((s) => s.toggleBell)
  const notify = useUI((s) => s.notify)
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        toggleBell(creator.handle)
        notify(on ? { title: 'Notifications off', body: `You won't be pinged for @${creator.handle}'s new trips.`, icon: '🔕' } : { title: 'Notifications on', body: `We'll ping you the moment @${creator.handle} posts.`, icon: '🔔' })
      }}
      aria-label={on ? 'Turn off notifications' : 'Turn on notifications'}
      aria-pressed={on}
      className={cx('grid h-10 w-10 place-items-center rounded-full transition-colors', on ? 'bg-white/15 text-white' : 'bg-white/[.06] text-white/60')}
    >
      {on ? <Bell size={18} fill="currentColor" /> : <BellOff size={18} />}
    </motion.button>
  )
}

/** One creator in a list: avatar, name, counts and a subscribe button. Tapping opens the channel. */
export function CreatorRow({ creator }: { creator: Creator }) {
  const navigate = useNavigate()
  const subs = useSubscribers(creator)
  const n = useReelsBy(creator.handle).length
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/c/${creator.handle}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/c/${creator.handle}`)}
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/[.03] p-3 transition-colors hover:bg-white/[.06]"
    >
      <Avatar name={creator.name} hue={creator.hue} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 truncate text-[14px] font-bold">
          {creator.name} {creator.tier === 'Guru' && <BadgeCheck size={14} className="shrink-0 text-verify" />}
        </div>
        <div className="truncate text-[12px] text-white/55">
          @{creator.handle} · {compact(subs)} subscribers · {n} trip{n === 1 ? '' : 's'}
        </div>
      </div>
      <SubscribeButton creator={creator} size="sm" />
    </li>
  )
}

/** Round avatar tile used in horizontal creator strips */
export function CreatorChip({ creator, dot }: { creator: Creator; dot?: boolean }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(`/c/${creator.handle}`)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center">
      <span className="relative">
        <Avatar name={creator.name} hue={creator.hue} size={60} />
        {dot && <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ixi-night bg-ixi-orange" />}
      </span>
      <span className="w-full truncate text-[11px] font-semibold text-white/80">{creator.name.split(' ')[0]}</span>
    </button>
  )
}
