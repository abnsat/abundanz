import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/app/actions/auth'

interface Props {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  const error = params.error
  const message = params.message

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-3xl font-bold mb-8">Sign In</h1>

        {error && (
          <div className="bg-red-900/50 text-red-300 text-sm px-4 py-3 rounded mb-6">
            {decodeURIComponent(error)}
          </div>
        )}
        {message && (
          <div className="bg-green-900/50 text-green-300 text-sm px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        <form className="space-y-4 mb-6">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full bg-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full bg-zinc-800 text-white placeholder-zinc-500 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button
            formAction={signInWithEmail}
            className="w-full bg-white text-black font-semibold py-3 rounded hover:bg-zinc-200 transition-colors"
          >
            Sign In
          </button>
          <button
            formAction={signUpWithEmail}
            className="w-full border border-zinc-600 text-white font-medium py-3 rounded hover:bg-zinc-900 transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-black px-2 text-zinc-500">or</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full border border-zinc-600 text-white py-3 rounded hover:bg-zinc-900 transition-colors flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  )
}
