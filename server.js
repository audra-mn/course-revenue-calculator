const express = require('express')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
})

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Auto-init DB tables
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    projection JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`).then(() => console.log('DB ready')).catch(err => console.error('DB init error:', err.message))

function auth(req, res, next) {
  const token = req.cookies.session
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || password.length < 8)
    return res.status(400).json({ error: 'Email and password (min 8 chars) required' })
  try {
    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email',
      [email.toLowerCase(), hash, name || null]
    )
    const token = jwt.sign({ userId: result.rows[0].id, email: result.rows[0].email }, JWT_SECRET, { expiresIn: '30d' })
    res.cookie('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.json({ ok: true })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email?.toLowerCase()])
  const user = result.rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid email or password' })
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
  res.cookie('session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.json({ ok: true })
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('session')
  res.json({ ok: true })
})

app.get('/api/me', auth, async (req, res) => {
  const result = await pool.query('SELECT name, email FROM users WHERE id = $1', [req.user.userId])
  res.json(result.rows[0] || {})
})

app.post('/api/calculate', auth, async (req, res) => {
  const answers = req.body
  const projection = calculate(answers)
  const result = await pool.query(
    'INSERT INTO assessments (user_id, answers, projection) VALUES ($1, $2, $3) RETURNING id',
    [req.user.userId, JSON.stringify(answers), JSON.stringify(projection)]
  )
  res.json({ id: result.rows[0].id, projection })
})

app.get('/api/results/:id', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT answers, projection FROM assessments WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.userId]
  )
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
  res.json(result.rows[0])
})

app.get('/api/history', auth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, answers->\'niche\' as niche, projection->\'realistic\' as realistic, created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
    [req.user.userId]
  )
  res.json(result.rows)
})

// Revenue calculator logic
function calculate(a) {
  const emailSizes = { '0': 0, '1-500': 250, '500-2000': 1200, '2000-10000': 6000, '10000+': 25000 }
  const followerCounts = { '0': 0, '1-1000': 500, '1000-10000': 5500, '10000-100000': 55000, '100000+': 250000 }
  const emailConv = { low: 0.008, medium: 0.018, high: 0.028, exceptional: 0.04 }
  const socialConv = {
    Instagram: { low: 0.001, medium: 0.002, high: 0.004, exceptional: 0.007 },
    YouTube: { low: 0.002, medium: 0.004, high: 0.007, exceptional: 0.012 },
    TikTok: { low: 0.0005, medium: 0.001, high: 0.002, exceptional: 0.004 },
    LinkedIn: { low: 0.002, medium: 0.005, high: 0.009, exceptional: 0.015 },
    Podcast: { low: 0.005, medium: 0.01, high: 0.018, exceptional: 0.028 },
    Facebook: { low: 0.001, medium: 0.002, high: 0.004, exceptional: 0.007 },
    None: { low: 0, medium: 0, high: 0, exceptional: 0 },
  }
  const nicheMult = { 'Business/Marketing': 1.35, 'Finance/Investing': 1.3, 'Technology/Coding': 1.25, 'Personal Development': 1.1, 'Health & Wellness': 1.0, 'Relationships/Dating': 0.95, 'Creative Arts': 0.85, 'Food/Cooking': 0.8, 'Parenting/Family': 0.85, Other: 1.0 }
  const expMult = { first_time: 0.65, some: 0.9, mid: 1.1, experienced: 1.35 }
  const launchMult = { live: 1.2, evergreen: 0.75, both: 1.0, unsure: 0.8 }
  const contentMult = { rarely: 0.7, weekly: 0.9, multiple: 1.1, daily: 1.25 }
  const budgetMult = { none: 0.8, low: 1.0, medium: 1.3, high: 1.6 }
  const proofMult = { none: 0.7, starting: 0.85, some: 1.1, strong: 1.35 }
  const annualLaunches = { '1': 1, '2-3': 2.5, '4+': 4 }

  const emailSize = emailSizes[a.emailListSize] || 0
  const followers = followerCounts[a.followerCount] || 0
  const eng = a.engagementLevel || 'medium'
  const platform = a.primaryPlatform || 'None'
  const lm = launchMult[a.launchType] || 1.0

  const eb = emailSize * (emailConv[eng] || 0.018) * lm
  const sb = followers * ((socialConv[platform] || socialConv.None)[eng] || 0) * lm
  const mult = (nicheMult[a.creatorType] || 1.0) * (expMult[a.experienceLevel] || 0.9) * (contentMult[a.contentFrequency] || 1.0) * (budgetMult[a.marketingBudget] || 1.0) * (proofMult[a.hasTestimonials] || 0.85)
  const totalBuyers = (eb + sb) * mult
  const perLaunch = Math.round(totalBuyers * (a.price || 497))
  const launches = annualLaunches[a.courseCount] || 1
  const realistic = Math.round(perLaunch * launches)

  const tips = []
  if (emailSize < 1000) tips.push('Grow your email list — it converts 10–20× better than social')
  if (a.experienceLevel === 'first_time') tips.push('Run a beta at a discount to collect testimonials fast')
  if (a.hasTestimonials === 'none' || a.hasTestimonials === 'starting') tips.push('Social proof is your #1 conversion lever — get 3–5 case studies')
  if (a.launchType === 'evergreen') tips.push('Add a live launch element for urgency and higher conversion')
  if (a.contentFrequency === 'rarely') tips.push('Consistent content creation is your highest-leverage growth activity')
  if (a.marketingBudget === 'none') tips.push('Even $500/mo in ads can significantly amplify your launch results')
  if (!tips.length) tips.push('You\'re well positioned — focus on list growth and course quality')

  const factors = []
  if (emailSize > 2000) factors.push(`Strong email list of ${emailSize.toLocaleString()} subscribers`)
  if (followers > 10000) factors.push(`${followers.toLocaleString()} ${platform} followers`)
  if (eng === 'high' || eng === 'exceptional') factors.push('Highly engaged audience')
  if ((nicheMult[a.creatorType] || 1) > 1.1) factors.push(`${a.creatorType} is a high-converting niche`)
  if ((proofMult[a.hasTestimonials] || 0) > 1) factors.push('Social proof boosts your conversion rate')
  if (!factors.length) factors.push('Solid foundation — growing each factor multiplies your results')

  return {
    conservative: Math.round(realistic * 0.55),
    realistic,
    optimistic: Math.round(realistic * 1.6),
    perLaunch,
    annualLaunches: launches,
    emailBuyers: Math.round(eb),
    socialBuyers: Math.round(sb),
    tips,
    factors,
  }
}

function fmt(n) {
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'k'
  return '$' + n.toLocaleString()
}

app.listen(PORT, () => console.log(`Running on port ${PORT}`))
