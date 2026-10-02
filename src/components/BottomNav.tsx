import { motion } from 'framer-motion'
import { Clapperboard, Compass, Luggage, Sparkles, SquarePlay, UserRound } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useUnseenUploads } from '../lib/reels'
import { useApp } from '../lib/store'
import { cx } from '../lib/utils'

const TABS = [
  { to: '/', label: 'Reels', icon: Clapperboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/subs', label: 'Channels', icon: SquarePlay },
  { to: '/dreams', label: 'Dreams', icon: Sparkles },
  { to: '/trips', label: 'Trips', icon: Luggage },
  { to: '/you', label: 'You', icon: UserRound },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const drops = useApp((s) => s.dreams.filter((d) => d.currentPrice < d.savedPrice).length)
  const fresh = useUnseenUploads().length
  const onFeed = pathname === '/'
  return (
    <nav
      aria-label="Main"
      className={cx('pb-safe relative z-30 shrink-0 border-t transition-colors', onFeed ? 'theme-dark border-white/5 bg-black' : 'border-white/10 bg-ixi-night/95 backdrop-blur')}
    >
      <ul className="mx-auto flex max-w-[480px] items-stretch justify-around px-2 sm:pb-3">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active =
            to === '/' ? pathname === '/'
            : to === '/subs' ? ['/subs', '/c/', '/leaderboard'].some((p) => pathname.startsWith(p))
            : to === '/you' ? ['/you', '/creator', '/settings'].some((p) => pathname.startsWith(p))
            : pathname.startsWith(to)
          return (
            <li key={to} className="flex-1">
              <NavLink to={to} className="relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold">
                {active && <motion.span layoutId="nav-pill" className="absolute top-1 h-8 w-11 rounded-full bg-ixi-orange/15" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">
                  <Icon size={21} className={active ? 'text-ixi-orange' : 'text-white/55'} strokeWidth={active ? 2.4 : 2} />
                  {to === '/subs' && fresh > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ixi-orange px-1 text-[9px] font-bold text-white" aria-label={`${fresh} new trips`}>{fresh}</span>
                  )}
                  {to === '/dreams' && drops > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ctkt px-1 text-[9px] font-bold text-white">{drops}</span>
                  )}
                </span>
                <span className={active ? 'text-white' : 'text-white/50'}>{label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
