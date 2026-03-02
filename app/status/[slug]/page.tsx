import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle2, AlertTriangle, XCircle, Clock, Zap } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import SubscribeForm from '@/components/SubscribeForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('status_pages')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!page) return { title: 'Status Page Not Found' }

  return {
    title: `${page.name} Status`,
    description: page.description || `Real-time status for ${page.name}`,
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
    case 'degraded':
    case 'partial_outage':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case 'major_outage':
      return <XCircle className="w-5 h-5 text-red-500" />
    case 'maintenance':
      return <Clock className="w-5 h-5 text-blue-500" />
    default:
      return <CheckCircle2 className="w-5 h-5 text-green-500" />
  }
}

function overallStatusLabel(status: string) {
  switch (status) {
    case 'operational': return { label: 'All Systems Operational', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
    case 'degraded': return { label: 'Degraded Performance', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' }
    case 'partial_outage': return { label: 'Partial Outage', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' }
    case 'major_outage': return { label: 'Major Outage', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
    case 'maintenance': return { label: 'Scheduled Maintenance', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
    default: return { label: 'All Systems Operational', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' }
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default async function StatusPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('status_pages')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  if (!page) notFound()

  const [{ data: components }, { data: incidents }] = await Promise.all([
    supabase
      .from('components')
      .select('*')
      .eq('page_id', page.id)
      .order('display_order'),
    supabase
      .from('incidents')
      .select('*, incident_updates(*)')
      .eq('page_id', page.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const overallInfo = overallStatusLabel(page.overall_status)
  const activeIncidents = incidents?.filter(i => i.status !== 'resolved') || []
  const pastIncidents = incidents?.filter(i => i.status === 'resolved') || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{page.name}</h1>
              {page.description && (
                <p className="text-gray-500 text-sm mt-1">{page.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Overall status */}
        <div className={`${overallInfo.bg} border ${overallInfo.border} rounded-2xl p-6`}>
          <div className="flex items-center gap-3">
            <StatusIcon status={page.overall_status} />
            <span className={`text-xl font-semibold ${overallInfo.color}`}>
              {overallInfo.label}
            </span>
          </div>
          {page.overall_status === 'operational' && (
            <p className="text-sm text-green-600 mt-2 ml-8">
              No issues reported at this time.
            </p>
          )}
        </div>

        {/* Active incidents */}
        {activeIncidents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Incidents</h2>
            <div className="space-y-4">
              {activeIncidents.map((incident: any) => (
                <div key={incident.id} className="bg-white border border-red-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={incident.impact} variant="impact" />
                      <StatusBadge status={incident.status} variant="incident" />
                    </div>
                  </div>
                  {incident.body && (
                    <p className="text-gray-600 text-sm mb-4">{incident.body}</p>
                  )}
                  <div className="space-y-3 border-t border-gray-100 pt-4">
                    {incident.incident_updates?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((update: any) => (
                      <div key={update.id} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize text-gray-700">{update.status}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-400">{formatDate(update.created_at)}</span>
                        </div>
                        <p className="text-gray-600">{update.body}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">{formatDate(incident.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Components */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Components</h2>
          {(!components || components.length === 0) ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              No components configured yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {components.map((component: any, i: number) => (
                <div
                  key={component.id}
                  className={`flex items-center justify-between px-6 py-4 ${i < components.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div>
                    <span className="font-medium text-gray-900 text-sm">{component.name}</span>
                    {component.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{component.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={component.status} />
                    <StatusBadge status={component.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subscribe */}
        <section>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Get notified</h2>
            <p className="text-sm text-gray-500 mb-4">Subscribe to receive email notifications for incidents and updates.</p>
            <SubscribeForm pageId={page.id} />
          </div>
        </section>

        {/* Past incidents */}
        {pastIncidents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident History</h2>
            <div className="space-y-3">
              {pastIncidents.map((incident: any) => (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{incident.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(incident.created_at)}</p>
                      {incident.resolved_at && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Resolved {formatDate(incident.resolved_at)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Resolved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium">
              StatusPulse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
