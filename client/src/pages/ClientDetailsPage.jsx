import { useCallback, useRef, useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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
  const dialog = useRef(null);

  async function handleDelete() {
    if (deleting) return;
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
      {!editing && <Link className="text-link back-link" to="/clients"><ArrowLeft aria-hidden="true" /> Back to clients</Link>}
      {!client && <ApiState error={error} retry={retry} />}
      {client && editing && <ClientForm key={client.id} client={client} />}
      {client && !editing && (
        <>
          <div className="page-heading">
            <div><p className="eyebrow">Client record</p><h1>{client.name}</h1>{client.company && <p className="page-description">{client.company}</p>}</div>
            <div className="action-row">
              <button className="button button-delete" onClick={() => { setDeleteError(''); dialog.current.showModal(); }}>
                <Trash2 aria-hidden="true" /> Delete client
              </button>
              <Link className="button-primary" to="edit"><Pencil aria-hidden="true" /> Edit client</Link>
            </div>
          </div>
          {state?.notice && <p className="notice notice-success" role="status">{state.notice}</p>}
          <section className="panel details-panel" aria-labelledby="details-title">
            <div className="section-heading"><h2 id="details-title">Client information</h2><StatusBadge status={client.status} /></div>
            <dl className="details-grid">
              {[
                ['Company', client.company],
                ['Email', client.email],
                ['Phone', client.phone],
                ['Notes', client.notes],
              ].map(([label, value]) => (
                <div className={label === 'Notes' ? 'form-wide' : undefined} key={label}>
                  <dt>{label}</dt>
                  <dd>{value || <span className="page-description">{label === 'Notes' ? 'No notes yet' : 'Not provided'}</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
          <dialog ref={dialog} className="confirm-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={(event) => { if (deleting) event.preventDefault(); }}>
            <div className="dialog-body">
              <span className="delete-icon"><Trash2 aria-hidden="true" /></span>
              <h2 id="delete-title">Delete client?</h2>
              <p id="delete-description">This will permanently remove <strong>{client.name}</strong> and their notes.</p>
              {deleteError && <p className="notice notice-error" role="alert">{deleteError}</p>}
              <div className="action-row">
                <button className="button" autoFocus disabled={deleting} onClick={() => dialog.current.close()}>Cancel</button>
                <button className="button-danger" disabled={deleting} onClick={handleDelete}>{deleting ? 'Deleting…' : 'Delete client'}</button>
              </div>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
