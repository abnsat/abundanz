import Link from 'next/link'

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { status } = await searchParams
  const cancelled = status === 'cancel'

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {cancelled ? (
        <>
          <h1 className="text-3xl font-bold mb-3">No charge made</h1>
          <p className="text-zinc-400 mb-8">You cancelled before completing payment.</p>
          <Link
            href="/pricing"
            className="bg-white text-black font-semibold px-8 py-3 rounded hover:bg-zinc-200 transition-colors"
          >
            Back to pricing
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-3">You&apos;re subscribed!</h1>
          <p className="text-zinc-400 mb-8">Welcome to Abundanz. Start watching now.</p>
          <Link
            href="/dashboard"
            className="bg-white text-black font-semibold px-8 py-3 rounded hover:bg-zinc-200 transition-colors"
          >
            Go to app
          </Link>
        </>
      )}
    </div>
  )
}
