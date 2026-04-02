'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CREATOR_TYPES = ['Business/Marketing', 'Finance/Investing', 'Technology/Coding', 'Personal Development', 'Health & Wellness', 'Creative Arts', 'Food/Cooking', 'Relationships/Dating', 'Parenting/Family', 'Other']
const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'Podcast', 'Facebook', 'Other', 'None']

const steps = ['About You', 'Your Audience', 'Your Course', 'Launch & Marketing']

type Answers = {
  name: string; creatorType: string; niche: string
  emailListSize: string; primaryPlatform: string; followerCount: string; engagementLevel: string
  courseCount: string; courseType: string; price: number; experienceLevel: string
  launchType: string; contentFrequency: string; marketingBudget: string; hasTestimonials: string
}

const defaults: Answers = {
  name: '', creatorType: '', niche: '',
  emailListSize: '0', primaryPlatform: 'None', followerCount: '0', engagementLevel: 'medium',
  courseCount: '1', courseType: 'signature', price: 497, experienceLevel: 'first_time',
  launchType: 'live', contentFrequency: 'weekly', marketingBudget: 'none', hasTestimonials: 'none',
}

function Radio({ name, value, current, onChange, label, desc }: { name: string; value: string; current: string; onChange: (v: string) => void; label: string; desc?: string }) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${current === value ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)} className="mt-0.5 accent-brand-600" />
      <div>
        <div className="font-medium text-gray-900 text-sm">{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
    </label>
  )
}

