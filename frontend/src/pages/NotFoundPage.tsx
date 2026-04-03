import { Link } from "react-router-dom";

export default function NotFoundPage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-bold text-ocean">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold">Route not found</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link to="/dashboard" className="mt-6 rounded-xl bg-ink px-4 py-2 font-semibold text-white">
        Back to dashboard
      </Link>
    </div>
  );
}
