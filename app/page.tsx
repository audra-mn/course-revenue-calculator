import Link from 'next/link'

const stats = [
  { value: '$847k', label: 'Average annual revenue, top 10% creators' },
  { value: '3.2%', label: 'Typical email list conversion rate' },
  { value: '72%', label: 'Of creators underestimate their potential' },
]

const steps = [
  { n: '01', title: 'Tell us about you', desc: 'Your niche, creator type, and audience size.' },
  { n: '02', title: 'Describe your course', desc: 'Pricing, format, and launch strategy.' },
  { n: '03', title: 'Get your projection', desc: 'A personalised revenue forecast with actionable tips.' },
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg text-brand-700">CourseCalc</span>
          <div className="flex gap-3">
            <Link href="/auth?mode=login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100">
              Sign in
            </Link>
            <Link href="/auth?mode=signup" className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 font-medium">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-purple-900 text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-brand-500/30 text-brand-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Free for creators
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            How much can you make<br />from your online course?
          </h1>
          <p className="text-lg text-brand-200 mb-10 max-w-xl mx-auto">
            Answer a few questions about your audience and course idea — we&apos;ll generate a personalised revenue projection backed by real creator data.
          </p>
          <Link
            href="/auth?mode=signup"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-brand-50 shadow-lg hover:shadow-xl transition-all"
          >
            Calculate my revenue →
          </Link>
          <p className="text-brand-300 text-sm mt-4">Takes 3 minutes · No credit card</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-3xl font-extrabold text-brand-700 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-brand-600 font-mono font-bold text-sm mb-4">{s.n}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-brand-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see your number?</h2>
          <p className="text-brand-200 mb-8">Join thousands of creators who&apos;ve used CourseCalc to plan their launch.</p>
          <Link
            href="/auth?mode=signup"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-brand-50"
          >
            Start for free →
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} CourseCalc. Built for creators.
      </footer>
    </main>
  )
}
