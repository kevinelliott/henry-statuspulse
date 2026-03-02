import Link from 'next/link'
import { CheckCircle2, Zap, Globe, Bell, BarChart3, Shield } from 'lucide-react'

const features = [
  { icon: Globe, title: 'Public Status Pages', desc: 'Beautiful, hosted status pages at yourapp.statuspulse.app/status/slug — zero config needed.' },
  { icon: Bell, title: 'Email Subscriber Alerts', desc: 'Your users subscribe and get notified automatically when you post incidents or resolve them.' },
  { icon: BarChart3, title: 'Component Health Tracking', desc: 'Track API, database, CDN, and any other service component with fine-grained status control.' },
  { icon: Zap, title: 'Incident Management', desc: 'Post incidents, add updates, and resolve them. Full incident history shown publicly.' },
  { icon: Shield, title: 'Embeddable Badge', desc: 'Drop a real-time SVG status badge anywhere — docs, README, your own site.' },
  { icon: CheckCircle2, title: 'Affordable Pricing', desc: 'Start free. Upgrade for $9/mo. No $29/mo Atlassian tax just for a status page.' },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For indie developers just getting started.',
    features: ['1 status page', '5 components', 'Public page', 'Embeddable badge', 'Incident history'],
    cta: 'Start Free',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$9',
    period: 'per month',
    description: 'For small SaaS teams.',
    features: ['3 status pages', 'Unlimited components', '100 email subscribers', 'Email alerts', 'Everything in Free'],
    cta: 'Start Starter',
    href: '/auth/signup?plan=starter',
    highlight: true,
  },
  {
    name: 'Growth',
    price: '$29',
    period: 'per month',
    description: 'For growing SaaS companies.',
    features: ['Unlimited pages', 'Unlimited subscribers', 'Custom domain', 'Priority support', 'Everything in Starter'],
    cta: 'Start Growth',
    href: '/auth/signup?plan=growth',
    highlight: false,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">StatusPulse</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <CheckCircle2 className="w-4 h-4" />
          Alternative to Statuspage.io — from $0/mo
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Status pages that don&apos;t cost<br />
          <span className="text-green-500">an arm and a leg</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Beautiful public status pages for SaaS teams and indie developers.
          Start free. Upgrade for $9/mo. Not $29/mo like the other guys.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-sm"
          >
            Create your status page — free
          </Link>
          <Link
            href="/status/demo"
            className="border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            See example page
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required</p>
      </section>

      {/* Demo preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Acme Status</h2>
              <p className="text-gray-500 text-sm">All systems operational</p>
            </div>
            <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Operational
            </span>
          </div>
          <div className="space-y-3">
            {['API', 'Dashboard', 'Database', 'CDN'].map((component, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
                <span className="text-gray-800 font-medium text-sm">{component}</span>
                <span className="flex items-center gap-1.5 text-green-600 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Operational
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need, nothing you don&apos;t</h2>
            <p className="text-gray-500 text-lg">All the features of enterprise status page tools, at a fraction of the cost.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500 text-lg">Statuspage.io charges $29/mo minimum. We start at $0.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border-2 ${
                  plan.highlight
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mb-3">
                    Most popular
                  </div>
                )}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to launch your status page?</h2>
          <p className="text-gray-400 text-lg mb-8">Join hundreds of teams who trust StatusPulse to communicate reliability to their users.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Get started free — no credit card needed
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">StatusPulse</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 StatusPulse. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
