const STATUS_CONFIG = {
  // Component/page statuses
  operational:    { label: 'Operational', classes: 'bg-green-100 text-green-700' },
  degraded:       { label: 'Degraded',    classes: 'bg-yellow-100 text-yellow-700' },
  partial_outage: { label: 'Partial Outage', classes: 'bg-orange-100 text-orange-700' },
  major_outage:   { label: 'Major Outage', classes: 'bg-red-100 text-red-700' },
  maintenance:    { label: 'Maintenance', classes: 'bg-blue-100 text-blue-700' },
  // Incident statuses
  investigating:  { label: 'Investigating', classes: 'bg-yellow-100 text-yellow-700' },
  identified:     { label: 'Identified', classes: 'bg-orange-100 text-orange-700' },
  monitoring:     { label: 'Monitoring', classes: 'bg-blue-100 text-blue-700' },
  resolved:       { label: 'Resolved', classes: 'bg-green-100 text-green-700' },
  // Impact
  none:     { label: 'No Impact', classes: 'bg-gray-100 text-gray-600' },
  minor:    { label: 'Minor', classes: 'bg-yellow-100 text-yellow-700' },
  major:    { label: 'Major', classes: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-700' },
}

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'incident' | 'impact'
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
    label: status,
    classes: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
