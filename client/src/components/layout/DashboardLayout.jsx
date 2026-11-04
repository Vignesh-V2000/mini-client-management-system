import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider.jsx';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSignOut() {
    setPending(true);
    setError('');
    try {
      await signOut();
    } catch {
      setError('Could not sign out. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:grid md:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="bg-slate-950 px-5 py-4 text-white md:py-7">
        <p className="font-semibold">AffixxMedia</p>
        <nav aria-label="Main navigation" className="mt-3 flex flex-wrap gap-2 md:mt-6 md:flex-col">
          <NavLink className="nav-link" to="/dashboard">Dashboard</NavLink>
          <NavLink className="nav-link" to="/clients">Clients</NavLink>
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 sm:px-8">
          <p className="text-sm text-slate-600">Signed in as {user.name}</p>
          <button className="button" onClick={handleSignOut} disabled={pending}>
            {pending ? 'Signing out…' : 'Sign out'}
          </button>
          {error && <p className="w-full text-sm text-red-700" role="alert">{error}</p>}
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
