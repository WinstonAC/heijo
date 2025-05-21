"use client";
import React, { useRef, useState } from 'react';

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  // Animation: Each letter floats/rotates slightly, looping
  const logo = 'Heijō'.split('');
  const animationDelays = [0, 0.2, 0.4, 0.6, 0.8];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const email = emailRef.current?.value;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-[#e5e1da] dark:bg-[#0a0a0a] text-black dark:text-[#ededed] px-4 py-8 sm:py-16 font-sans">
      <main className="flex flex-1 flex-col justify-center items-center w-full max-w-lg mx-auto gap-10">
        {/* Animated Logo */}
        <h1 className="flex text-5xl sm:text-6xl font-normal mb-2 tracking-tight select-none font-logo">
          {logo.map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                animation: `float 2.8s ease-in-out ${animationDelays[i]}s infinite`,
                display: 'inline-block',
                minWidth: '0.7em',
              }}
            >
              {char}
            </span>
          ))}
        </h1>
        {/* Tagline */}
        <div className="text-center text-lg sm:text-xl font-medium mb-2 tracking-tight">
          Micro-moments. Macro-clarity.
        </div>
        {/* Invitation */}
        <div className="text-center text-base text-black/70 dark:text-white/70 mb-4 tracking-tight">
          Come breathe with me. Join the waitlist.
        </div>
        {/* Email Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center">
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded-full border border-black/10 dark:border-white/10 focus:border-black/30 dark:focus:border-white/30 outline-none bg-white dark:bg-black/20 text-black dark:text-white text-base transition placeholder:text-black/40 dark:placeholder:text-white/40 min-w-[180px] tracking-tight"
              aria-label="Your email"
              disabled={loading}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-base transition hover:bg-black/80 dark:hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 min-w-[150px] tracking-tight"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Breathe with me'}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="text-green-700 dark:text-green-400 text-center font-medium py-4 tracking-tight">
              Thank you for joining the waitlist!
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
        {error && <div className="text-red-600 dark:text-red-400 text-center mt-2 text-sm tracking-tight">{error}</div>}
        {/* Privacy Statement */}
        <div className="text-xs text-black/50 dark:text-white/50 text-center mt-4 max-w-xs tracking-tight">
          We respect your privacy. Your email will only be used for updates about Heijō. Unsubscribe anytime.
        </div>
      </main>
      {/* Footer */}
      <footer className="w-full text-center text-xs text-black/40 dark:text-white/40 mt-12 pt-8 pb-2 tracking-tight">
        Powered by Cylon Digital © 2025
      </footer>
      {/* Keyframes for logo animation */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(-2deg) scale(1); opacity: 1; }
          20% { transform: translateY(-8px) rotate(4deg) scale(1.04); opacity: 0.96; }
          40% { transform: translateY(0) rotate(-2deg) scale(1); opacity: 1; }
          60% { transform: translateY(6px) rotate(-4deg) scale(0.98); opacity: 0.98; }
          80% { transform: translateY(0) rotate(2deg) scale(1.01); opacity: 1; }
          100% { transform: translateY(0) rotate(-2deg) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
