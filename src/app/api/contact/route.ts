import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      // Safe for build/export; only checked at runtime
      return NextResponse.json({ ok: false, error: 'Missing RESEND_API_KEY' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>', // or your verified domain sender
      to: 'betis.mohamed.dhia@gmail.com',
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error sending' }, { status: 500 })
  }
}