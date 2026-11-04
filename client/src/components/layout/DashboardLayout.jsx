import { useState } from 'react';
import { LayoutDashboard, LogOut, UsersRound } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthProvider.jsx';
import { Brand } from '../ui/Brand.jsx';

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const initials = user.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
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
    <div className="workspace">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="workspace-rail">
        <Brand />
        <p className="eyebrow rail-label">Workspace</p>
        <nav aria-label="Main navigation" className="workspace-nav">
          <NavLink className="nav-link" to="/dashboard"><LayoutDashboard aria-hidden="true" /> Dashboard</NavLink>
          <NavLink className="nav-link" to="/clients"><UsersRound aria-hidden="true" /> Clients</NavLink>
        </nav>
        <div className="rail-footer"><span className="rail-footer-dot" /> Client management</div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-bar">
          <p className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>{pathname.startsWith('/clients') ? 'Clients' : 'Dashboard'}</strong></p>
          <div className="account">
            <span className="account-avatar" aria-hidden="true">{initials}</span>
            <span className="account-name">{user.name}</span>
            <button className="button button-quiet" onClick={handleSignOut} disabled={pending}>
              <LogOut aria-hidden="true" /> {pending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
          {error && <p className="notice notice-error account-error" role="alert">{error}</p>}
        </header>
        <main className="workspace-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
