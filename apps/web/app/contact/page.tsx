import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { ContactForm } from './ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-1">Contact us</h1>
          <p className="text-zinc-500 text-sm mb-8">We'd love to hear from you. We'll get back to you as soon as possible.</p>
          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
