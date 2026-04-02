import { notFound } from 'next/navigation'
import Link from 'next/link'
import pool from '@/lib/db'
import { formatCurrency, type ProjectionResult } from '@/lib/calculator'

async function getAssessment(id: string) {
  try {
    const result = await pool.query(
      'SELECT answers, projection FROM assessments WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  } catch {
    return null
  }
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const row = await getAssessment(params.id)
  if (!row) notFound()

  const answers = row.answers
  const proj: ProjectionResult = row.projection

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-brand-700">CourseCalc</Link>
        <Link href="/calculator" className="text-sm text-brand-600 hover:underline">Recalculate</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="text-center">
          <p className="text-brand-600 font-medium text-sm mb-1">Your personalised projection</p>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {answers.name ? `${answers.name}'s` : 'Your'} Course Revenue Potential
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Based on your audience, niche, and launch strategy</p>
        </div>

        {/* Main projection card */}
        <div className="bg-gradient-to-br from-brand-700 to-purple-900 text-white rounded-2xl p-8">
          <p className="text-brand-200 text-sm font-medium mb-6">Annual revenue projection (12 months)</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-brand-300 text-xs font-medium uppercase tracking-wide mb-1">Conservative</div>
              <div className="text-2xl font-extrabold">{formatCurrency(proj.conservative)}</div>
            </div>
            <div className="text-center bg-white/10 rounded-xl py-3">
              <div className="text-brand-200 text-xs font-medium uppercase tracking-wide mb-1">Realistic</div>
              <div className="text-3xl font-extrabold">{formatCurrency(proj.realistic)}</div>
              <div className="text-brand-300 text-xs mt-1">Most likely</div>
            </div>
            <div className="text-center">
              <div className="text-brand-300 text-xs font-medium uppercase tracking-wide mb-1">Optimistic</div>
              <div className="text-2xl font-extrabold">{formatCurrency(proj.optimistic)}</div>
            </div>
          </div>
        </div>

        {/* Per launch breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Per-launch breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Revenue per launch</div>
              <div className="text-2xl font-extrabold text-gray-900">{formatCurrency(proj.perLaunch)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Launches per year</div>
              <div className="text-2xl font-extrabold text-gray-900">{proj.annualLaunches}×</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Est. buyers from email</div>
              <div className="text-2xl font-extrabold text-gray-900">{proj.emailBuyers}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Est. buyers from social</div>
              <div className="text-2xl font-extrabold text-gray-900">{proj.socialBuyers}</div>
            </div>
          </div>
        </div>

        {/* Key factors */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-3">What's working in your favour</h2>
          <ul className="space-y-2">
            {proj.keyFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Top tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-3">Top tips to increase your revenue</h2>
          <ul className="space-y-2">
            {proj.topTips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 font-bold mt-0.5">{i + 1}.</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Context */}
        <div className="bg-gray-100 rounded-2xl p-5 text-xs text-gray-500">
          <strong className="text-gray-700">How this is calculated:</strong> Projections are based on your audience size × platform-specific conversion rates, adjusted for niche, experience, social proof, content frequency, launch type, and marketing budget — benchmarked against real creator data. Ranges reflect natural variance in real-world launches.
        </div>

        <div className="text-center">
          <Link href="/calculator" className="inline-block bg-brand-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-700">
            Recalculate with different inputs →
          </Link>
        </div>
      </div>
    </div>
  )
}
