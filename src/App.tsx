import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import BottomNav from './components/BottomNav'
import NoticeStack from './components/NoticeStack'
import CloneTripSheet from './components/clone/CloneTripSheet'
import OriginPicker from './components/OriginPicker'
import ShareSheet from './components/ShareSheet'
import MapSheet from './components/MapSheet'
import Simulator from './components/Simulator'
import ErrorBoundary from './components/ErrorBoundary'
import Feed from './pages/Feed'
import Settings from './pages/Settings'
import { useApp } from './lib/store'
import Explore from './pages/Explore'
import Dreams from './pages/Dreams'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import Creator from './pages/Creator'
import Channel from './pages/Channel'
import Subscriptions from './pages/Subscriptions'
import You from './pages/You'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  const location = useLocation()
  const key = location.pathname.split('/').slice(0, 3).join('/')
  const reduceMotion = useApp((s) => s.prefs.reduceMotion)
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
    <PhoneShell>
      <div className="flex h-full flex-col">
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={key}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <ErrorBoundary resetKey={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Feed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/dreams" element={<Dreams />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/creator" element={<Creator />} />
                <Route path="/subs" element={<Subscriptions />} />
                <Route path="/c/:handle" element={<Channel />} />
                <Route path="/you" element={<You />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="*" element={<Feed />} />
              </Routes>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
      <CloneTripSheet />
      <OriginPicker />
      <MapSheet />
      <ShareSheet />
      <Simulator />
      <NoticeStack />
    </PhoneShell>
    </MotionConfig>
  )
}
