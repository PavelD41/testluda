import { useState } from 'react'
import { useSDK } from '@tma.js/sdk-react'

interface TopUpModalProps {
  onClose: () => void
  onSuccess: (amount: number) => void
}

export function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const sdk = useSDK()

  const handleTopUp = async (topupAmount: number) => {
    if (!sdk) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/createInvoiceLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: topupAmount,
          description: `Top-up balance with ${topupAmount} TON`,
          userId: sdk.initDataUnsafe?.user?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        sdk.openInvoice(data.invoiceLink, (status) => {
          if (status === 'paid') {
            onSuccess(topupAmount)
            onClose()
            sdk.showPopup({
              title: 'Успешно!',
              message: `Баланс пополнен на ${topupAmount} TON`,
              buttons: [{ type: 'default', text: 'OK' }],
            })
          }
        })
      } else {
        sdk.showPopup({
          title: 'Ошибка',
          message: data.error || 'Не удалось создать счет',
          buttons: [{ type: 'default', text: 'OK' }],
        })
      }
    } catch (error) {
      console.error('Top-up error:', error)
      sdk.showPopup({
        title: 'Ошибка',
        message: 'Произошла ошибка при пополнении',
        buttons: [{ type: 'default', text: 'OK' }],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const topupAmount = parseFloat(amount.replace(',', '.'))
    if (topupAmount && topupAmount > 0) {
      handleTopUp(topupAmount)
    }
  }

  const presetAmounts = [1, 5, 10, 25, 50]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Пополнение баланса</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Сумма пополнения</label>
              <div className="field-with-addon">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1.00"
                  min="0.01"
                  step="0.01"
                  className="field-input"
                  disabled={loading}
                />
                <span className="field-addon">TON</span>
              </div>
            </div>

            <div>
              <label className="field-label">Быстрый выбор</label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className="py-2 px-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-all text-sm font-medium"
                    disabled={loading}
                  >
                    +{preset} TON
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="btn btn-primary wide"
            >
              {loading ? 'Создание счета...' : 'Пополнить'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
