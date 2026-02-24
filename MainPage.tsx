import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSDK } from '@tma.js/sdk-react'
import { Wheel } from '../components/Wheel'
import { BetForm } from '../components/BetForm'
import { ParticipantsList } from '../components/ParticipantsList'
import { TopUpModal } from '../components/TopUpModal'

interface Bet {
  id: string
  nickname: string
  amount: number
  type: 'TON' | 'STAR' | 'GIFT'
  userId?: string
}

export function MainPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [balance, setBalance] = useState(0.07)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [gameId, setGameId] = useState(360893)
  const [hash, setHash] = useState('')
  
  const sdk = useSDK()
  const navigate = useNavigate()

  useEffect(() => {
    if (sdk) {
      sdk.ready()
      if (sdk.expand) {
        sdk.expand()
      }
      
      // Get user info
      const user = sdk.initDataUnsafe?.user
      if (user) {
        // Load user balance from server
        loadUserBalance(user.id.toString())
      }
    }
    
    generateHash()
  }, [sdk])

  const generateHash = () => {
    const chars = '0123456789abcdef'
    let hash = ''
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)]
    }
    setHash(hash)
  }

  const loadUserBalance = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/balance/${userId}`)
      const data = await response.json()
      if (data.success) {
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to load balance:', error)
    }
  }

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/balance/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (data.success) {
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }

  const handleBet = (bet: Omit<Bet, 'id'>) => {
    if (balance < bet.amount) {
      alert('Недостаточно средств на балансе!')
      return
    }

    const userId = sdk?.initDataUnsafe?.user?.id.toString()
    const newBet: Bet = {
      ...bet,
      id: Date.now().toString(),
      userId,
    }

    setBets(prev => [...prev, newBet])
    setBalance(prev => prev - bet.amount)
    
    if (userId) {
      updateUserBalance(userId, -bet.amount)
    }
    
    generateHash()
  }

  const handleSpin = async () => {
    if (bets.length < 2 || isSpinning) return

    setIsSpinning(true)
    
    // Calculate winner based on bet amounts
    const total = bets.reduce((sum, bet) => sum + bet.amount, 0)
    const rand = Math.random() * total
    let acc = 0
    let winnerIndex = 0
    
    for (let i = 0; i < bets.length; i++) {
      acc += bets[i].amount
      if (rand <= acc) {
        winnerIndex = i
        break
      }
    }

    const winner = bets[winnerIndex]
    
    // Simulate wheel spinning
    setTimeout(() => {
      // Winner gets the bank
      const userId = sdk?.initDataUnsafe?.user?.id.toString()
      if (userId && winner.userId === userId) {
        setBalance(prev => prev + total)
        updateUserBalance(userId, total)
      }
      
      // Save game data
      saveGameData(winner)
      
      setTimeout(() => {
        setBets([])
        setIsSpinning(false)
        setGameId(prev => prev + 1)
        generateHash()
      }, 2000)
    }, 4500)
  }

  const saveGameData = async (winner: Bet) => {
    try {
      await fetch('http://localhost:3000/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: gameId.toString(),
          bets,
          winner,
        }),
      })
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }

  const totalBank = bets.reduce((sum, bet) => sum + bet.amount, 0)

  return (
    <div className="flex-1 flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Rolls</h1>
            <p className="text-xs text-gray-400">Чем больше ставка – тем больше шанс забрать банк</p>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-900/50 border border-blue-500/50 text-xs text-blue-300">
            Игра #{gameId}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left Column - Bets */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-300">
                <span className="font-semibold">{bets.length}</span> Игроков
              </div>
              <div className="text-sm text-gray-300">
                Банк: <span className="font-semibold text-yellow-400">◆ {totalBank.toFixed(2)}</span>
              </div>
            </div>
            
            <ParticipantsList bets={bets} />
          </div>

          <BetForm 
            onBet={handleBet}
            balance={balance}
            disabled={isSpinning}
          />
        </div>

        {/* Right Column - Wheel */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Rolls</h2>
              <div className="px-3 py-1 rounded-full bg-green-900/50 border border-green-500/50 text-xs text-green-300">
                {isSpinning ? 'PvP начался...' : bets.length >= 2 ? 'Готово к запуску PvP' : 'Ожидание игроков'}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <Wheel 
                bets={bets}
                isSpinning={isSpinning}
                onSpin={handleSpin}
                disabled={bets.length < 2 || isSpinning}
              />
            </div>

            <button
              onClick={handleSpin}
              disabled={bets.length < 2 || isSpinning}
              className="btn btn-gradient wide mt-4"
            >
              {isSpinning ? 'Игра идет...' : 'Запустить PvP'}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              Чем больше ставка, тем больше сектор и шанс победить
            </p>
          </div>

          {/* Hash Display */}
          <div className="glass-card p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Hash:</span>
              <span className="font-mono text-blue-400">{hash}</span>
            </div>
          </div>
        </div>
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
