import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  { n: 'I.', title: 'Find your tutor', body: 'Search by subject, budget, city and ratings earned from real, completed sessions.', },
  { n: 'II.', title: 'Book a real slot', body: 'Tutors publish weekly availability. The engine blocks double-bookings — on both sides.', },
  { n: 'III.', title: 'Show up & review', body: 'Reschedule with 12-hour notice, mark outcomes, and rate every completed session.', },
];

const MARQUEE = ['MATHEMATICS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'LANGUAGES', 'CS & CODING', 'MUSIC', 'TEST PREP'];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen overflow-hidden noise">
      <div className="blob h-96 w-96 bg-indigo-200/60" style={{ top: '-10rem', right: '-8rem' }} />
      <div className="blob h-72 w-72 bg-amber-100/70" style={{ bottom: '10%', left: '-6rem', animationDelay: '-7s' }} />

      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="serif text-2xl font-bold text-inkblue">Tutor<span className="italic text-brand">Slot</span></Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-brand px-6 py-2.5 text-white shadow-lg shadow-indigo-500/25">My dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-5 py-2.5 text-slate-600 hover:bg-white/70">Log in</Link>
              <Link to="/register" className="rounded-full bg-brand px-6 py-2.5 text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5">Join</Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-4">
        <section className="reveal grid items-center gap-12 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <p className="mb-5 inline-block border-b-2 border-gold pb-1 text-xs font-bold uppercase tracking-[0.25em] text-gold">The tutoring marketplace</p>
            <h1 className="serif text-5xl font-bold leading-[1.08] text-inkblue sm:text-7xl">
              Book the tutor,<br />not the <span className="shine-text italic">queue</span>.
            </h1>
            <div className="rule-grow mt-3" />
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Notice-group tutoring means double-bookings, no-shows and haggling in
              DMs. TutorSlot gives tutors structured availability and students a
              booking flow with real cancellation rules.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/tutors" className="btn-3d hover-lift rounded-full bg-brand px-8 py-4 font-semibold text-white shadow-xl shadow-indigo-400/30">Browse tutors →</Link>
              <Link to="/register" className="btn-3d glass tilt-card rounded-full px-8 py-4 font-semibold text-brand">Become a tutor</Link>
            </div>
          </div>

          {/* editorial tutor card */}
          <div className="relative">
            <div className="glass tilt-card float rounded-[2rem] p-7 shadow-2xl shadow-indigo-200/60">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                <p className="serif text-sm italic text-slate-400">This week's openings</p>
                <span className="rounded-full bg-gold-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Mon–Sat · 4–8 PM</span>
              </div>
              {[
                ['Meera Iyer', 'Mathematics', '₹600', '5.0'],
                ['Arjun Rao', 'Physics', '₹800', '4.0'],
                ['Fatima Khan', 'Chemistry', '₹700', '—'],
              ].map(([name, subj, rate, rating]) => (
                <div key={name} className="flex items-center justify-between border-b border-dashed border-indigo-100 py-4 last:border-0">
                  <div>
                    <p className="serif text-lg font-bold text-inkblue">{name}</p>
                    <p className="text-xs text-slate-400">{subj}</p>
                  </div>
                  <div className="text-right">
                    <p className="serif text-lg font-bold text-brand">{rate}<span className="text-xs font-normal text-slate-400">/hr</span></p>
                    <p className="text-xs text-amber-500">★ {rating}</p>
                  </div>
                </div>
              ))}
              <Link to="/tutors" className="mt-4 block rounded-full border border-brand/30 py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand hover:text-white">View all profiles →</Link>
            </div>
            <span className="float absolute -right-4 -top-6 rounded-full bg-gold px-4 py-2 text-xs font-bold text-white shadow-lg" style={{ animationDelay: '-2s' }}>★ verified reviews</span>
          </div>
        </section>

        <section className="reveal grid gap-5 pb-16 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="hover-lift rounded-3xl border border-amber-900/10 bg-white p-7">
              <span className="serif text-4xl font-bold text-gold/70">{s.n}</span>
              <h3 className="serif mt-2 text-xl font-bold text-inkblue">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
            </div>
          ))}
        </section>
      </main>

      <div className="relative border-y border-indigo-100 bg-white/70 py-4">
        <div className="marquee gap-8 text-xs font-bold uppercase tracking-[0.25em] text-brand/50">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-8 pr-8">
              {MARQUEE.map((t) => <span key={t} className="flex items-center gap-8">{t} <span className="text-gold">✦</span></span>)}
            </div>
          ))}
        </div>
      </div>

      <footer className="relative py-10 text-center text-sm text-slate-400">TutorSlot — sessions with a real availability engine.</footer>
    </div>
  );
}
