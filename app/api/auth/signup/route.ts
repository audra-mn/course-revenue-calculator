import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '../../../../lib/db'
import { signToken } from '../../../../lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Email and password (min 8 chars) are required' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email',
      [email.toLowerCase(), hash, name || null]
    )
    const user = result.rows[0]
    const token = await signToken({ userId: user.id, email: user.email })
    cookies().set('session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const pgErr = err as { code?: string }
    if (pgErr.code === '23505') return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
