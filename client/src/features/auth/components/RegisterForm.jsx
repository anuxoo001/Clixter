import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const api = import.meta.env.VITE_API_URL || '';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const onRegisterHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${api}/api/user/register`,
        input,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/auth-login", { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-[28px] bg-slate-950/90 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.16),transparent_28%)] p-8 shadow-glass ring-1 ring-white/10 backdrop-blur-2xl text-slate-100 border border-slate-700/70">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Create account</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Join Clixter today</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          Register to start sharing posts, stories, and chat with your friends.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="rounded-3xl bg-slate-900/80 p-4 ring-1 ring-white/5 shadow-[0_15px_50px_-40px_rgba(236,72,153,0.7)]">
          <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-300">Welcome to Clixter</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Register with your email to unlock stories, posts, and live chat. Your account is protected with secure session handling.
          </p>
        </div>
      </div>

      <form onSubmit={onRegisterHandler} className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Full Name
          <input
            name="fullName"
            type="text"
            value={input.fullName}
            onChange={onChangeHandler}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Jane Doe"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Username
          <input
            name="userName"
            type="text"
            value={input.userName}
            onChange={onChangeHandler}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="yourusername"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Email
          <input
            name="email"
            type="email"
            value={input.email}
            onChange={onChangeHandler}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="hello@example.com"
          />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Password
          <input
            name="password"
            type="password"
            value={input.password}
            onChange={onChangeHandler}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Create a password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-fuchsia-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register Now'}
        </button>
      </form>

      <div className="mt-6 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400 ring-1 ring-white/5">
        <p className="font-semibold text-slate-100">Why sign up?</p>
        <ul className="mt-3 space-y-2 text-slate-400">
          <li>• Share your first story instantly.</li>
          <li>• Follow users and see trending posts.</li>
          <li>• Fast auth experience with Tailwind effects.</li>
        </ul>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate("/auth-login")}
          className="font-semibold text-sky-300 transition hover:text-sky-100"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
