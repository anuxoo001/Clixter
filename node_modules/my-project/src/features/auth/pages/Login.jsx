import React from 'react'
import LoginForm from '../components/LoginForm'

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.10),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.12),_transparent_18%)] pointer-events-none" />
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/80 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_25%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_25%)]" />
        <div className="relative grid min-h-[min(80vh,900px)] grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-center gap-8 p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Welcome back to Clixter</p>
              <h1 className="mt-4 text-5xl font-bold tracking-tight leading-tight">Login to your dream social feed</h1>
            </div>
            <div className="grid gap-4 text-sm text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_-30px_rgba(148,163,184,0.5)] transition hover:border-cyan-400/40">
                <p className="font-semibold text-slate-100">Fast, modern experience</p>
                <p className="mt-2">Navigate stories, chat, and notifications without friction.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_-30px_rgba(236,72,153,0.35)] transition hover:border-fuchsia-400/40">
                <p className="font-semibold text-slate-100">Secure session handling</p>
                <p className="mt-2">Login with a polished password flow supported by cookies.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_-30px_rgba(34,211,238,0.35)] transition hover:border-sky-400/40">
                <p className="font-semibold text-slate-100">Premium UI polish</p>
                <p className="mt-2">A refined login screen designed for clarity and confidence.</p>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
