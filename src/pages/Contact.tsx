import { useState } from 'react'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'

// 1. Go to https://web3forms.com
// 2. Enter samcl7073@gmail.com, get an access key, click the verification link
// 3. Paste the key below. That's it — your email is never exposed in the source.
const WEB3FORMS_ACCESS_KEY = '21485733-bea7-46dd-a512-4732b51fdcee'

type Status = 'idle' | 'sending' | 'sent' | 'error'

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/occasions.places',
    value: '@occasions.places',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: '500px',
    href: 'https://500px.com/p/occasionsplaces?view=photos',
    value: 'occasionsplaces',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 9h4a3 3 0 0 1 0 6h-2.5" />
        <path d="M9.5 9V7" />
      </svg>
    ),
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('error')
      setErrorMsg(
        'The contact form is not yet configured. Please reach out via the social links above for now.',
      )
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: form.name,
        email: form.email,
        subject: form.subject || `New message from ${form.name}`,
        message: form.message,
        from_name: 'samanthaclai.com contact form',
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('sent')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
        setErrorMsg(data.message || 'Something went wrong sending your message. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Could not reach the message server. Please try again in a moment.')
    }
  }

  return (
    <PageTransition>
      <CoverCard gradient="dawn" title="Contact" subtitle="Let's turn insight into impact" />

      <main className="contact-page">
        <section className="contact-intro">
          <p>
            I'm always open to chat about research, prototyping, collaborations,
            or just trading notes on XR and interactive systems. Send a note
            using the form below, or find me on any of the platforms.
          </p>
        </section>

        <section className="contact-socials" aria-label="Social links">
          {SOCIALS.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-social-card"
            >
              <span className="contact-social-icon">{s.icon}</span>
              <span className="contact-social-text">
                <span className="contact-social-label">{s.label}</span>
                <span className="contact-social-value">{s.value}</span>
              </span>
            </a>
          ))}
        </section>

        <section className="contact-form-section">
          <h2>Send a message</h2>
          {status === 'sent' ? (
            <div className="contact-success" role="status">
              <div className="contact-success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <h3>Thanks for reaching out!</h3>
              <p>Your message is on its way. I'll get back to you as soon as I can.</p>
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setStatus('idle')}
              >
                SEND ANOTHER
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <label className="contact-field">
                  <span>Name</span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>
                <label className="contact-field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </label>
              </div>
              <label className="contact-field">
                <span>Subject</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="What's this about?"
                />
              </label>
              <label className="contact-field">
                <span>Message</span>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="Tell me a bit about what you have in mind..."
                />
              </label>
              {status === 'error' && errorMsg && (
                <p className="contact-form-error" role="alert">{errorMsg}</p>
              )}
              <div className="contact-form-footer">
                <button type="submit" className="btn btn-dark" disabled={status === 'sending'}>
                  {status === 'sending' ? 'SENDING…' : 'SEND MESSAGE'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </PageTransition>
  )
}
