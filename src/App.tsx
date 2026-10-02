import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import PhoneShell from './components/PhoneShell'
import BottomNav from './components/BottomNav'
import NoticeStack from './components/NoticeStack'
import CloneTripSheet from './components/clone/CloneTripSheet'
import OriginPicker from './components/OriginPicker'
import Feed from './pages/Feed'
import Explore from './pages/Explore'
import Dreams from './pages/Dreams'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import Creator from './pages/Creator'

export default function App() {
  const location = useLocation()
  const key = location.pathname.split('/').slice(0, 3).join('/')
  return (
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
              <Routes location={location}>
                <Route path="/" element={<Feed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/dreams" element={<Dreams />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/creator" element={<Creator />} />
                <Route path="*" element={<Feed />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
      <CloneTripSheet />
      <OriginPicker />
      <NoticeStack />
    </PhoneShell>
  )
}
