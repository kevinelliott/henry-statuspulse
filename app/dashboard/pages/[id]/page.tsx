import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ExternalLink, Code } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import ManagePageClient from '@/components/ManagePageClient'

export default async function ManagePagePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: page } = await supabase
    .from('status_pages')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!page) notFound()

  const { data: components } = await supabase
    .from('components')
    .select('*')
    .eq('page_id', page.id)
    .order('display_order')

  const { data: incidents } = await supabase
    .from('incidents')
    .select('*, incident_updates(*)')
    .eq('page_id', page.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('id')
    .eq('page_id', page.id)

  const badgeUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/badge/${page.slug}`
  const publicUrl = `/status/${page.slug}`

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
            <StatusBadge status={page.overall_status} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {subscribers?.length || 0} subscribers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View public page
          </a>
        </div>
      </div>

      {/* Badge embed section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-400" />
              Embeddable Status Badge
            </h2>
            <p className="text-sm text-gray-500 mb-4">Embed this badge anywhere to show your current status</p>
            <div className="flex items-center gap-4">
              <img src={`/api/badge/${page.slug}`} alt="Status badge" className="h-5" />
              <code className="text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-600 select-all">
                {`<img src="${badgeUrl}" alt="Status" />`}
              </code>
            </div>
          </div>
        </div>
      </div>

      <ManagePageClient
        page={page}
        initialComponents={components || []}
        initialIncidents={incidents || []}
      />
    </div>
  )
}
