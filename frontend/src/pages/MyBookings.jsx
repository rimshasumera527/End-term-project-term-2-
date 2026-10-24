import { useEffect, useState } from 'react';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { StatusChip } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MyBookings() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [reviewFor, setReviewFor] = useState(null);
  const [reschedFor, setReschedFor] = useState(null);

  async function load() {
    setError('');
    try {
      setBookings((await client.get('/tutors/bookings')).data);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function cancel(b) {
    try {
      const res = await client.patch(`/tutors/bookings/${b._id}/cancel`, {});
      toast(res.data.lateCancel ? 'Cancelled — note: this was inside the 12-hour notice window' : 'Cancelled free of charge');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function outcome(b, value) {
    try {
      await client.patch(`/tutors/bookings/${b._id}/complete`, { outcome: value });
      toast(value === 'no-show' ? 'Marked as no-show' : 'Session marked completed');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-3xl px-4 py-10"><ErrorState message={error} onRetry={load} /></main></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-inkblue">Your sessions</h1>
        <p className="mt-1 text-slate-500">{user?.role === 'tutor' ? 'Mark outcomes and track your schedule.' : 'Upcoming lessons, cancellations and reviews.'}</p>

        {!bookings && <Loading label="Loading sessions…" />}
        {bookings && bookings.length === 0 && (
          <div className="mt-6">
            <Empty title="No sessions yet" hint={user?.role === 'tutor' ? 'Once students book you, sessions appear here.' : 'Find a tutor and book your first session.'} />
          </div>
        )}
        <div className="mt-6 space-y-3">
          {bookings?.map((b) => {
            const other = user.role === 'tutor' ? b.student?.name : b.tutor?.name;
            const upcoming = b.status === 'booked';
            return (
              <article key={b._id} className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-inkblue">{other}</h3>
                      <StatusChip status={b.status} />
                      {b.lateCancel && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">late cancel</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {b.start}–{b.end} · {b.subject}
                    </p>
                  </div>
                  <p className="font-bold text-brand">₹{b.price}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {upcoming && user.role === 'student' && (
                    <>
                      <button onClick={() => setReschedFor(reschedFor === b._id ? null : b._id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-brand hover:text-brand">Reschedule</button>
                      <button onClick={() => cancel(b)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600">Cancel</button>
                    </>
                  )}
                  {upcoming && user.role === 'tutor' && (
                    <>
                      <button onClick={() => outcome(b, 'completed')} className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Mark completed</button>
                      <button onClick={() => outcome(b, 'no-show')} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600">No-show</button>
                    </>
                  )}
                  {b.status === 'completed' && user.role === 'student' && (
                    <button onClick={() => setReviewFor(reviewFor === b._id ? null : b._id)} className="rounded-full bg-gold-soft px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">★ Leave a review</button>
                  )}
                </div>
                {reschedFor === b._id && (
                  <RescheduleForm booking={b} onDone={() => { setReschedFor(null); load(); }} toast={toast} />
                )}
                {reviewFor === b._id && (
                  <ReviewForm booking={b} onDone={() => { setReviewFor(null); load(); }} toast={toast} />
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function RescheduleForm({ booking, onDone, toast }) {
  const [form, setForm] = useState({ date: '', start: '', end: '' });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await client.patch(`/tutors/bookings/${booking._id}/reschedule`, form);
      toast('Session rescheduled');
      onDone();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-4 grid gap-2 rounded-xl bg-ivory p-4 sm:grid-cols-4">
      <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      <input type="time" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      <input type="time" required value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
      <button disabled={busy} className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{busy ? 'Saving…' : 'Reschedule'}</button>
    </form>
  );
}

function ReviewForm({ booking, onDone, toast }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post(`/tutors/bookings/${booking._id}/review`, { rating, comment });
      toast('Review saved — thank you!');
      onDone();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-4 rounded-xl bg-ivory p-4">
      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-amber-500' : 'text-slate-300'} aria-label={`${n} stars`}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What went well?" rows="2"
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
      <button disabled={busy} className="mt-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">{busy ? 'Saving…' : 'Submit review'}</button>
    </form>
  );
}
