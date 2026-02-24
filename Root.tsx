import { Routes, Route } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import { ProfilePage } from './pages/ProfilePage'
import { BottomNav } from './components/BottomNav'

export function Root() {
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-blue-900 via-blue-950 to-black">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}
