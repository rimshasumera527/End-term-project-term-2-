import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="serif text-7xl font-bold text-brand">404</p>
      <h1 className="serif text-xl font-bold text-inkblue">This page skipped class</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white hover:bg-brand-dark">Back to safety</Link>
    </div>
  );
}
