'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, AlertTriangle, CheckCircle2, Edit2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

const COMPONENT_STATUSES = [
  { value: 'operational', label: 'Operational' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'partial_outage', label: 'Partial Outage' },
  { value: 'major_outage', label: 'Major Outage' },
  { value: 'maintenance', label: 'Maintenance' },
]

const PAGE_STATUSES = [
  { value: 'operational', label: 'All Operational' },
  { value: 'degraded', label: 'Degraded Performance' },
  { value: 'partial_outage', label: 'Partial Outage' },
  { value: 'major_outage', label: 'Major Outage' },
  { value: 'maintenance', label: 'Maintenance' },
]

interface ManagePageClientProps {
  page: any
  initialComponents: any[]
  initialIncidents: any[]
}

export default function ManagePageClient({ page, initialComponents, initialIncidents }: ManagePageClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const [components, setComponents] = useState(initialComponents)
  const [incidents, setIncidents] = useState(initialIncidents)
  const [pageStatus, setPageStatus] = useState(page.overall_status)
  const [savingStatus, setSavingStatus] = useState(false)

  // Component form state
  const [showAddComponent, setShowAddComponent] = useState(false)
  const [newComponent, setNewComponent] = useState({ name: '', description: '', status: 'operational' })
  const [addingComponent, setAddingComponent] = useState(false)

  // Incident update state
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null)
  const [updateText, setUpdateText] = useState('')
  const [updateStatus, setUpdateStatus] = useState('monitoring')
  const [addingUpdate, setAddingUpdate] = useState(false)

  async function handleUpdatePageStatus(newStatus: string) {
    setSavingStatus(true)
    await supabase
      .from('status_pages')
      .update({ overall_status: newStatus })
      .eq('id', page.id)
    setPageStatus(newStatus)
    setSavingStatus(false)
  }

  async function handleAddComponent() {
    if (!newComponent.name.trim()) return
    setAddingComponent(true)

    const { data, error } = await supabase
      .from('components')
      .insert({
        page_id: page.id,
        name: newComponent.name,
        description: newComponent.description || null,
        status: newComponent.status,
        display_order: components.length,
      })
      .select()
      .single()

    if (!error && data) {
      setComponents(c => [...c, data])
      setNewComponent({ name: '', description: '', status: 'operational' })
      setShowAddComponent(false)
    }
    setAddingComponent(false)
  }

  async function handleUpdateComponentStatus(componentId: string, newStatus: string) {
    await supabase
      .from('components')
      .update({ status: newStatus })
      .eq('id', componentId)

    setComponents(c => c.map(comp => comp.id === componentId ? { ...comp, status: newStatus } : comp))
  }

  async function handleDeleteComponent(componentId: string) {
    if (!confirm('Delete this component?')) return
    await supabase.from('components').delete().eq('id', componentId)
    setComponents(c => c.filter(comp => comp.id !== componentId))
  }

  async function handleAddIncidentUpdate(incidentId: string) {
    if (!updateText.trim()) return
    setAddingUpdate(true)

    const { data } = await supabase
      .from('incident_updates')
      .insert({
        incident_id: incidentId,
        status: updateStatus,
        body: updateText,
      })
      .select()
      .single()

    if (data) {
      // Update incident status
      await supabase
        .from('incidents')
        .update({
          status: updateStatus,
          resolved_at: updateStatus === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', incidentId)

      setIncidents(incidents.map(i => {
        if (i.id === incidentId) {
          return {
            ...i,
            status: updateStatus,
            resolved_at: updateStatus === 'resolved' ? new Date().toISOString() : null,
            incident_updates: [...(i.incident_updates || []), data],
          }
        }
        return i
      }))

      setUpdateText('')
      setExpandedIncident(null)
    }
    setAddingUpdate(false)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Components Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Components</h2>
          <button
            onClick={() => setShowAddComponent(!showAddComponent)}
            className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Overall page status */}
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <label className="text-xs font-medium text-gray-500 block mb-2">Overall Page Status</label>
          <select
            value={pageStatus}
            onChange={e => handleUpdatePageStatus(e.target.value)}
            disabled={savingStatus}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {PAGE_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {showAddComponent && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <input
              type="text"
              value={newComponent.name}
              onChange={e => setNewComponent(c => ({ ...c, name: e.target.value }))}
              placeholder="Component name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              value={newComponent.description}
              onChange={e => setNewComponent(c => ({ ...c, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={newComponent.status}
              onChange={e => setNewComponent(c => ({ ...c, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {COMPONENT_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddComponent(false); setNewComponent({ name: '', description: '', status: 'operational' }) }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComponent}
                disabled={addingComponent || !newComponent.name.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {addingComponent ? 'Adding...' : 'Add component'}
              </button>
            </div>
          </div>
        )}

        {components.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No components yet. Add your first one.</p>
        ) : (
          <div className="space-y-2">
            {components.map(component => (
              <div key={component.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{component.name}</p>
                  {component.description && (
                    <p className="text-xs text-gray-400 truncate">{component.description}</p>
                  )}
                </div>
                <select
                  value={component.status}
                  onChange={e => handleUpdateComponentStatus(component.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  {COMPONENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteComponent(component.id)}
                  className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incidents Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Incidents</h2>
          <Link
            href={`/dashboard/pages/${page.id}/incidents/new`}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <AlertTriangle className="w-4 h-4" />
            New incident
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No incidents. All clear!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident: any) => (
              <div key={incident.id} className={`border rounded-xl p-4 ${incident.status !== 'resolved' ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{incident.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(incident.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={incident.status} variant="incident" />
                  </div>
                </div>

                {incident.status !== 'resolved' && (
                  <>
                    {expandedIncident === incident.id ? (
                      <div className="mt-3 space-y-2">
                        <select
                          value={updateStatus}
                          onChange={e => setUpdateStatus(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="investigating">Investigating</option>
                          <option value="identified">Identified</option>
                          <option value="monitoring">Monitoring</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <textarea
                          value={updateText}
                          onChange={e => setUpdateText(e.target.value)}
                          placeholder="What's the latest update?"
                          rows={2}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedIncident(null)}
                            className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-xs hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddIncidentUpdate(incident.id)}
                            disabled={addingUpdate || !updateText.trim()}
                            className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-1.5 rounded-lg text-xs font-medium"
                          >
                            {addingUpdate ? 'Posting...' : 'Post update'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedIncident(incident.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        <Edit2 className="w-3 h-3" />
                        Post update
                      </button>
                    )}
                  </>
                )}

                {(incident.incident_updates?.length || 0) > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    {incident.incident_updates
                      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 3)
                      .map((update: any) => (
                        <div key={update.id} className="text-xs">
                          <span className="text-gray-500 capitalize font-medium">{update.status}</span>
                          <span className="text-gray-400 mx-1">·</span>
                          <span className="text-gray-400">{formatDate(update.created_at)}</span>
                          <p className="text-gray-600 mt-0.5">{update.body}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
