import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider.jsx';

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-950 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    if (pending) return;

    const fields = new FormData(event.currentTarget);
    setPending(true);
    setError('');

    try {
      await signIn({ email: fields.get('email'), password: fields.get('password') });
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Could not sign in. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-indigo-700">AffixxMedia</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in to Client Management</h1>
        <form className="mt-6 space-y-4" onSubmit={submit} aria-busy={pending}>
          <label className="block text-sm font-medium">
            Email
            <input className={inputClass} name="email" type="email" autoComplete="username" maxLength={191} required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input className={inputClass} name="password" type="password" autoComplete="current-password" maxLength={72} required />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 font-medium text-white hover:bg-indigo-800 disabled:opacity-60" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
