'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewPagePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', slug: '', description: '' })

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, slug: slugify(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data, error: err } = await supabase
      .from('status_pages')
      .insert({
        user_id: user.id,
        name: form.name,
        slug: form.slug,
        description: form.description || null,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push(`/dashboard/pages/${data.id}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create Status Page</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Page name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Acme Status"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL slug</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
              <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/status/</span>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                required
                pattern="[a-z0-9-]+"
                className="flex-1 px-3 py-3 text-sm focus:outline-none"
                placeholder="acme"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Real-time status of all Acme systems"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
