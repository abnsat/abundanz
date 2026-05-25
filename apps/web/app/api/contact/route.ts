import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, message } = await req.json()

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'AbundanZ Support <onboarding@resend.dev>',
    to: 'abn.abundanz@gmail.com',
    replyTo: email,
    subject: `Contact form: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
