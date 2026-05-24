import { redirect } from 'next/navigation'

// Catalog moved to / — keep this route alive for any existing bookmarks
export default function DashboardPage() {
  redirect('/')
}
