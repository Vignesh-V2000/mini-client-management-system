import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ClientForm } from '../components/clients/ClientForm.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { ClientDetailsPage } from '../pages/ClientDetailsPage.jsx';
import { ClientsPage } from '../pages/ClientsPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';

function SessionRoutes() {
  const { status, restoreSession } = useAuth();

  if (status === 'loading') {
    return <p className="p-6 text-slate-700" role="status">Checking your session…</p>;
  }

  if (status === 'error') {
    return (
      <main className="space-y-3 p-6">
        <p role="alert">Could not check your session.</p>
        <button className="rounded-lg bg-indigo-700 px-4 py-2 text-white" onClick={() => restoreSession()}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetailsPage key="details" />} />
          <Route path="/clients/:id/edit" element={<ClientDetailsPage key="edit" editing />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
