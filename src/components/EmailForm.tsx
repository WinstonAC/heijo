import { FormEvent, useState } from 'react'

export default function EmailForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    
    try {
      const res = await fetch('/api/collect-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await res.json()
      if (result.success) {
        setIsSubmitted(true)
      } else {
        alert('Error submitting email.')
      }
    } catch (error) {
      alert('Error submitting email.')
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg">Thank you for joining our waitlist!</p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="px-4 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="email"
        type="email"
        required
        className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your email"
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Join
      </button>
    </form>
  )
} 