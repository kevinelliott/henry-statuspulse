'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

export default function SubscribeForm({ pageId }: { pageId: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pageId }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to subscribe')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl px-4 py-3">
        <Bell className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-medium">You&apos;re subscribed! You&apos;ll receive email notifications for incidents.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        placeholder="your@email.com"
        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </form>
  )
}
