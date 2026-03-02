'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'investigating', label: 'Investigating' },
  { value: 'identified', label: 'Identified' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'resolved', label: 'Resolved' },
]

const IMPACT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'minor', label: 'Minor' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
]

export default function NewIncidentPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    status: 'investigating',
    impact: 'minor',
    body: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: incident, error: err } = await supabase
      .from('incidents')
      .insert({
        page_id: id,
        title: form.title,
        status: form.status,
        impact: form.impact,
        body: form.body,
        resolved_at: form.status === 'resolved' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Add initial update
    if (form.body) {
      await supabase.from('incident_updates').insert({
        incident_id: incident.id,
        status: form.status,
        body: form.body,
      })
    }

    router.push(`/dashboard/pages/${id}`)
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href={`/dashboard/pages/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to page
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create Incident</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Incident title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="API degraded performance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Impact</label>
              <select
                value={form.impact}
                onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {IMPACT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Update message</label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="We are investigating reports of increased error rates..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/dashboard/pages/${id}`}
              className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
