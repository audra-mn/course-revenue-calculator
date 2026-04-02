import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Course Revenue Calculator — Know Your Earning Potential',
  description: 'Creators use this tool to calculate realistic revenue projections for their online courses based on their audience and niche.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
