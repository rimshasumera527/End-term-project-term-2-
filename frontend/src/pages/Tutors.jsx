import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { Loading, Empty, ErrorState } from '../components/states.jsx';
import { Stars, Chip } from '../components/ui.jsx';
import SceneBackground from '../components/SceneBackground.jsx';

export default function Tutors() {
  const [tutors, setTutors] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ subject: '', maxPrice: '', minRating: '', city: '' });

  async function load(f = filters) {
    setError('');
    try {
      const qs = Object.entries(f).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      setTutors((await client.get(`/tutors${qs ? `?${qs}` : ''}`)).data);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <SceneBackground />
      <main className="relative mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold text-inkblue">Find your tutor</h1>
        <p className="mt-1 text-slate-500">Search by subject, budget and rating — every profile shows real session history.</p>

        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="mt-6 grid gap-3 rounded-3xl border border-amber-900/10 bg-white p-4 shadow-sm sm:grid-cols-5">
          <input value={filters.subject} onChange={set('subject')} placeholder="Subject e.g. physics" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <input value={filters.maxPrice} onChange={set('maxPrice')} type="number" placeholder="Max ₹/hr" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <input value={filters.minRating} onChange={set('minRating')} type="number" min="1" max="5" step="0.5" placeholder="Min rating" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <input value={filters.city} onChange={set('city')} placeholder="City" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand" />
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Search</button>
        </form>

        <div className="mt-8">
          {error && <ErrorState message={error} onRetry={() => load()} />}
          {!error && tutors === null && <Loading label="Searching tutors…" />}
          {!error && tutors !== null && tutors.length === 0 && (
            <Empty title="No tutors match those filters" hint="Try widening the price range or clearing the subject filter." />
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tutors?.map((t) => (
              <Link key={t._id} to={`/tutors/${t._id}`} className="group rounded-3xl border border-amber-900/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="serif text-xl font-bold text-inkblue group-hover:text-brand">{t.name}</h3>
                    <p className="text-xs text-slate-400">{t.city || 'India'}</p>
                  </div>
                  <span className="serif rounded-full bg-gold-soft px-3 py-1 text-sm font-bold text-amber-700">₹{t.hourlyRate}<span className="text-[10px] font-medium">/hr</span></span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.subjects.map((s) => <Chip key={s} tone="brand">{s}</Chip>)}
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500">{t.bio || 'No bio yet.'}</p>
                <div className="mt-4 flex items-center justify-between border-t border-amber-900/5 pt-3 text-sm">
                  <Stars value={t.rating} />
                  <span className="text-xs text-slate-400">{t.ratingCount} review{t.ratingCount === 1 ? '' : 's'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
