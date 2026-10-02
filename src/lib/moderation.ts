// ---------------------------------------------------------------------------
// Client-side moderation: a first line of defence before anything is posted.
// The server must run the same checks once comments go to a real database.
// ---------------------------------------------------------------------------

// Matched anywhere inside a word ("motherf***er" still trips "fuck")
const STRONG = [
  'fuck', 'shit', 'bitch', 'cunt', 'asshole', 'bastard', 'whore', 'slut', 'retard', 'nigger', 'faggot',
  'madarchod', 'bhenchod', 'behenchod', 'chutiya', 'chutiye', 'bhosdi', 'bhosdike', 'gaandu', 'lavda', 'lawda',
]
// Only matched as whole words, so "Scunthorpe" or "class" stay clean
const WHOLE = ['dick', 'cock', 'pussy', 'fag', 'gandu', 'randi', 'harami', 'kamina', 'kutta', 'kutti', 'saala', 'bsdk', 'bc', 'mc', 'lund', 'wtf', 'stfu']

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b' }

const normalise = (word: string) =>
  word
    .toLowerCase()
    .replace(/[0134578!@$+]/g, (c) => LEET[c] ?? c)
    .replace(/[^a-z]/g, '')

// "fuuuuck" -> "fuck", but keep doubles like "asshole"
const squeeze = (w: string) => w.replace(/(.)\1{2,}/g, '$1')

// Innocent words that contain a blocked string
const ALLOW = ['shitake', 'shiitake', 'scunthorpe', 'cocktail', 'peacock', 'hancock', 'dickens', 'mcdonalds']

function isBad(token: string) {
  const w = normalise(token)
  if (!w || ALLOW.some((a) => w.includes(a))) return false
  const variants = [w, squeeze(w), w.replace(/(.)\1+/g, '$1')]
  return variants.some((v) => WHOLE.includes(v) || STRONG.some((b) => v.includes(b)))
}

/** True when the text contains blocked language, including spaced-out or symbol-split spellings */
export function hasProfanity(text: string) {
  const tokens = text.split(/\s+/)
  if (tokens.some(isBad)) return true
  // catch "f u c k" and "f.u.c.k": only runs of single characters are joined, so "this hit" stays clean
  const runs = text.match(/(?:^|\s)(?:\S[\s._*-]+){2,}\S(?=\s|$)/g) ?? []
  return runs.some((r) => {
    const parts = r.trim().split(/[\s._*-]+/)
    if (parts.some((p) => p.length > 1)) return false
    const w = normalise(parts.join(''))
    return WHOLE.includes(w) || STRONG.some((b) => w.includes(b))
  })
}

/** Replace blocked words with a masked version, e.g. "s***" */
export function mask(text: string) {
  return text.replace(/\S+/g, (tok) => {
    if (!isBad(tok)) return tok
    const [, lead, core, trail] = tok.match(/^([^a-zA-Z0-9]*)(.*?)([.,!?;:)]*)$/) ?? ['', '', tok, '']
    return lead + core[0] + '*'.repeat(Math.max(2, core.length - 1)) + trail
  })
}

export type Verdict = { ok: true } | { ok: false; reason: string }

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|xyz|io|link|ly|co)\b)/i
const PHONE = /(\+?\d[\d\s-]{8,}\d)/
const SOLICIT = /\b(dm me|whatsapp me|call me|earn money|work from home|crypto|giveaway|free followers|telegram)\b/i

/**
 * Checks a comment or question before posting.
 * `recent` is the poster's own recent activity, for rate limiting and duplicate detection.
 */
export function checkPost(text: string, recent: { text: string; at: number }[]): Verdict {
  const t = text.trim()
  if (!t) return { ok: false, reason: 'Write something first.' }
  if (t.length > 300) return { ok: false, reason: 'Keep it under 300 characters.' }
  if (hasProfanity(t)) return { ok: false, reason: 'That includes language that breaks our community guidelines. Please keep it friendly.' }
  if (LINK.test(t)) return { ok: false, reason: 'Links aren’t allowed in comments, to keep out spam.' }
  if ((t.match(PHONE)?.[0].replace(/\D/g, '').length ?? 0) >= 10) return { ok: false, reason: 'For your safety, don’t share phone numbers in public comments.' }
  if (SOLICIT.test(t)) return { ok: false, reason: 'This looks like spam or self-promotion.' }
  if (/(.)\1{7,}/.test(t)) return { ok: false, reason: 'Too many repeated characters.' }
  const letters = t.replace(/[^a-zA-Z]/g, '')
  if (letters.length >= 12 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.75) {
    return { ok: false, reason: 'Easy on the caps. Shouting gets comments hidden.' }
  }
  const now = Date.now()
  const last = recent.length ? recent.reduce((a, b) => (a.at > b.at ? a : b)) : undefined
  if (last && now - last.at < 4000) return { ok: false, reason: 'You’re posting too fast. Wait a few seconds.' }
  if (recent.some((r) => now - r.at < 5 * 60_000 && r.text.trim().toLowerCase() === t.toLowerCase())) {
    return { ok: false, reason: 'You already posted that.' }
  }
  return { ok: true }
}

export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam or misleading', hint: 'Ads, scams, fake links' },
  { id: 'harassment', label: 'Harassment or bullying', hint: 'Targets a person' },
  { id: 'hate', label: 'Hate speech', hint: 'Attacks a group or identity' },
  { id: 'sexual', label: 'Sexual content', hint: 'Explicit or unwanted' },
  { id: 'misinfo', label: 'False travel info', hint: 'Wrong prices, unsafe advice' },
  { id: 'other', label: 'Something else', hint: '' },
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]['id']
