import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan || 'free'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid gap-6 max-w-2xl">
        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="text-gray-900">{profile?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current plan</span>
              <span className="font-medium text-gray-900 capitalize">{currentPlan}</span>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing & Plan</h2>
          <div className="grid gap-4">
            {(['free', 'starter', 'growth'] as const).map(planKey => {
              const plan = PLANS[planKey]
              const isCurrent = currentPlan === planKey
              return (
                <div
                  key={planKey}
                  className={`border-2 rounded-xl p-4 ${isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        {isCurrent && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Current
                          </span>
                        )}
                      </div>
                      <ul className="text-sm text-gray-500 space-y-1">
                        <li>{plan.pages === -1 ? 'Unlimited' : plan.pages} status pages</li>
                        <li>{plan.components === -1 ? 'Unlimited' : plan.components} components per page</li>
                        <li>{plan.subscribers === 0 ? 'No' : plan.subscribers === -1 ? 'Unlimited' : plan.subscribers} email subscribers</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">${plan.price}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                      {!isCurrent && planKey !== 'free' && (
                        <form action="/api/stripe/checkout" method="POST" className="mt-2">
                          <input type="hidden" name="plan" value={planKey} />
                          <button
                            type="submit"
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Upgrade
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="font-semibold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account will permanently remove all your status pages, components, and incidents.
          </p>
          <button className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
