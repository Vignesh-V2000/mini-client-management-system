import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ClientForm } from '../components/clients/ClientForm.jsx';
import { StatusBadge } from '../components/clients/ClientTable.jsx';
import { ApiState } from '../components/ui/ApiState.jsx';
import { deleteClient, getClient } from '../features/clients/clientApi.js';
import { useApiData } from '../hooks/useApiData.js';

export function ClientDetailsPage({ editing = false }) {
  const { id } = useParams();
  const load = useCallback((signal) => getClient(id, signal), [id]);
  const { data: client, error, retry } = useApiData(load);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    if (!window.confirm(`Delete ${client.name}? This action cannot be undone.`)) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteClient(client.id);
      navigate('/clients', { replace: true, state: { notice: 'Client deleted.' } });
    } catch (requestError) {
      setDeleteError(requestError.response?.data?.message ?? 'Could not delete the client.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Link className="text-sm font-medium text-indigo-700 hover:underline" to="/clients">Back to clients</Link>
      {!client && <ApiState error={error} retry={retry} />}
      {client && editing && <ClientForm key={client.id} client={client} />}
      {client && !editing && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="break-all text-2xl font-semibold">{client.name}</h1>
            <div className="flex gap-2">
              <Link className="button" to="edit">Edit client</Link>
              <button className="button text-red-700" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete client'}
              </button>
            </div>
          </div>
          {state?.notice && <p className="text-sm text-emerald-800" role="status">{state.notice}</p>}
          {deleteError && <p className="text-sm text-red-700" role="alert">{deleteError}</p>}
          <dl className="panel grid gap-5 p-5 sm:grid-cols-2">
            {[
              ['Company', client.company],
              ['Email', client.email],
              ['Phone', client.phone],
              ['Status', <StatusBadge status={client.status} />],
              ['Notes', client.notes],
            ].map(([label, value]) => (
              <div className={label === 'Notes' ? 'sm:col-span-2' : undefined} key={label}>
                <dt className="mb-1 text-sm font-medium text-slate-600">{label}</dt>
                <dd className="whitespace-pre-wrap break-words">{value || '—'}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </>
  );
}
