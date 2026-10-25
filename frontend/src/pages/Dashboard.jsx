import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, ErrorState } from '../components/states.jsx';
import { Stars, StatusChip } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SceneBackground from '../components/SceneBackground.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const isTutor = user?.role === 'tutor';

  useEffect(() => {
    const url = isTutor ? '/tutors/dashboard/tutor' : '/tutors/dashboard/student';
    Promise.all([client.get(url), client.get('/tutors/stats/me')])
      .then(([r, s]) => { setData(r.data); setStats(s.data); })
      .catch((err) => setError(err.message));
  }, [isTutor]);

  if (error) return <div className="relative min-h-screen"><Navbar />
      <SceneBackground /><main className="relative mx-auto max-w-4xl px-4 py-10"><ErrorState message={error} /></main></div>;

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-inkblue">{isTutor ? 'Tutor dashboard' : 'Your learning dashboard'}</h1>
          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5102/api'}/tutors/calendar.ics`} target="_blank" rel="noreferrer"
            className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold hover:border-brand hover:text-brand">📅 Add to calendar (.ics)</a>
        </div>
        {stats && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              ['Sessions', stats.totalSessions],
              [isTutor ? 'Hours taught' : 'Hours learned', stats.hours],
              [isTutor ? 'Earned' : 'Spent', `₹${stats.totalSpendOrEarn.toLocaleString('en-IN')}`],
              ['Cancellations', stats.cancelled],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-amber-900/10 bg-white p-4">
                <p className="text-xs font-bold uppercase text-slate-400">{l}</p>
                <p className="text-xl font-bold text-inkblue">{v}</p>
              </div>
            ))}
          </div>
        )}
        {!data && <Loading label="Crunching your numbers…" />}

        {data && isTutor && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[
                ['Earnings', `₹${data.stats.earnings.toLocaleString('en-IN')}`],
                ['Completed sessions', data.stats.completedSessions],
                ['Late cancellations', data.stats.lateCancellations],
                ['Rating', data.stats.rating || '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-amber-900/10 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-inkblue">{value}</p>
                </div>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-bold text-inkblue">Upcoming sessions</h2>
            {data.upcoming.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">Nothing booked yet — share your profile so students can find you.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.upcoming.map((b) => (
                  <li key={b._id} className="flex items-center justify-between rounded-2xl border border-amber-900/10 bg-white px-5 py-3">
                    <span><strong>{b.student?.name}</strong> · {b.subject}</span>
                    <span className="text-sm text-slate-500">{new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} {b.start}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/bookings" className="mt-4 inline-block rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold hover:border-brand hover:text-brand">Manage all sessions →</Link>
          </>
        )}

        {data && !isTutor && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-900/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Upcoming sessions</p>
                <p className="mt-1 text-2xl font-bold text-inkblue">{data.upcoming.length}</p>
              </div>
              <div className="rounded-2xl border border-amber-900/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Reviews written</p>
                <p className="mt-1 text-2xl font-bold text-inkblue">{data.reviewsGiven}</p>
              </div>
            </div>
            <h2 className="mt-8 text-xl font-bold text-inkblue">Next up</h2>
            {data.upcoming.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">Nothing booked — <Link to="/tutors" className="font-semibold text-brand hover:underline">find a tutor</Link>.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {data.upcoming.map((b) => (
                  <li key={b._id} className="flex items-center justify-between rounded-2xl border border-amber-900/10 bg-white px-5 py-3">
                    <span><strong>{b.tutor?.name}</strong> <Stars value={b.tutor?.rating} className="ml-1 text-xs" /></span>
                    <span className="text-sm text-slate-500">{new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} {b.start}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}
