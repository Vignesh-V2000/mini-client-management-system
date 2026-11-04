import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ClientForm } from '../components/clients/ClientForm.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { ApiState } from '../components/ui/ApiState.jsx';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider.jsx';
import { ProtectedRoute } from '../features/auth/ProtectedRoute.jsx';
import { ClientDetailsPage } from '../pages/ClientDetailsPage.jsx';
import { ClientsPage } from '../pages/ClientsPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';

function SessionRoutes() {
  const { status, restoreSession } = useAuth();

  if (status !== 'ready') {
    return (
      <main className="session-state">
        <ApiState error={status === 'error' ? 'Could not check your session.' : undefined} retry={() => restoreSession()} />
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
