import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Bell, BellRing, BookOpen, Check, ChevronDown, ChevronRight, Download, Eye, Film, Gauge, History, ImageDown, Info, MapPin,
  MessageCircleQuestion, MessagesSquare, Minus, Monitor, Moon, Pencil, Plus, RotateCcw, ShieldCheck, Sparkles, Sun, TrendingDown, Trash2, Users,
} from 'lucide-react'
import BottomSheet from '../components/BottomSheet'
import { Avatar, ModeIcon } from '../components/ui'
import { CREATORS, getCity, type Mode, type Tier } from '../lib/mockData'
import { hasProfanity } from '../lib/moderation'
import { DEFAULT_NOTIFS, DEFAULT_PREFS, mergeSample, useApp, useUI, type Profile, type ThemePref } from '../lib/store'
import { useResolvedTheme } from '../lib/theme'
import { cx } from '../lib/utils'

const VERSION = '1.0.0'

export default function Settings() {
  const navigate = useNavigate()
  const s = useApp()
  const { setPicker, notify } = useUI()
  const resolved = useResolvedTheme()
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState<null | 'history' | 'reset'>(null)
  const [guidelines, setGuidelines] = useState(false)
  const origin = getCity(s.origin)
  const bells = s.bells.length

  const exportData = () => {
    const raw = localStorage.getItem('trip-reels-v1') ?? '{}'
    const data = { exportedAt: new Date().toISOString(), app: 'Trip Reels', version: VERSION, ...JSON.parse(raw) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `trip-reels-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    notify({ title: 'Your data is downloading', body: 'A JSON file with your profile, settings, comments and trips.', icon: '📦' })
  }

  const restoreDefaults = () => {
    useApp.setState({ prefs: DEFAULT_PREFS, notifs: DEFAULT_NOTIFS, theme: 'dark' })
    notify({ title: 'Settings restored', body: 'Preferences are back to their defaults. Your trips and activity are untouched.', icon: '↩️' })
  }

  return (
    <div className="no-scrollbar h-full overflow-y-auto pb-12">
      <header className="pt-safe sticky top-0 z-10 flex items-center gap-3 bg-ixi-night/95 px-4 pb-3 backdrop-blur">
        <button onClick={() => (history.length > 1 ? navigate(-1) : navigate('/you'))} aria-label="Back" className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-white/[.07]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="mt-1 font-display text-[24px] font-extrabold">Settings</h1>
      </header>

      {/* profile */}
      <button onClick={() => setEditing(true)} className="mx-5 mt-1 flex w-[calc(100%-2.5rem)] items-center gap-3.5 rounded-[22px] bg-white/[.04] p-3.5 text-left transition-colors hover:bg-white/[.07]">
        <Avatar name={s.profile.name} hue={s.profile.hue} size={54} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-bold">{s.profile.name}</span>
          <span className="block truncate text-[13px] text-white/55">@{s.profile.username}</span>
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/[.08] px-3 py-1.5 text-[12px] font-bold">
          <Pencil size={12} /> Edit
        </span>
      </button>

      <Section title="Appearance">
        <div className="grid grid-cols-3 gap-2.5 p-3" role="radiogroup" aria-label="Theme">
          {THEMES.map((o) => (
            <ThemeCard key={o.id} option={o} on={s.theme === o.id} onClick={() => s.setTheme(o.id)} />
          ))}
        </div>
        <p className="px-4 pb-3.5 text-[12px] text-white/50">
          {s.theme === 'system' ? `Following your phone, currently ${resolved}.` : `${resolved === 'light' ? 'Light' : 'Dark'} mode is on.`} Reels always play on a dark screen.
        </p>
      </Section>

      <Section title="Trip preferences" hint="Used every time you tap Take me there. You can still change them per trip.">
        <Row icon={MapPin} label="Departure city" onClick={() => setPicker(true)} value={origin.name} />
        <Choice<'auto' | Mode>
          icon={Film}
          label="Getting there"
          value={s.prefs.mode}
          onChange={(v) => s.setPref('mode', v)}
          options={[
            { id: 'auto', label: "Creator's pick" },
            { id: 'flight', label: 'Flight', icon: <ModeIcon mode="flight" size={13} /> },
            { id: 'bus', label: 'Bus', icon: <ModeIcon mode="bus" size={13} /> },
            { id: 'train', label: 'Train', icon: <ModeIcon mode="train" size={13} /> },
          ]}
        />
        <Choice<'auto' | Tier>
          icon={Sparkles}
          label="Stay style"
          value={s.prefs.tier}
          onChange={(v) => s.setPref('tier', v)}
          options={[
            { id: 'auto', label: "Creator's pick" },
            { id: 'budget', label: 'Budget' },
            { id: 'standard', label: 'Standard' },
            { id: 'luxury', label: 'Luxury' },
          ]}
        />
        <div className="flex items-center gap-3 px-4 py-3">
          <Users size={18} className="shrink-0 text-white/55" />
          <span className="flex-1">
            <span className="block text-[14px] font-semibold">Travellers</span>
            <span className="block text-[12px] text-white/50">Default group size</span>
          </span>
          <div className="flex items-center gap-1 rounded-full bg-white/[.07] p-1">
            <button aria-label="Fewer travellers" disabled={s.prefs.travelers <= 1} onClick={() => s.setPref('travelers', s.prefs.travelers - 1)} className="grid h-8 w-8 place-items-center rounded-full disabled:opacity-30">
              <Minus size={15} />
            </button>
            <span className="w-6 text-center text-[15px] font-bold tabular-nums" aria-live="polite">{s.prefs.travelers}</span>
            <button aria-label="More travellers" disabled={s.prefs.travelers >= 9} onClick={() => s.setPref('travelers', s.prefs.travelers + 1)} className="grid h-8 w-8 place-items-center rounded-full disabled:opacity-30">
              <Plus size={15} />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Playback">
        <Toggle icon={Film} label="Autoplay reels" hint="Start playing as soon as a reel is on screen" on={s.prefs.autoplay} onChange={(v) => s.setPref('autoplay', v)} />
        <Toggle icon={MessagesSquare} label="Live comments on reels" hint="Show comments drifting up while you watch" on={s.prefs.liveTicker} onChange={(v) => s.setPref('liveTicker', v)} />
        <Toggle icon={ImageDown} label="Data saver" hint="Load lighter images on mobile data" on={s.prefs.dataSaver} onChange={(v) => s.setPref('dataSaver', v)} />
        <Toggle icon={Gauge} label="Reduce motion" hint="Fewer animations and transitions" on={s.prefs.reduceMotion} onChange={(v) => s.setPref('reduceMotion', v)} />
      </Section>

      <Section title="Notifications">
        <Toggle icon={Bell} label="Push notifications" hint="Banners inside the app" on={s.notifs.enabled} onChange={(v) => s.setNotif('enabled', v)} />
        <Toggle icon={BellRing} label="New trips from channels" hint={`From the ${bells} channel${bells === 1 ? '' : 's'} with the bell on`} on={s.notifs.uploads} disabled={!s.notifs.enabled} onChange={(v) => s.setNotif('uploads', v)} indent />
        <Toggle icon={MessageCircleQuestion} label="Creator answers" hint="When a creator answers your question" on={s.notifs.answers} disabled={!s.notifs.enabled} onChange={(v) => s.setNotif('answers', v)} indent />
        <Toggle icon={TrendingDown} label="Price drop alerts" hint="When a Dream Board trip gets cheaper" on={s.notifs.priceDrops} disabled={!s.notifs.enabled} onChange={(v) => s.setNotif('priceDrops', v)} indent />
        <Row icon={Bell} label="Manage channel bells" value={`${bells} on`} onClick={() => navigate('/subs')} />
      </Section>

      <Section title="Privacy & safety">
        <Toggle icon={History} label="Pause watch history" hint="Reels you watch won't be added to History" on={s.prefs.pauseHistory} onChange={(v) => s.setPref('pauseHistory', v)} />
        <Row icon={Trash2} label="Clear watch history" value={s.history.length ? `${s.history.length} reels` : 'Empty'} onClick={() => s.history.length && setConfirm('history')} />
        <Toggle icon={Eye} label="Strict comment filter" hint="Hide comments with offensive words instead of masking them" on={s.prefs.strictFilter} onChange={(v) => s.setPref('strictFilter', v)} />
        <Row icon={ShieldCheck} label="Hidden & blocked" value={`${s.blockedUsers.length} blocked`} onClick={() => navigate('/you?safety=1')} />
        <Row icon={BookOpen} label="Community guidelines" onClick={() => setGuidelines((g) => !g)} expanded={guidelines} />
        <AnimatePresence initial={false}>
          {guidelines && (
            <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden px-4 pb-3.5 text-[13px] leading-snug text-white/70">
              {GUIDELINES.map((g) => (
                <li key={g} className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-ctkt" /> {g}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </Section>

      <Section title="Your data">
        <Row icon={Download} label="Download my data" hint="Profile, settings, comments, questions and trips as JSON" onClick={exportData} />
        <Row
          icon={Sparkles}
          label="Load sample activity"
          hint="Fill your profile with demo subscriptions, history, comments and trips"
          onClick={() => {
            useApp.setState((st) => mergeSample(st))
            notify({ title: 'Sample activity added', body: 'Subscriptions, history, likes, comments, questions and trips are on your profile.', icon: '🧳', tone: 'green' })
          }}
        />
        <Row icon={RotateCcw} label="Restore default settings" hint="Keeps your trips and activity" onClick={restoreDefaults} />
        <Row icon={Trash2} label="Reset app" hint="Erase everything on this device" danger onClick={() => setConfirm('reset')} />
      </Section>

      <Section title="About">
        <Row icon={Info} label="Version" value={VERSION} />
        <p className="px-4 pb-3.5 text-[12px] leading-snug text-white/50">
          Trip Reels is an ixigo Creator Hub concept. Flights and stays on ixigo, buses on AbhiBus, trains on ConfirmTkt. Sign-in and sync across devices arrive with accounts.
        </p>
      </Section>

      <EditProfile open={editing} onClose={() => setEditing(false)} />

      <BottomSheet open={confirm !== null} onClose={() => setConfirm(null)} label="Confirm">
        {confirm && (
          <div className="pb-safe px-5 pb-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-abhi/15">
              <Trash2 size={22} className="text-abhi" />
            </span>
            <h2 className="mt-3 font-display text-[19px] font-bold">{confirm === 'history' ? 'Clear watch history?' : 'Reset the app?'}</h2>
            <p className="mx-auto mt-1.5 max-w-[32ch] text-[13px] text-white/60">
              {confirm === 'history'
                ? 'This removes every reel from your History. It can’t be undone.'
                : 'This erases your profile, subscriptions, comments, questions, Dream Board, trips and settings on this device. It can’t be undone.'}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button onClick={() => setConfirm(null)} className="rounded-2xl bg-white/[.08] py-3 text-[14px] font-bold">Cancel</button>
              <button
                onClick={() => {
                  if (confirm === 'history') {
                    s.clearHistory()
                    setConfirm(null)
                    notify({ title: 'Watch history cleared', body: 'Your History is empty.', icon: '🧹' })
                  } else {
                    localStorage.removeItem('trip-reels-v1')
                    location.href = '/'
                  }
                }}
                className="rounded-2xl bg-abhi py-3 text-[14px] font-bold"
              >
                {confirm === 'history' ? 'Clear' : 'Erase everything'}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

const GUIDELINES = [
  'Be kind. No harassment, hate speech or bullying.',
  'Share real experiences. No fake prices or unsafe travel advice.',
  'No spam, self-promotion, links or phone numbers in comments.',
  'Respect privacy. Don’t post other people’s personal details.',
  'Report anything that breaks these rules. Our team reviews every report within 24 hours.',
]

// ---- building blocks ------------------------------------------------------------

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mx-5 mt-6">
      <h2 className="px-1 text-[12px] font-bold uppercase tracking-wide text-white/45">{title}</h2>
      {hint && <p className="mt-0.5 px-1 text-[12px] text-white/45">{hint}</p>}
      <div className="mt-2 divide-y divide-white/[.06] overflow-hidden rounded-[20px] bg-white/[.04]">{children}</div>
    </section>
  )
}

function Row({ icon: Icon, label, hint, value, onClick, danger, expanded }: { icon: typeof Bell; label: string; hint?: string; value?: string; onClick?: () => void; danger?: boolean; expanded?: boolean }) {
  const inner = (
    <>
      <Icon size={18} className={cx('shrink-0', danger ? 'text-abhi' : 'text-white/55')} />
      <span className="min-w-0 flex-1">
        <span className={cx('block text-[14px] font-semibold', danger && 'text-abhi')}>{label}</span>
        {hint && <span className="block text-[12px] text-white/50">{hint}</span>}
      </span>
      {value && <span className="shrink-0 text-[13px] text-white/50">{value}</span>}
      {onClick && (expanded === undefined ? <ChevronRight size={16} className="shrink-0 text-white/30" /> : <ChevronDown size={16} className={cx('shrink-0 text-white/30 transition-transform', expanded && 'rotate-180')} />)}
    </>
  )
  return onClick ? (
    <button onClick={onClick} aria-expanded={expanded} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[.04]">
      {inner}
    </button>
  ) : (
    <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
  )
}

function Toggle({ icon: Icon, label, hint, on, onChange, disabled, indent }: { icon: typeof Bell; label: string; hint?: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean; indent?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on && !disabled}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cx('flex w-full items-center gap-3 py-3 pr-4 text-left transition-opacity disabled:opacity-40', indent ? 'pl-8' : 'pl-4')}
    >
      <Icon size={18} className="shrink-0 text-white/55" />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">{label}</span>
        {hint && <span className="block text-[12px] text-white/50">{hint}</span>}
      </span>
      <span className={cx('relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors', on && !disabled ? 'bg-ctkt' : 'bg-white/15')}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} className={cx('absolute top-[3px] h-5 w-5 rounded-full bg-snow shadow', on && !disabled ? 'right-[3px]' : 'left-[3px]')} />
      </span>
    </button>
  )
}

function Choice<T extends string>({ icon: Icon, label, value, onChange, options }: { icon: typeof Bell; label: string; value: T; onChange: (v: T) => void; options: { id: T; label: string; icon?: ReactNode }[] }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon size={18} className="shrink-0 text-white/55" />
        <span className="text-[14px] font-semibold">{label}</span>
      </div>
      <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pl-[30px]" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={cx('flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors', value === o.id ? 'bg-white text-ixi-night' : 'bg-white/[.07] text-white/70')}
          >
            {o.icon} {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---- appearance --------------------------------------------------------------

const THEMES: { id: ThemePref; label: string; icon: typeof Sun; hint: string }[] = [
  { id: 'light', label: 'Light', icon: Sun, hint: 'Bright and airy' },
  { id: 'dark', label: 'Dark', icon: Moon, hint: 'Easy on the eyes' },
  { id: 'system', label: 'System', icon: Monitor, hint: 'Match my phone' },
]

function ThemeCard({ option: o, on, onClick }: { option: (typeof THEMES)[number]; on: boolean; onClick: () => void }) {
  const pane = (light: boolean) => (
    <div className={cx('flex h-full flex-1 flex-col gap-1 p-1.5', light ? 'bg-[#F4F6FB]' : 'bg-[#060B22]')}>
      <div className={cx('h-1.5 w-3/4 rounded-full', light ? 'bg-[#0D1430]/70' : 'bg-[#fff]/80')} />
      <div className={cx('h-5 rounded-md', light ? 'bg-[#fff] shadow-sm' : 'bg-[#15214F]')} />
      <div className={cx('h-1.5 w-1/2 rounded-full', light ? 'bg-[#0D1430]/25' : 'bg-[#fff]/25')} />
      <div className="mt-auto h-2 rounded-full bg-ixi-orange" />
    </div>
  )
  return (
    <motion.button whileTap={{ scale: 0.96 }} role="radio" aria-checked={on} onClick={onClick} className={cx('relative rounded-2xl border-2 p-2 text-left transition-colors', on ? 'border-ixi-orange' : 'border-white/10')}>
      <div className="flex h-[70px] overflow-hidden rounded-xl border border-white/10" aria-hidden>
        {o.id === 'system' ? (
          <>
            {pane(true)}
            {pane(false)}
          </>
        ) : (
          pane(o.id === 'light')
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[13px] font-bold">
        <o.icon size={14} /> {o.label}
      </div>
      <div className="text-[11px] text-white/50">{o.hint}</div>
      {on && (
        <motion.span layoutId="theme-check" className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ixi-orange">
          <Check size={12} strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  )
}

// ---- edit profile --------------------------------------------------------------

const HUES: [string, string][] = [
  ['#F57224', '#8B5CF6'],
  ['#14B87A', '#38D9C0'],
  ['#0EA5E9', '#8B5CF6'],
  ['#E8384F', '#F59E0B'],
  ['#F59E0B', '#F57224'],
  ['#24316A', '#0EA5E9'],
]

function EditProfile({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} label="Edit profile">
      {open && <ProfileForm onClose={onClose} />}
    </BottomSheet>
  )
}

function ProfileForm({ onClose }: { onClose: () => void }) {
  const profile = useApp((s) => s.profile)
  const setProfile = useApp((s) => s.setProfile)
  const notify = useUI((s) => s.notify)
  const [draft, setDraft] = useState<Profile>(profile)
  const set = (p: Partial<Profile>) => setDraft((d) => ({ ...d, ...p }))

  const name = draft.name.trim()
  const username = draft.username.trim().toLowerCase()
  const errors = {
    name: !name ? 'Add a name.' : hasProfanity(name) ? 'Please choose a friendlier name.' : null,
    username: !/^[a-z0-9._]{3,20}$/.test(username)
      ? '3 to 20 characters: letters, numbers, dots and underscores.'
      : CREATORS.some((c) => c.handle === username) || username === 'you'
        ? 'That username is taken.'
        : hasProfanity(username)
          ? 'Please choose a friendlier username.'
          : null,
    bio: hasProfanity(draft.bio) ? 'Your bio includes language that breaks our guidelines.' : null,
  }
  const valid = !errors.name && !errors.username && !errors.bio

  const save = () => {
    if (!valid) return
    setProfile({ ...draft, name, username, bio: draft.bio.trim() })
    notify({ title: 'Profile updated', body: `Looking good, ${name.split(' ')[0]}.`, icon: '✨', tone: 'green' })
    onClose()
  }

  return (
    <form
      className="pb-safe px-5 pb-5"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <h2 className="text-center text-[16px] font-bold">Edit profile</h2>
      <div className="mt-4 flex flex-col items-center">
        <Avatar name={name || 'You'} hue={draft.hue} size={76} />
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Avatar colour">
          {HUES.map((h) => {
            const on = h[0] === draft.hue[0] && h[1] === draft.hue[1]
            return (
              <button
                key={h.join()}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`Colour ${h.join(' to ')}`}
                onClick={() => set({ hue: h })}
                className={cx('h-8 w-8 rounded-full ring-offset-2 ring-offset-ixi-navy transition-shadow', on && 'ring-2 ring-ixi-orange')}
                style={{ background: `linear-gradient(135deg, ${h[0]}, ${h[1]})` }}
              />
            )
          })}
        </div>
      </div>

      <Field label="Name" error={errors.name} count={`${draft.name.length}/30`}>
        <input value={draft.name} maxLength={30} onChange={(e) => set({ name: e.target.value })} className="w-full bg-transparent text-[15px] outline-none" autoComplete="name" />
      </Field>
      <Field label="Username" error={errors.username}>
        <div className="flex items-center">
          <span className="text-white/40">@</span>
          <input
            value={draft.username}
            maxLength={20}
            onChange={(e) => set({ username: e.target.value.toLowerCase().replace(/\s/g, '') })}
            className="w-full bg-transparent text-[15px] outline-none"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
      </Field>
      <Field label="Bio" error={errors.bio} count={`${draft.bio.length}/120`}>
        <textarea value={draft.bio} maxLength={120} rows={2} onChange={(e) => set({ bio: e.target.value })} placeholder="Weekend wanderer, always hunting the next sunset" className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-white/35" />
      </Field>

      <button type="submit" disabled={!valid} className="mt-5 w-full rounded-2xl bg-ixi-orange py-3 text-[15px] font-bold transition-opacity disabled:opacity-40">
        Save
      </button>
    </form>
  )
}

function Field({ label, error, count, children }: { label: string; error: string | null; count?: string; children: ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="flex justify-between px-1 text-[12px] font-semibold text-white/55">
        {label} {count && <span className="font-normal text-white/35">{count}</span>}
      </span>
      <div className={cx('mt-1 rounded-xl border bg-white/[.05] px-3.5 py-2.5', error ? 'border-abhi/70' : 'border-white/10 focus-within:border-ixi-orange')}>{children}</div>
      {error && <span className="mt-1 block px-1 text-[12px] text-danger">{error}</span>}
    </label>
  )
}
