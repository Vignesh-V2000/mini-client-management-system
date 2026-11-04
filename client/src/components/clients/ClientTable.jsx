import { Link } from 'react-router-dom';
import { clientStatuses } from '../../features/clients/clientStatus.js';

const badgeClasses = {
  LEAD: 'bg-amber-100 text-amber-900',
  ACTIVE: 'bg-emerald-100 text-emerald-900',
  INACTIVE: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ status }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[status]}`}>{clientStatuses[status]}</span>;
}

export function ClientTable({ clients, caption, emptyMessage }) {
  if (!clients.length) return <p className="panel p-5 text-slate-600">{emptyMessage}</p>;

  return (
    <div className="panel overflow-x-auto" tabIndex={0} role="region" aria-label={caption}>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-100 text-slate-700">
          <tr>{['Name', 'Company', 'Email', 'Status', 'Actions'].map((label) => (
            <th className="px-4 py-3" key={label} scope="col">{label}</th>
          ))}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <th scope="row" className="px-4 py-3 font-medium">
                <Link className="text-indigo-700 hover:underline" to={`/clients/${client.id}`}>{client.name}</Link>
              </th>
              <td className="px-4 py-3">{client.company || '—'}</td>
              <td className="px-4 py-3">{client.email || '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
              <td className="px-4 py-3">
                <Link className="text-indigo-700 hover:underline" to={`/clients/${client.id}/edit`} aria-label={`Edit ${client.name}`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
