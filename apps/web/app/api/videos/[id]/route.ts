import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/utils/supabase/api-auth'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [video] = await db.select().from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ video })
}
