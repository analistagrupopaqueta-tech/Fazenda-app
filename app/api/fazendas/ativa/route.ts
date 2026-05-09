import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { fazenda_id } = await request.json()

    if (!fazenda_id) {
      return NextResponse.json(
        { error: 'fazenda_id is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set('fazenda_id', fazenda_id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
