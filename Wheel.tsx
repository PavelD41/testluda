import { useEffect, useRef } from 'react'

interface Bet {
  id: string
  nickname: string
  amount: number
  type: 'TON' | 'STAR' | 'GIFT'
  userId?: string
}

interface WheelProps {
  bets: Bet[]
  isSpinning: boolean
  onSpin: () => void
  disabled: boolean
}

export function Wheel({ bets, isSpinning, onSpin, disabled }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 260
    const center = size / 2
    const innerRadius = 40
    const outerRadius = size / 2 - 6

    canvas.width = size
    canvas.height = size

    const drawWheel = () => {
      ctx.clearRect(0, 0, size, size)

      const total = bets.reduce((sum, b) => sum + b.amount, 0)

      if (!bets.length || total <= 0) {
        // Draw default wheel
        ctx.save()
        ctx.translate(center, center)
        const colors = ['#5fd2ff', '#ffd66b', '#a673ff', '#ff8bb0']
        const angleStep = (Math.PI * 2) / colors.length
        let start = -Math.PI / 2
        colors.forEach((color) => {
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.arc(0, 0, outerRadius, start, start + angleStep)
          ctx.closePath()
          const gradient = ctx.createLinearGradient(0, -outerRadius, 0, outerRadius)
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, '#091024')
          ctx.fillStyle = gradient
          ctx.fill()
          start += angleStep
        })
        ctx.restore()
        return
      }

      // Draw wheel with bets
      let startAngle = -Math.PI / 2
      bets.forEach((bet, index) => {
        const sliceAngle = (bet.amount / total) * Math.PI * 2
        const endAngle = startAngle + sliceAngle

        ctx.save()
        ctx.translate(center, center)

        const baseColor = getRandomPastel(index)
        const gradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius)
        gradient.addColorStop(0, '#05091c')
        gradient.addColorStop(0.3, baseColor + 'cc')
        gradient.addColorStop(1, '#020417')

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, outerRadius, startAngle, endAngle)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.restore()
        startAngle = endAngle
      })
    }

    drawWheel()
  }, [bets])

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

  const spin = () => {
    if (disabled || isSpinning) return

    const canvas = canvasRef.current
    if (!canvas) return

    const total = bets.reduce((sum, b) => sum + b.amount, 0)
    if (total <= 0) return

    // Calculate winner
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

    // Calculate angles
    const angles = []
    let start = 0
    bets.forEach((bet) => {
      const sliceAngle = (bet.amount / total) * Math.PI * 2
      angles.push({ start, end: start + sliceAngle })
      start += sliceAngle
    })

    const winnerSegment = angles[winnerIndex]
    const midAngle = (winnerSegment.start + winnerSegment.end) / 2 - Math.PI / 2

    const fullSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = fullSpins * 2 * Math.PI + (Math.PI / 2 - midAngle)
    const targetDeg = (rotationRef.current + targetAngle) * (180 / Math.PI)

    canvas.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.02, 0, 1)'
    canvas.style.transform = `rotate(${targetDeg}deg)`

    setTimeout(() => {
      rotationRef.current = targetAngle % (Math.PI * 2)
      onSpin()
    }, 4500)
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer */}
      <div className="absolute top-0 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[20px] border-b-white drop-shadow-lg z-10" />
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={260}
        height={260}
        className="rounded-full bg-gradient-to-br from-gray-900 to-black shadow-2xl border-2 border-white/20 cursor-pointer transition-transform hover:scale-105"
        onClick={spin}
        style={{ transformOrigin: 'center' }}
      />
      
      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl flex items-center justify-center border border-white/30">
          <div className="text-white font-bold text-sm tracking-wider">ИГРА</div>
        </div>
      </div>
    </div>
  )
}
