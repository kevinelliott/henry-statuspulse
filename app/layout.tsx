import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StatusPulse — Status Pages for SaaS Teams',
  description: 'Beautiful, affordable status pages for SaaS teams and indie developers. Starting free.',
  openGraph: {
    title: 'StatusPulse',
    description: 'Beautiful status pages starting free. Alternative to Statuspage.io.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
