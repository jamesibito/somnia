import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PhoneFrame from './components/PhoneFrame'
import { AudioProvider } from './context/AudioProvider'
import { JournalProvider } from './context/JournalProvider'
import { PlanProvider } from './context/PlanProvider'
import { SessionProvider } from './context/SessionProvider'

import Splash from './screens/Splash'
import Onboarding from './screens/Onboarding'
import Tonight from './screens/Tonight'
import SoundscapeLibrary from './screens/SoundscapeLibrary'
import SoundscapePlayer from './screens/SoundscapePlayer'
import Sleep from './screens/Sleep'
import MeditateLibrary from './screens/MeditateLibrary'
import MeditatePlayer from './screens/MeditatePlayer'
import Journal from './screens/Journal'
import JournalEntry from './screens/JournalEntry'
import JournalCompose from './screens/JournalCompose'
import Alarm from './screens/Alarm'
import Profile from './screens/Profile'
import NightMode from './screens/NightMode'
import GoodMorning from './screens/GoodMorning'

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.querySelector('.screen')?.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <PlanProvider>
        <SessionProvider>
        <JournalProvider>
          <PhoneFrame>
            <ScrollReset />
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tonight" element={<Tonight />} />
              <Route path="/night" element={<NightMode />} />
              <Route path="/morning" element={<GoodMorning />} />
              <Route path="/soundscape" element={<SoundscapeLibrary />} />
              <Route path="/soundscape/:id" element={<SoundscapePlayer />} />
              <Route path="/sleep" element={<Sleep />} />
              <Route path="/meditate" element={<MeditateLibrary />} />
              <Route path="/meditate/:id" element={<MeditatePlayer />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/journal/new" element={<JournalCompose />} />
              <Route path="/journal/:id" element={<JournalEntry />} />
              <Route path="/alarm" element={<Alarm />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </PhoneFrame>
        </JournalProvider>
        </SessionProvider>
        </PlanProvider>
      </AudioProvider>
    </BrowserRouter>
  )
}
