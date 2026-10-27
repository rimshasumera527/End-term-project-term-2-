import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function useDemo(email = 'rahul@demo.com') {
    setForm({ email, password: 'Demo@1234' });
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      toast(`Welcome back, ${u.name}!`);
      navigate(u.role === 'tutor' ? '/dashboard' : '/tutors');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="serif text-3xl font-bold text-inkblue">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your sessions</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-amber-900/10 bg-white p-7 shadow-lg shadow-indigo-100">
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => useDemo()} className="rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-xs font-semibold text-brand hover:bg-indigo-100">Try as student</button><button type="button" onClick={() => useDemo('meera@demo.com')} className="rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100">Try as tutor</button></div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <label className="block"><span className="text-sm font-semibold">Email</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-indigo-200" /></label>
          <label className="block"><span className="text-sm font-semibold">Password</span>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-indigo-200" /></label>
          <button disabled={busy} className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? 'Logging in…' : 'Log in'}
          </button>
          <p className="text-center text-sm text-slate-500">
            New here? <Link to="/register" className="font-semibold text-brand hover:underline">Create an account</Link>
          </p>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Sample accounts · Demo@1234</p>
      </div>
    </div>
  );
}
