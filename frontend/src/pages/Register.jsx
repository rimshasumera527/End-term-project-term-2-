import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', subjects: '', hourlyRate: '', bio: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    if (form.name.trim().length < 2) return 'Enter your name (2+ characters).';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      return 'Password needs 8+ characters with a letter and a number.';
    if (role === 'tutor') {
      if (!form.subjects.trim()) return 'List at least one subject you teach.';
      if (!form.hourlyRate || Number(form.hourlyRate) < 0) return 'Set your hourly rate.';
    }
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate();
    setError(v);
    if (v) return;
    setBusy(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password, role, city: form.city.trim() };
      if (role === 'tutor') {
        payload.subjects = form.subjects.split(',').map((s) => s.trim()).filter(Boolean);
        payload.hourlyRate = Number(form.hourlyRate);
        payload.bio = form.bio.trim();
      }
      await register(payload);
      toast(`Welcome to TutorSlot — you're in as a ${role}!`);
      navigate(role === 'tutor' ? '/dashboard' : '/tutors');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="serif text-3xl font-bold text-inkblue">Join TutorSlot</h1>
          <p className="mt-1 text-sm text-slate-500">Learn from tutors, or teach on your schedule</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-amber-900/10 bg-white p-7 shadow-lg shadow-indigo-100">
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            {[['student', "I'm a student"], ['tutor', "I'm a tutor"]].map(([r, label]) => (
              <button type="button" key={r} onClick={() => setRole(r)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${role === r ? 'border-brand bg-indigo-50 text-brand' : 'border-slate-200 text-slate-500'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="text-sm font-semibold">Name</span>
              <input value={form.name} onChange={set('name')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
            <label className="block"><span className="text-sm font-semibold">City</span>
              <input value={form.city} onChange={set('city')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
          </div>
          <label className="block"><span className="text-sm font-semibold">Email</span>
            <input type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-semibold">Password</span>
            <input type="password" value={form.password} onChange={set('password')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
          {role === 'tutor' && (
            <>
              <label className="block"><span className="text-sm font-semibold">Subjects (comma-separated)</span>
                <input value={form.subjects} onChange={set('subjects')} placeholder="mathematics, physics" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-sm font-semibold">Rate (₹/hr)</span>
                  <input type="number" value={form.hourlyRate} onChange={set('hourlyRate')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
                <label className="block"><span className="text-sm font-semibold">Short bio</span>
                  <input value={form.bio} onChange={set('bio')} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
              </div>
            </>
          )}
          <button disabled={busy} className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {busy ? 'Creating…' : `Create ${role} account`}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
