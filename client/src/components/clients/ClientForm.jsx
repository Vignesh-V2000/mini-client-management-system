import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { saveClient } from '../../features/clients/clientApi.js';
import { clientStatuses } from '../../features/clients/clientStatus.js';

const fields = [
  { name: 'name', label: 'Client name', required: true, minLength: 2, maxLength: 120 },
  { name: 'company', label: 'Company', maxLength: 150 },
  { name: 'email', label: 'Email', type: 'email', maxLength: 191 },
  { name: 'phone', label: 'Phone', type: 'tel', maxLength: 30 },
];

export function ClientForm({ client }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const cancel = client ? `/clients/${client.id}` : '/clients';

  async function submit(event) {
    event.preventDefault();
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
      <h1 className="text-2xl font-semibold">{client ? 'Edit client' : 'Add client'}</h1>
      <form className="panel max-w-2xl p-5 sm:p-6" onSubmit={submit} aria-busy={pending}>
        {error && <p className="mb-4 text-sm text-red-700" role="alert">{error.message}</p>}
        <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
          {fields.map(({ label, name, ...attributes }) => (
            <label className="space-y-1 text-sm font-medium" key={name}>
              <span>{label}{attributes.required && ' (required)'}</span>
              <input className="field" name={name} defaultValue={client?.[name] ?? ''} {...attributes}
                aria-invalid={Boolean(error?.errors?.[name])}
                aria-describedby={error?.errors?.[name] ? `error-${name}` : undefined} />
              {error?.errors?.[name] && <span id={`error-${name}`} className="block text-red-700">{error.errors[name]}</span>}
            </label>
          ))}
          <label className="space-y-1 text-sm font-medium">
            <span>Status</span>
            <select className="field" name="status" defaultValue={client?.status ?? 'LEAD'}>
              {Object.entries(clientStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium sm:col-span-2">
            <span>Notes</span>
            <textarea className="field" name="notes" rows={4} maxLength={5000} defaultValue={client?.notes ?? ''} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button className="button-primary">{pending ? 'Saving…' : 'Save client'}</button>
            <Link to={cancel} className="button">Cancel</Link>
          </div>
        </fieldset>
      </form>
    </>
  );
}
