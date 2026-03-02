import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, pageId } = await request.json()

  if (!email || !pageId) {
    return NextResponse.json({ error: 'Missing email or pageId' }, { status: 400 })
  }

  const supabase = await createClient()

  // Check page exists and is public
  const { data: page } = await supabase
    .from('status_pages')
    .select('id, name')
    .eq('id', pageId)
    .eq('is_public', true)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  // Upsert subscriber
  const { error } = await supabase
    .from('subscribers')
    .upsert({ page_id: pageId, email, confirmed: true }, { onConflict: 'page_id,email' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
