import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  { n: '1', title: 'Find your tutor', body: 'Search by subject, budget, city and real ratings from completed sessions.' },
  { n: '2', title: 'Book a real slot', body: 'Tutors publish weekly availability. The engine blocks double-bookings on both sides.' },
  { n: '3', title: 'Show up & review', body: 'Reschedule with 12-hour notice, mark outcomes, and rate every completed session.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="serif text-xl font-bold text-inkblue">Tutor<span className="text-brand">Slot</span></Link>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-brand px-4 py-2 text-white hover:bg-brand-dark">My dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-brand">Log in</Link>
              <Link to="/register" className="rounded-full bg-brand px-4 py-2 text-white hover:bg-brand-dark">Join</Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4">
        <section className="grid items-center gap-10 py-16 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full bg-gold-soft px-4 py-1 text-sm font-bold text-amber-700">For students &amp; tutors</p>
            <h1 className="text-5xl font-bold leading-tight text-inkblue">Book the tutor,<br />not the queue.</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Notice-group tutoring means double-bookings, no-shows and price haggling in DMs.
              TutorSlot gives tutors structured weekly availability and students a booking flow
              with real cancellation rules.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/tutors" className="rounded-full bg-brand px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-300/50 hover:bg-brand-dark">Browse tutors</Link>
              <Link to="/register" className="rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold hover:border-brand hover:text-brand">Become a tutor</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-amber-900/10 bg-white p-6 shadow-xl shadow-indigo-100">
            <p className="serif text-lg font-bold text-inkblue">This week's openings</p>
            <div className="mt-4 space-y-3">
              {[
                ['Meera Iyer', 'Mathematics', '₹600/hr', '5.0'],
                ['Arjun Rao', 'Physics', '₹800/hr', '4.0'],
                ['Fatima Khan', 'Chemistry', '₹700/hr', '—'],
              ].map(([name, subj, rate, rating]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-amber-900/5 bg-ivory px-4 py-3">
                  <div>
                    <p className="serif font-bold">{name}</p>
                    <p className="text-xs text-slate-500">{subj}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand">{rate}</p>
                    <p className="text-xs text-amber-500">★ {rating}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">Mon–Sat · 4–8 PM · demo data</p>
          </div>
        </section>

        <section className="grid gap-4 pb-20 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-amber-900/10 bg-white p-6">
              <span className="serif grid h-10 w-10 place-items-center rounded-full bg-brand text-lg font-bold text-white">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold text-inkblue">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.body}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-amber-900/10 py-6 text-center text-sm text-slate-400">
        TutorSlot — sessions with a real availability engine.
      </footer>
    </div>
  );
}
