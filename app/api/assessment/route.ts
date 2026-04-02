import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../lib/db'
import { getSession } from '../../../lib/auth'
import { calculate, type AssessmentAnswers } from '../../../lib/calculator'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const answers: AssessmentAnswers = await req.json()
  const projection = calculate(answers)

  const result = await pool.query(
    'INSERT INTO assessments (user_id, answers, projection) VALUES ($1, $2, $3) RETURNING id',
    [session.userId, JSON.stringify(answers), JSON.stringify(projection)]
  )

  return NextResponse.json({ id: result.rows[0].id })
}
