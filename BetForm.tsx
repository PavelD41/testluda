import { useState } from 'react'

interface Bet {
  nickname: string
  amount: number
  type: 'TON' | 'STAR' | 'GIFT'
}

interface BetFormProps {
  onBet: (bet: Bet) => void
  balance: number
  disabled: boolean
}

export function BetForm({ onBet, balance, disabled }: BetFormProps) {
  const [nickname, setNickname] = useState('')
  const [amount, setAmount] = useState('')
  const [betType, setBetType] = useState<'TON' | 'STAR' | 'GIFT'>('TON')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const betAmount = parseFloat(amount.replace(',', '.'))
    if (!betAmount || betAmount <= 0) {
      return
    }

    onBet({
      nickname: nickname.trim() || `Игрок #${Math.floor(Math.random() * 1000)}`,
      amount: betAmount,
      type: betType,
    })

    setNickname('')
    setAmount('')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TON': return '◆'
      case 'STAR': return '★'
      case 'GIFT': return '🎁'
      default: return '◆'
    }
  }

  return (
    <div className="glass-card p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Никнейм</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="@username"
            className="field-input"
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Тип ставки</label>
            <div className="flex gap-1">
              {(['TON', 'STAR', 'GIFT'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBetType(type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    betType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  disabled={disabled}
                >
                  {getTypeIcon(type)} {type === 'TON' ? 'TON' : type === 'STAR' ? 'Звезды' : 'Подарки'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Ставка</label>
            <div className="field-with-addon">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.50"
                min="0.01"
                step="0.01"
                className="field-input"
                disabled={disabled}
              />
              <span className="field-addon">{getTypeIcon(betType)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="btn btn-primary wide"
        >
          Добавить ставку
        </button>

        <div className="text-xs text-gray-400 text-center">
          Баланс: <span className="text-yellow-400 font-semibold">◆ {balance.toFixed(2)}</span>
        </div>
      </form>
    </div>
  )
}
