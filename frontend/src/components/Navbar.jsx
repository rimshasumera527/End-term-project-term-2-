import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-amber-900/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="serif text-xl font-bold text-inkblue">
          Tutor<span className="text-brand">Slot</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link to="/tutors" className="rounded-full px-3 py-2 text-slate-600 hover:text-brand">Find tutors</Link>
          {user ? (
            <>
              <Link to="/bookings" className="rounded-full px-3 py-2 text-slate-600 hover:text-brand">Sessions</Link>
              <Link to="/dashboard" className="rounded-full px-3 py-2 text-slate-600 hover:text-brand">Dashboard</Link>
              <span className="ml-2 hidden text-xs text-slate-400 sm:block">{user.name} · {user.role}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="ml-1 rounded-full border border-slate-300 px-4 py-1.5 text-slate-600 hover:border-brand hover:text-brand">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-2 text-slate-600 hover:text-brand">Log in</Link>
              <Link to="/register" className="rounded-full bg-brand px-4 py-2 text-white hover:bg-brand-dark">Join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
