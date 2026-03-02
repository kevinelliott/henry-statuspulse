import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ExternalLink, Settings, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: pages } = await supabase
    .from('status_pages')
    .select('*, components(count), incidents(count)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user!.id)
    .single()

  const plan = profile?.plan || 'free'
  const pageLimit = plan === 'free' ? 1 : plan === 'starter' ? 3 : Infinity
  const canCreateMore = (pages?.length || 0) < pageLimit

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Status Pages</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pages?.length || 0} of {pageLimit === Infinity ? 'unlimited' : pageLimit} pages used
          </p>
        </div>
        {canCreateMore ? (
          <Link
            href="/dashboard/pages/new"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Page
          </Link>
        ) : (
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Upgrade to add more
          </Link>
        )}
      </div>

      {(!pages || pages.length === 0) ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No status pages yet</h2>
          <p className="text-gray-500 mb-6">Create your first status page to start communicating reliability to your users.</p>
          <Link
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first page
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page: any) => (
            <div key={page.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{page.name}</h2>
                    <StatusBadge status={page.overall_status} />
                  </div>
                  {page.description && (
                    <p className="text-gray-500 text-sm mb-3">{page.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>/{page.slug}</span>
                    <span>{page.components?.[0]?.count || 0} components</span>
                    <span>{page.incidents?.[0]?.count || 0} incidents</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={`/status/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View public page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href={`/dashboard/pages/${page.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Manage page"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/pages/${page.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
