interface Bet {
  id: string
  nickname: string
  amount: number
  type: 'TON' | 'STAR' | 'GIFT'
  userId?: string
}

interface ParticipantsListProps {
  bets: Bet[]
}

export function ParticipantsList({ bets }: ParticipantsListProps) {
  if (!bets.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">
          Пока нет ставок.
          <span className="block mt-1">Стань первым игроком!</span>
        </p>
      </div>
    )
  }

  const total = bets.reduce((sum, bet) => sum + bet.amount, 0) || 1

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TON': return '◆'
      case 'STAR': return '★'
      case 'GIFT': return '🎁'
      default: return '◆'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'TON': return 'TON'
      case 'STAR': return 'Звезды'
      case 'GIFT': return 'Подарки'
      default: return 'TON'
    }
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {bets.map((bet, index) => {
        const chancePercent = (bet.amount / total) * 100
        
        return (
          <div key={bet.id} className="bg-black/30 rounded-lg p-3 flex items-center gap-3">
            {/* Avatar */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${getRandomPastel(index)}, #1e1142)`
              }}
            >
              {bet.nickname.charAt(0).toUpperCase()}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {bet.nickname}
              </div>
              <div className="text-xs text-gray-400">
                Игрок
              </div>
            </div>

            {/* Right side */}
            <div className="text-right">
              <div className="text-yellow-400 font-semibold text-sm flex items-center gap-1">
                <span>{getTypeIcon(bet.type)}</span>
                <span>{bet.amount.toFixed(2)}</span>
              </div>
              <div className="text-xs text-yellow-400 font-medium">
                {chancePercent.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400">
                {getTypeLabel(bet.type)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const getRandomPastel = (index: number) => {
  const palette = [
    '#ffd66b',
    '#5fd2ff',
    '#a673ff',
    '#ff8bb0',
    '#7fffba',
    '#ffb36a',
    '#7ea6ff',
  ]
  return palette[index % palette.length]
}
