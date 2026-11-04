import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Brand } from '../components/ui/Brand.jsx';
import { useAuth } from '../features/auth/AuthProvider.jsx';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="login-layout">
      <aside className="login-stage" aria-label="AffixxMedia client workspace">
        <Brand />
        <div className="login-stage-copy">
          <p className="eyebrow">Client management</p>
          <p className="login-display">Every client.<br />{' '}One workspace.</p>
          <p>Keep contact details, leads, and account notes together.</p>
        </div>
        <svg className="login-graphic" viewBox="0 0 520 390" fill="none" aria-hidden="true">
          <g stroke="currentColor">
            <circle cx="270" cy="200" r="132" /><circle cx="356" cy="200" r="132" />
            <circle cx="313" cy="200" r="188" strokeDasharray="3 9" />
            <path d="M64 200h440M313 12v376" strokeDasharray="4 8" />
            <path d="M138 200h86l89-125 91 125h84" strokeWidth="2" />
          </g>
          <g fill="currentColor"><circle cx="138" cy="200" r="5" /><circle cx="313" cy="75" r="7" /><circle cx="404" cy="200" r="5" /></g>
        </svg>
      </aside>
      <section className="login-entry" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <span className="login-lock"><LockKeyhole size={22} aria-hidden="true" /></span>
          <h1 id="login-title">Sign in</h1>
          <p className="page-description">Use your account to open the client workspace.</p>
          <form className="login-form" onSubmit={submit} aria-busy={pending}>
            <label className="form-field">
              <span>Email address</span>
              <input className="field" name="email" type="email" autoComplete="username" maxLength={191} required />
            </label>
            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input className="field" id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={72} required />
                <button type="button" className="icon-button password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
            </div>
            {error && <p className="notice notice-error" role="alert">{error}</p>}
            <button className="button-primary login-submit" disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'} <ArrowRight aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
