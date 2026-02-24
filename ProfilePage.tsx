import { useState, useEffect } from 'react'
import { useSDK } from '@tma.js/sdk-react'

export function ProfilePage() {
  const [balance, setBalance] = useState(0.07)
  const [showTopUp, setShowTopUp] = useState(false)
  const [gameHistory, setGameHistory] = useState([])
  
  const sdk = useSDK()

  useEffect(() => {
    if (sdk) {
      const user = sdk.initDataUnsafe?.user
      if (user) {
        loadUserData(user.id.toString())
      }
    }
  }, [sdk])

  const loadUserData = async (userId: string) => {
    try {
      // Load balance
      const balanceResponse = await fetch(`http://localhost:3000/api/balance/${userId}`)
      const balanceData = await balanceResponse.json()
      if (balanceData.success) {
        setBalance(balanceData.balance)
      }

      // Load game history
      const historyResponse = await fetch(`http://localhost:3000/api/games/${userId}`)
      const historyData = await historyResponse.json()
      if (historyData.success) {
        setGameHistory(historyData.games)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const user = sdk?.initDataUnsafe?.user
  const fullName = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'User'
  const username = user?.username ? `@${user.username}` : fullName

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{fullName}</h2>
            <p className="text-sm text-gray-400">{username}</p>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Ваш баланс</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <span>◆</span>
              <span>{balance.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => setShowTopUp(true)}
              className="btn btn-primary text-sm"
            >
              Пополнить
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="glass-card p-4">
        <div className="flex gap-2 mb-4">
          <button className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium">
            Кошелек
          </button>
          <button className="flex-1 py-2 px-4 rounded-lg bg-gray-700 text-gray-300 text-sm font-medium">
            Подключить
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-primary">
            Пополнить
          </button>
          <button className="btn btn-ghost">
            Вывести
          </button>
        </div>
        
        <button className="btn btn-ghost wide mt-3">
          Перевод
        </button>
      </div>

      {/* Game History */}
      <div className="glass-card p-4 flex-1">
        <h3 className="text-lg font-semibold text-white mb-3">История игр</h3>
        
        {gameHistory.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Нет сыгранных игр</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {gameHistory.map((game, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {new Date(game.timestamp).toLocaleDateString()}
                  </span>
                  <span className={`font-medium ${
                    game.winner?.userId === user?.id.toString() 
                      ? 'text-green-400' 
                      : 'text-gray-400'
                  }`}>
                    {game.winner?.userId === user?.id.toString() ? 'Победа!' : 'Поражение'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Банк: {game.bets?.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)} TON
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
        <TopUpModal 
          onClose={() => setShowTopUp(false)}
          onSuccess={(amount) => {
            setBalance(prev => prev + amount)
            const userId = sdk?.initDataUnsafe?.user?.id.toString()
            if (userId) {
              updateUserBalance(userId, amount)
            }
          }}
        />
      )}
    </div>
  )
}

const updateUserBalance = async (userId: string, amount: number) => {
  try {
    await fetch(`http://localhost:3000/api/balance/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    })
  } catch (error) {
    console.error('Failed to update balance:', error)
  }
}
