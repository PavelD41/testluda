import { useNavigate, useLocation } from 'react-router-dom'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-900/90 via-purple-900/90 to-blue-900/90 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/') 
                ? 'text-white bg-white/10' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">🎲</span>
            <span className="text-xs font-medium">Rolls</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/profile') 
                ? 'text-white bg-white/10' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-xl">👤</span>
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  )
}