export default function CalculatorPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>(defaults)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers(a => ({ ...a, [key]: value }))
  }

  function input(key: keyof Answers, label: string, placeholder = '') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="text"
          value={answers[key] as string}
          onChange={e => set(key, e.target.value as Answers[typeof key])}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    )
  }

  async function submit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (res.status === 401) { router.push('/auth?mode=login'); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push(`/results/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const stepContent = [
    // Step 1: About you
    <div key="s1" className="space-y-5">
      {input('name', 'Your first name', 'Jane')}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What type of creator are you?</label>
        <div className="grid grid-cols-2 gap-2">
          {CREATOR_TYPES.map(t => (
            <label key={t} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer text-sm transition-all ${answers.creatorType === t ? 'border-brand-500 bg-brand-50 font-medium text-brand-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              <input type="radio" name="creatorType" checked={answers.creatorType === t} onChange={() => set('creatorType', t)} className="accent-brand-600" />
              {t}
            </label>
          ))}
        </div>
      </div>
      {input('niche', 'Describe your course topic in one sentence', 'e.g. "Help freelancers charge more for their work"')}
    </div>,

    // Step 2: Audience
    <div key="s2" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email list size</label>
        <div className="space-y-2">
          {[['0', 'No email list yet'], ['1-500', '1–500 subscribers'], ['500-2000', '500–2,000'], ['2000-10000', '2,000–10,000'], ['10000+', '10,000+']].map(([v, l]) => (
            <Radio key={v} name="email" value={v} current={answers.emailListSize} onChange={v => set('emailListSize', v)} label={l} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary social platform</label>
        <div className="grid grid-cols-4 gap-2">
          {PLATFORMS.map(p => (
            <label key={p} className={`flex items-center justify-center p-2 rounded-lg border-2 cursor-pointer text-sm transition-all ${answers.primaryPlatform === p ? 'border-brand-500 bg-brand-50 font-medium text-brand-800' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
              <input type="radio" name="platform" checked={answers.primaryPlatform === p} onChange={() => set('primaryPlatform', p)} className="sr-only" />
              {p}
            </label>
          ))}
        </div>
      </div>
      {answers.primaryPlatform !== 'None' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Followers / subscribers on that platform</label>
          <div className="space-y-2">
            {[['0', 'Under 1,000'], ['1-1000', '1,000–10,000'], ['1000-10000', '10,000–100,000'], ['10000-100000', '100,000–1M'], ['100000+', 'Over 1M']].map(([v, l]) => (
              <Radio key={v} name="followers" value={v} current={answers.followerCount} onChange={v => set('followerCount', v)} label={l} />
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How engaged is your audience?</label>
        <div className="space-y-2">
          {[['low', 'Low — few likes or comments', 'Ghost followers, minimal interaction'], ['medium', 'Medium — some regular engagement', 'People occasionally comment and share'], ['high', 'High — active, responsive community', 'Consistent comments, DMs, replies'], ['exceptional', 'Exceptional — cult-like following', 'Highly personal, people quote you, huge trust']].map(([v, l, d]) => (
            <Radio key={v} name="engagement" value={v} current={answers.engagementLevel} onChange={v => set('engagementLevel', v)} label={l} desc={d} />
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Course
    <div key="s3" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How many courses do you plan to launch in the next 12 months?</label>
        <div className="space-y-2">
          {[['1', '1 course'], ['2-3', '2–3 courses'], ['4+', '4 or more']].map(([v, l]) => (
            <Radio key={v} name="courseCount" value={v} current={answers.courseCount} onChange={v => set('courseCount', v)} label={l} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What type of course?</label>
        <div className="space-y-2">
          {[['mini', 'Mini-course', 'Short, focused, typically $47–$197'], ['signature', 'Signature course', 'Comprehensive, typically $297–$997'], ['cohort', 'Cohort / Group program', 'Live group experience, $1,000–$3,000'], ['highticket', 'High-ticket / Mastermind', 'Premium access, $3,000+']].map(([v, l, d]) => (
            <Radio key={v} name="courseType" value={v} current={answers.courseType} onChange={v => set('courseType', v)} label={l} desc={d} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What price will you charge? ($)</label>
        <input
          type="number"
          min={1}
          value={answers.price}
          onChange={e => set('price', Number(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Have you sold courses or digital products before?</label>
        <div className="space-y-2">
          {[['first_time', 'No — this is my first', ''], ['some', 'Yes, some sales (under $10k)', ''], ['mid', 'Yes, I\'ve made $10k–$100k', ''], ['experienced', 'Yes, I\'ve made $100k+', '']].map(([v, l, d]) => (
            <Radio key={v} name="experience" value={v} current={answers.experienceLevel} onChange={v => set('experienceLevel', v)} label={l} desc={d || undefined} />
          ))}
        </div>
      </div>
    </div>,

    // Step 4: Launch & Marketing
    <div key="s4" className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How will you launch?</label>
        <div className="space-y-2">
          {[['live', 'Live launch', 'Webinar, challenge, or open cart window with urgency'], ['evergreen', 'Evergreen funnel', 'Always-on funnel, ads + email sequences'], ['both', 'Both — live and evergreen', ''], ['unsure', 'Not sure yet', '']].map(([v, l, d]) => (
            <Radio key={v} name="launch" value={v} current={answers.launchType} onChange={v => set('launchType', v)} label={l} desc={d || undefined} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How often do you create content?</label>
        <div className="space-y-2">
          {[['rarely', 'Rarely or never'], ['weekly', '1–2× per week'], ['multiple', '3–5× per week'], ['daily', 'Daily or more']].map(([v, l]) => (
            <Radio key={v} name="content" value={v} current={answers.contentFrequency} onChange={v => set('contentFrequency', v)} label={l} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly marketing / ads budget</label>
        <div className="space-y-2">
          {[['none', 'None — organic only'], ['low', 'Under $500/mo'], ['medium', '$500–$2,000/mo'], ['high', 'Over $2,000/mo']].map(([v, l]) => (
            <Radio key={v} name="budget" value={v} current={answers.marketingBudget} onChange={v => set('marketingBudget', v)} label={l} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Do you have testimonials or proven results?</label>
        <div className="space-y-2">
          {[['none', 'Not yet — just getting started'], ['starting', 'A couple of informal ones'], ['some', 'Yes, a handful of solid testimonials'], ['strong', 'Strong — multiple case studies / transformations']].map(([v, l]) => (
            <Radio key={v} name="proof" value={v} current={answers.hasTestimonials} onChange={v => set('hasTestimonials', v)} label={l} />
          ))}
        </div>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-bold text-brand-700">CourseCalc</a>
        <span className="text-sm text-gray-500">Step {step + 1} of {steps.length}</span>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-500' : 'bg-gray-200'}`} />
              <div className={`text-xs mt-1 font-medium ${i === step ? 'text-brand-600' : 'text-gray-400'}`}>{s}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{steps[step]}</h2>
          {stepContent[step]}
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg mb-4">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-brand-600 text-white font-semibold py-3 rounded-xl hover:bg-brand-700"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Calculating...' : 'Show my revenue projection →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
