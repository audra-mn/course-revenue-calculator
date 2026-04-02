export interface AssessmentAnswers {
  // Step 1: About you
  name: string
  creatorType: string
  niche: string

  // Step 2: Audience
  emailListSize: string
  primaryPlatform: string
  followerCount: string
  engagementLevel: string

  // Step 3: Course
  courseCount: string
  courseType: string
  price: number
  experienceLevel: string

  // Step 4: Launch & marketing
  launchType: string
  contentFrequency: string
  marketingBudget: string
  hasTestimonials: string
}

export interface ProjectionResult {
  conservative: number
  realistic: number
  optimistic: number
  perLaunch: number
  annualLaunches: number
  emailBuyers: number
  socialBuyers: number
  keyFactors: string[]
  topTips: string[]
}

const EMAIL_LIST_SIZES: Record<string, number> = {
  '0': 0,
  '1-500': 250,
  '500-2000': 1200,
  '2000-10000': 6000,
  '10000+': 25000,
}

const FOLLOWER_COUNTS: Record<string, number> = {
  '0': 0,
  '1-1000': 500,
  '1000-10000': 5500,
  '10000-100000': 55000,
  '100000+': 250000,
}

const EMAIL_CONVERSION: Record<string, number> = {
  low: 0.008,
  medium: 0.018,
  high: 0.028,
  exceptional: 0.04,
}

const SOCIAL_CONVERSION: Record<string, Record<string, number>> = {
  Instagram: { low: 0.001, medium: 0.002, high: 0.004, exceptional: 0.007 },
  YouTube: { low: 0.002, medium: 0.004, high: 0.007, exceptional: 0.012 },
  TikTok: { low: 0.0005, medium: 0.001, high: 0.002, exceptional: 0.004 },
  LinkedIn: { low: 0.002, medium: 0.005, high: 0.009, exceptional: 0.015 },
  Podcast: { low: 0.005, medium: 0.01, high: 0.018, exceptional: 0.028 },
  Facebook: { low: 0.001, medium: 0.002, high: 0.004, exceptional: 0.007 },
  None: { low: 0, medium: 0, high: 0, exceptional: 0 },
  Other: { low: 0.001, medium: 0.002, high: 0.004, exceptional: 0.007 },
}

const NICHE_MULTIPLIERS: Record<string, number> = {
  'Business/Marketing': 1.35,
  'Finance/Investing': 1.3,
  'Technology/Coding': 1.25,
  'Personal Development': 1.1,
  'Health & Wellness': 1.0,
  'Relationships/Dating': 0.95,
  'Creative Arts': 0.85,
  'Food/Cooking': 0.8,
  'Parenting/Family': 0.85,
  Other: 1.0,
}

const EXPERIENCE_MULTIPLIERS: Record<string, number> = {
  first_time: 0.65,
  some: 0.9,
  mid: 1.1,
  experienced: 1.35,
}

const LAUNCH_MULTIPLIERS: Record<string, number> = {
  live: 1.2,
  evergreen: 0.75,
  both: 1.0,
  unsure: 0.8,
}

const CONTENT_MULTIPLIERS: Record<string, number> = {
  rarely: 0.7,
  weekly: 0.9,
  multiple: 1.1,
  daily: 1.25,
}

const BUDGET_MULTIPLIERS: Record<string, number> = {
  none: 0.8,
  low: 1.0,
  medium: 1.3,
  high: 1.6,
}

const PROOF_MULTIPLIERS: Record<string, number> = {
  none: 0.7,
  starting: 0.85,
  some: 1.1,
  strong: 1.35,
}

const ANNUAL_LAUNCHES: Record<string, number> = {
  '1': 1,
  '2-3': 2.5,
  '4+': 4,
}

export function calculate(answers: AssessmentAnswers): ProjectionResult {
  const emailSize = EMAIL_LIST_SIZES[answers.emailListSize] ?? 0
  const followers = FOLLOWER_COUNTS[answers.followerCount] ?? 0
  const engagement = answers.engagementLevel || 'medium'
  const platform = answers.primaryPlatform || 'None'

  const emailConv = EMAIL_CONVERSION[engagement] ?? 0.018
  const socialConv = (SOCIAL_CONVERSION[platform] ?? SOCIAL_CONVERSION['Other'])[engagement] ?? 0.002

  const launchMult = LAUNCH_MULTIPLIERS[answers.launchType] ?? 1.0
  const emailBuyers = emailSize * emailConv * launchMult
  const socialBuyers = followers * socialConv * launchMult

  const nicheMult = NICHE_MULTIPLIERS[answers.creatorType] ?? 1.0
  const expMult = EXPERIENCE_MULTIPLIERS[answers.experienceLevel] ?? 0.9
  const contentMult = CONTENT_MULTIPLIERS[answers.contentFrequency] ?? 1.0
  const budgetMult = BUDGET_MULTIPLIERS[answers.marketingBudget] ?? 1.0
  const proofMult = PROOF_MULTIPLIERS[answers.hasTestimonials] ?? 0.85

  const totalBuyers = (emailBuyers + socialBuyers) * nicheMult * expMult * contentMult * budgetMult * proofMult
  const perLaunch = Math.round(totalBuyers * answers.price)

  const launches = ANNUAL_LAUNCHES[answers.courseCount] ?? 1
  const realistic = Math.round(perLaunch * launches)

  const keyFactors: string[] = []
  if (emailSize > 2000) keyFactors.push(`Strong email list of ${emailSize.toLocaleString()} subscribers`)
  if (followers > 10000) keyFactors.push(`${followers.toLocaleString()} ${platform} followers`)
  if (engagement === 'high' || engagement === 'exceptional') keyFactors.push('High audience engagement')
  if (nicheMult > 1.1) keyFactors.push(`${answers.creatorType} is a high-converting niche`)
  if (proofMult > 1.0) keyFactors.push('Testimonials & proof boost conversions')
  if (budgetMult > 1.0) keyFactors.push('Marketing budget amplifies reach')
  if (keyFactors.length === 0) keyFactors.push('Solid foundation — room to grow each factor')

  const topTips: string[] = []
  if (emailSize < 1000) topTips.push('Grow your email list — it converts 10-20x better than social')
  if (answers.experienceLevel === 'first_time') topTips.push('Start with a lower-priced offer to get testimonials fast')
  if (answers.hasTestimonials === 'none' || answers.hasTestimonials === 'starting') topTips.push('Run a beta cohort at a discount to collect case studies')
  if (answers.launchType === 'evergreen') topTips.push('Add a live launch component to boost urgency and conversion')
  if (answers.contentFrequency === 'rarely') topTips.push('Consistent content creation is your highest-leverage growth lever')
  if (answers.marketingBudget === 'none') topTips.push('Even $500/mo in ads can significantly amplify launch results')
  if (topTips.length === 0) topTips.push('You\'re well-positioned — focus on list growth and product quality')

  return {
    conservative: Math.round(realistic * 0.55),
    realistic,
    optimistic: Math.round(realistic * 1.6),
    perLaunch,
    annualLaunches: launches,
    emailBuyers: Math.round(emailBuyers),
    socialBuyers: Math.round(socialBuyers),
    keyFactors,
    topTips,
  }
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toLocaleString()}`
}
