import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { Stars, Chip } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function slotsFor(availability, weekday) {
  const list = [];
  for (const s of availability.filter((a) => a.weekday === weekday)) {
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    for (let t = sh * 60 + sm; t + 60 <= eh * 60 + em; t += 60) {
      list.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`);
    }
  }
  return list;
}

export default function TutorDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    client.get(`/tutors/${id}`).then((r) => setTutor(r.data)).catch((err) => setError(err.message));
  }, [id]);

  async function book() {
    if (!user) { toast('Log in to book a session', 'info'); navigate('/login'); return; }
    if (user.role !== 'student') { toast('Only students can book sessions', 'error'); return; }
    setBusy(true);
    try {
      await client.post('/tutors/bookings', { tutor: id, date, start: slot, end: addHour(slot) });
      toast(`Session booked: ${WEEKDAYS[new Date(date).getDay()]} at ${slot}`);
      navigate('/bookings');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} onRetry={() => window.location.reload()} /></main></div>;
  if (!tutor) return <div className="min-h-screen"><Navbar /><Loading label="Loading profile…" /></div>;

  const weekday = date ? new Date(`${date}T00:00:00`).getDay() : null;
  const slots = weekday === null ? [] : slotsFor(tutor.availability, weekday);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/tutors" className="text-sm font-semibold text-slate-400 hover:text-brand">← All tutors</Link>
        <div className="mt-4 rounded-3xl border border-amber-900/10 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="serif text-3xl font-bold text-inkblue">{tutor.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{tutor.city || 'India'} · joined {new Date(tutor.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Stars value={tutor.rating} />
                <span className="text-slate-400">{tutor.rating || 'No ratings yet'} {tutor.ratingCount ? `(${tutor.ratingCount})` : ''}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="serif text-3xl font-bold text-brand">₹{tutor.hourlyRate}</p>
              <p className="text-xs text-slate-400">per hour</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">{tutor.subjects.map((s) => <Chip key={s} tone="brand">{s}</Chip>)}</div>
          <p className="mt-4 leading-relaxed text-slate-600">{tutor.bio}</p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-amber-900/10 bg-white p-6">
            <h2 className="serif text-xl font-bold text-inkblue">Weekly availability</h2>
            {tutor.availability.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">This tutor hasn't published availability yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {WEEKDAYS.map((day, wd) => {
                  const daySlots = tutor.availability.filter((a) => a.weekday === wd);
                  if (!daySlots.length) return null;
                  return (
                    <li key={day} className="flex justify-between rounded-xl bg-ivory px-4 py-2">
                      <span className="font-semibold">{day}</span>
                      <span className="text-slate-500">{daySlots.map((s) => `${s.start}–${s.end}`).join(', ')}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-amber-900/10 bg-white p-6">
            <h2 className="serif text-xl font-bold text-inkblue">Book a session</h2>
            <label className="mt-3 block"><span className="text-sm font-semibold">Pick a date</span>
              <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setSlot(null); }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand" /></label>
            {date && slots.length === 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">No availability on that day — pick another date.</p>
            )}
            {slots.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button key={s} onClick={() => setSlot(s)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${slot === s ? 'bg-brand text-white' : 'bg-indigo-50 text-brand hover:bg-indigo-100'}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <button onClick={book} disabled={!slot || busy}
              className="mt-5 w-full rounded-xl bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-40">
              {busy ? 'Booking…' : slot ? `Book ${date} at ${slot} — ₹${tutor.hourlyRate}` : 'Pick a slot to book'}
            </button>
            <p className="mt-2 text-center text-xs text-slate-400">Free cancellation up to 12 hours before start.</p>
          </section>
        </div>
      </main>
    </div>
  );
}

function addHour(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
