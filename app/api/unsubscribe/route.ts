import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('subscribers')
    .delete()
    .eq('token', token)

  if (error) {
    return new Response('<html><body><p>Error unsubscribing. Please try again.</p></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  return new Response(
    '<html><body style="font-family:sans-serif;max-width:400px;margin:80px auto;text-align:center"><h2>Unsubscribed</h2><p>You have been successfully unsubscribed from status notifications.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}
