import { NextRequest, NextResponse } from 'next/server'
import { videos } from '@abundanz/shared'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'

const { bunnyVideoId: _omit, ...publicColumns } = videos

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [video] = await db.select(publicColumns).from(videos).where(eq(videos.id, id))
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ video })
}
