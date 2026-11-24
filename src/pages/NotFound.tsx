import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center">
      <p className="font-display text-8xl font-bold text-violet-200">404</p>
      <h1 className="mt-2 text-2xl font-bold text-night-900">This page disappeared in a puff of smoke</h1>
      <p className="mt-2 text-slate-500">The link may be old, or the page was moved.</p>
      <Link to="/" className="mt-8 inline-block rounded-full bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700">
        Take me home
      </Link>
    </div>
  );
}
