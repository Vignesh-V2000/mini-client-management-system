import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { saveClient } from '../../features/clients/clientApi.js';
import { clientStatuses } from '../../features/clients/clientStatus.js';

const fields = [
  { name: 'name', label: 'Client name', required: true, minLength: 2, maxLength: 120, autoComplete: 'name' },
  { name: 'company', label: 'Company', maxLength: 150, autoComplete: 'organization' },
  { name: 'email', label: 'Email', type: 'email', maxLength: 191, autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 30, autoComplete: 'tel' },
];

export function ClientForm({ client }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const cancel = client ? `/clients/${client.id}` : '/clients';
  const fieldError = (name) => error?.errors?.[name];
  const fieldValidation = (name) => ({
    'aria-invalid': Boolean(fieldError(name)),
    'aria-describedby': fieldError(name) ? `error-${name}` : undefined,
  });
  const fieldFeedback = (name) => fieldError(name) && <span id={`error-${name}`} className="field-error">{fieldError(name)}</span>;

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setError(null);
    try {
      const saved = await saveClient(client?.id, values);
      navigate(`/clients/${saved.id}`, {
        replace: true,
        state: { notice: client ? 'Client updated.' : 'Client added.' },
      });
    } catch (requestError) {
      setError(requestError.response?.data ?? { message: 'Could not save the client.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Link className="text-link back-link" to={cancel}><ArrowLeft aria-hidden="true" /> {client ? 'Back to client' : 'Back to clients'}</Link>
      <div className="page-heading"><div><h1>{client ? 'Edit client' : 'Add client'}</h1><p className="page-description">{client ? `Update the record for ${client.name}.` : 'Create a record to keep track of a new client or lead.'}</p></div></div>
      <form className="panel client-form" onSubmit={submit} aria-busy={pending} aria-labelledby="client-form-title">
        <div className="section-heading"><div><h2 id="client-form-title">Client information</h2><p className="page-description">Only the client name is required.</p></div></div>
        {error && <p className="notice notice-error form-notice" role="alert">{error.message}</p>}
        <fieldset disabled={pending} className="form-grid">
          {fields.map(({ label, name, ...attributes }) => (
            <label className="form-field" key={name}>
              <span>{label}{attributes.required && <span className="required-mark" aria-hidden="true"> *</span>}</span>
              <input className="field" name={name} defaultValue={client?.[name] ?? ''} {...attributes} {...fieldValidation(name)} />
              {fieldFeedback(name)}
            </label>
          ))}
          <label className="form-field">
            <span>Status</span>
            <select className="field" name="status" defaultValue={client?.status ?? 'LEAD'} {...fieldValidation('status')}>
              {Object.entries(clientStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {fieldFeedback('status')}
          </label>
          <label className="form-field form-wide">
            <span>Notes</span>
            <textarea className="field" name="notes" rows={4} maxLength={5000} defaultValue={client?.notes ?? ''} {...fieldValidation('notes')} />
            {fieldFeedback('notes')}
          </label>
          <div className="form-actions form-wide action-row">
            {pending ? <span className="button" aria-disabled="true">Cancel</span> : <Link to={cancel} className="button">Cancel</Link>}
            <button className="button-primary"><Check aria-hidden="true" /> {pending ? 'Saving…' : 'Save client'}</button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
