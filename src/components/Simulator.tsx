import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CREATOR_FACTS, getCreator, upcomingFor } from '../lib/mockData'
import { canNotify, useApp, useUI } from '../lib/store'

// Stand-ins for server events (creator uploads, creator answers) so the demo feels alive.
// When the backend lands, replace this with push/websocket handlers that call the same store actions.

const TOPICS: [keyof (typeof CREATOR_FACTS)[string], RegExp][] = [
  ['budget', /budget|cost|price|expens|cheap|spend|₹|rs\.?|rupee|how much|afford/i],
  ['season', /when|month|season|weather|best time|monsoon|winter|summer|rain|december|crowd/i],
  ['safety', /safe|solo|women|girl|female|alone|scam|danger/i],
  ['stay', /stay|hotel|hostel|room|villa|resort|airbnb|zostel|houseboat|haveli|book where/i],
  ['food', /food|eat|veg|restaurant|cafe|café|dinner|lunch|breakfast|drink/i],
  ['transport', /reach|bus|train|flight|fly|cab|taxi|airport|station|drive|scooter|how to get|travel to/i],
]

export function answerFor(creator: string, question: string) {
  const facts = CREATOR_FACTS[creator]
  if (!facts) return 'Thanks for asking! I will cover this in an upcoming reel.'
  const topic = TOPICS.find(([, re]) => re.test(question))?.[0] ?? 'other'
  return facts[topic]
}

export default function Simulator() {
  const navigate = useNavigate()
  const notify = useUI((s) => s.notify)

  useEffect(() => {
    const tick = () => {
      const s = useApp.getState()
      const now = Date.now()

      // creator uploads
      for (const [handle, due] of Object.entries(s.uploadDue)) {
        if (due > now) continue
        const reel = upcomingFor(handle)
        if (!reel || !s.following.includes(handle)) {
          // unsubscribed before it went out: drop it, it will be scheduled again on re-subscribe
          useApp.setState((st) => {
            const { [handle]: _drop, ...rest } = st.uploadDue
            return { uploadDue: rest }
          })
          continue
        }
        s.releaseUpload(reel.id)
        if (s.bells.includes(handle) && canNotify('uploads')) {
          notify({
            title: `@${handle} just posted a new trip`,
            body: reel.title,
            icon: '🎬',
            tone: 'orange',
            actionLabel: 'Watch now',
            onAction: () => navigate(`/?reel=${reel.id}`),
          })
        }
      }

      // creator answers
      for (const q of s.myQuestions) {
        if (q.answer || !q.answerAt || q.answerAt > now) continue
        s.answerQuestion(q.id, answerFor(q.creator, q.text))
        if (!canNotify('answers')) continue
        const name = getCreator(q.creator)?.name.split(' ')[0] ?? q.creator
        notify({
          title: `${name} answered your question`,
          body: `“${q.text.length > 60 ? q.text.slice(0, 57) + '…' : q.text}”`,
          icon: '💬',
          tone: 'green',
          actionLabel: 'See the answer',
          onAction: () => navigate(`/c/${q.creator}?tab=qa`),
        })
      }
    }
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [navigate, notify])

  return null
}
