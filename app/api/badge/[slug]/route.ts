import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  operational:    { bg: '#22c55e', text: '#ffffff', label: 'operational' },
  degraded:       { bg: '#eab308', text: '#ffffff', label: 'degraded' },
  partial_outage: { bg: '#f97316', text: '#ffffff', label: 'partial outage' },
  major_outage:   { bg: '#ef4444', text: '#ffffff', label: 'major outage' },
  maintenance:    { bg: '#3b82f6', text: '#ffffff', label: 'maintenance' },
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('status_pages')
    .select('name, overall_status')
    .eq('slug', params.slug)
    .eq('is_public', true)
    .single()

  const status = page?.overall_status || 'operational'
  const name = page?.name || params.slug
  const statusInfo = STATUS_COLORS[status] || STATUS_COLORS.operational

  const nameWidth = Math.max(name.length * 6.5, 60)
  const statusWidth = Math.max(statusInfo.label.length * 6.5 + 20, 80)
  const totalWidth = nameWidth + statusWidth

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${nameWidth}" height="20" fill="#555"/>
    <rect x="${nameWidth}" width="${statusWidth}" height="20" fill="${statusInfo.bg}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${nameWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${name}</text>
    <text x="${nameWidth / 2}" y="14">${name}</text>
    <text x="${nameWidth + statusWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${statusInfo.label}</text>
    <text x="${nameWidth + statusWidth / 2}" y="14">${statusInfo.label}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=60, s-maxage=60',
    },
  })
}
