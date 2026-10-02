import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Mail, MessageSquare, MoreHorizontal, QrCode, Users } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { ModeIcon, SmartImage } from './ui'
import { getCity, getReel, type Reel } from '../lib/mockData'
import { fromPrice } from '../lib/pricing'
import { useApp, useUI } from '../lib/store'
import { cx, inr } from '../lib/utils'

/** The public link for a reel. `ref=share` lets the app greet people who arrive from a share. */
export const reelLink = (reelId: string) => `${location.origin}/?reel=${reelId}&ref=share`

export default function ShareSheet() {
  const reelId = useUI((s) => s.shareReelId)
  const openShare = useUI((s) => s.openShare)
  const reel = reelId ? getReel(reelId) : undefined
  return (
    <BottomSheet open={!!reel} onClose={() => openShare(null)} label="Share trip" z={60}>
      {reel && <Share reel={reel} />}
    </BottomSheet>
  )
}

function Share({ reel }: { reel: Reel }) {
  const origin = getCity(useApp((s) => s.origin))
  const addShare = useApp((s) => s.addShare)
  const { notify, openShare, openSheet } = useUI()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const url = reelLink(reel.id)
  const price = inr(fromPrice(reel, origin))
  const message = `${reel.title} by @${reel.creator.handle} ✈️\nBook this exact trip from ${origin.name} for ${price} per person on Trip Reels:`
  const full = `${message}\n${url}`
  const enc = encodeURIComponent

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard blocked (http on LAN): fall back to a hidden textarea
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    addShare(reel.id)
    notify({ title: 'Link copied', body: 'Anyone with the link lands right on this trip.', icon: '🔗' })
  }

  const open = (href: string) => {
    addShare(reel.id)
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  const native = async () => {
    try {
      await navigator.share({ title: reel.title, text: message, url })
      addShare(reel.id)
    } catch {
      // dismissed
    }
  }

  const targets = [
    { label: 'WhatsApp', bg: '#25D366', icon: <WhatsAppGlyph />, onClick: () => open(`https://wa.me/?text=${enc(full)}`) },
    { label: 'Telegram', bg: '#229ED9', icon: <TelegramGlyph />, onClick: () => open(`https://t.me/share/url?url=${enc(url)}&text=${enc(message)}`) },
    { label: 'X', bg: '#000', icon: <span className="text-[18px] font-black">𝕏</span>, onClick: () => open(`https://twitter.com/intent/tweet?text=${enc(message)}&url=${enc(url)}`) },
    { label: 'Messages', bg: '#34C759', icon: <MessageSquare size={20} />, onClick: () => open(`sms:?&body=${enc(full)}`) },
    { label: 'Email', bg: '#3B82F6', icon: <Mail size={20} />, onClick: () => open(`mailto:?subject=${enc(reel.title)}&body=${enc(full)}`) },
    ...(typeof navigator !== 'undefined' && 'share' in navigator
      ? [{ label: 'More', bg: 'rgb(var(--c-fg) / .1)', icon: <MoreHorizontal size={20} />, onClick: native, plain: true }]
      : []),
  ]

  return (
    <div className="pb-safe px-5 pb-5">
      <h2 className="text-center text-[16px] font-bold">Share this trip</h2>

      {/* preview, roughly what the link unfurls to */}
      <div className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-2.5">
        <SmartImage src={reel.scenes[0].img} alt="" fallback={reel.fallback} className="h-[72px] w-14 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 py-0.5">
          <div className="line-clamp-2 text-[14px] font-bold leading-snug">{reel.title}</div>
          <div className="mt-0.5 truncate text-[12px] text-white/55">@{reel.creator.handle} · {reel.days}D/{reel.nights}N</div>
          <div className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-ixi-ember">
            <ModeIcon mode={reel.recommendedMode} size={12} /> {price} per person from {origin.name}
          </div>
        </div>
      </div>

      <div className="no-scrollbar -mx-5 mt-5 flex gap-4 overflow-x-auto px-5">
        {targets.map((t) => (
          <motion.button key={t.label} whileTap={{ scale: 0.9 }} onClick={t.onClick} className="flex w-[60px] shrink-0 flex-col items-center gap-1.5">
            <span className={cx('grid h-[54px] w-[54px] place-items-center rounded-full', 'plain' in t ? 'text-white' : 'text-snow')} style={{ background: t.bg }}>
              {t.icon}
            </span>
            <span className="text-[11px] font-semibold text-white/75">{t.label}</span>
          </motion.button>
        ))}
      </div>

      {/* link + copy */}
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/[.06] py-1.5 pl-4 pr-1.5">
        <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{url.replace(/^https?:\/\//, '')}</span>
        <button
          onClick={copy}
          className={cx('flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors', copied ? 'bg-ctkt' : 'bg-ixi-orange')}
        >
          {copied ? <Check size={15} strokeWidth={3} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => setShowQR((v) => !v)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-[13px] font-semibold" aria-expanded={showQR}>
          <QrCode size={16} /> {showQR ? 'Hide QR code' : 'Show QR code'}
        </button>
        <button
          onClick={() => {
            openShare(null)
            openSheet(reel.id, 'crew')
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 py-3 text-[13px] font-semibold"
        >
          <Users size={16} /> Plan with crew
        </button>
      </div>

      {showQR && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-white/[.04] p-3">
            <div className="rounded-xl bg-snow p-2">
              <QRCodeSVG value={url} size={96} fgColor="#060B22" />
            </div>
            <p className="text-[13px] leading-snug text-white/65">Friends can scan this with their phone camera to open the trip, priced from their own city.</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-snow" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.5-.4Z" />
    </svg>
  )
}

function TelegramGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-snow" aria-hidden>
      <path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.1l-4.7-1.5c-1-.3-1-1 .2-1.5l18.5-7.1c.9-.3 1.6.2 1.4 1.3Z" />
    </svg>
  )
}
