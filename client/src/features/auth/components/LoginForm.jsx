import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [input, setInput] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const onChangeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const onLoginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = import.meta.env.VITE_API || 'http://localhost:3004';
      const res = await axios.post(
        `${api.replace(/\/$/, '')}/api/user/login`,
        input,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.auther));
        toast.success(res.data.message);
        if (remember) {
          localStorage.setItem('clixter_remember', JSON.stringify({ email: input.email }));
        } else {
          localStorage.removeItem('clixter_remember');
        }
        navigate("/", { replace: true });
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-[28px] bg-slate-950/90 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.16),transparent_28%)] p-8 shadow-glass ring-1 ring-white/10 backdrop-blur-2xl text-slate-100 border border-slate-700/70">
      <div className="mb-8 space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Clixter login</p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sign in to continue</h2>
        <p className="mx-auto max-w-md text-sm text-slate-400">
          Use your account to access posts, stories, chat, and real-time notifications.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="rounded-3xl bg-slate-900/80 p-4 ring-1 ring-white/5 shadow-[0_15px_50px_-40px_rgba(56,189,248,0.8)]">
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Secure access</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sign in with your email to keep everything safe and connected. Your session is stored securely using modern auth flow.
          </p>
        </div>
      </div>

      <form onSubmit={onLoginHandler} className="space-y-4">
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

        <label className="block text-sm font-medium text-slate-300 relative">
          Password
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={input.password}
            onChange={onChangeHandler}
            required
            className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 pr-12 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-[50%] -translate-y-1/2 text-slate-400 hover:text-slate-100"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember((current) => !current)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-400"
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-sm font-medium text-sky-300 transition hover:text-sky-100"
            onClick={() => toast('Forgot password flow coming soon.')}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-fuchsia-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-6 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400 ring-1 ring-white/5">
        <p className="font-semibold text-slate-100">Made for professionals</p>
        <ul className="mt-3 space-y-2 text-slate-400">
          <li>• Modern password-based login with secure cookies.</li>
          <li>• Remember me keeps your session smooth and seamless.</li>
          <li>• Clean interface with premium gradients and motion.</li>
        </ul>
      </div>

      <div className="mt-6 text-center text-sm text-slate-400">
        Don’t have an account?{' '}
        <button
          type="button"
          onClick={() => navigate("/auth-register")}
          className="font-semibold text-sky-300 transition hover:text-sky-100"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
