import { ArrowUpRight, Pencil, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clientStatuses } from '../../features/clients/clientStatus.js';

export function StatusBadge({ status }) {
  return <span className={`status-badge tone-${status.toLowerCase()}`}>{clientStatuses[status]}</span>;
}

export function ClientTable({ clients, caption, emptyMessage, compact = false }) {
  if (!clients.length) return <div className="empty-state"><UsersRound aria-hidden="true" /><p>{emptyMessage}</p></div>;

  return (
    <div className="records-wrap">
      <table className="records-table" role="table">
        <caption className="sr-only">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row">{(compact ? ['Client', 'Status', 'Actions'] : ['Client', 'Email', 'Status', 'Actions']).map((label) => (
            <th key={label} scope="col" role="columnheader">{label}</th>
          ))}</tr>
        </thead>
        <tbody role="rowgroup">
          {clients.map((client) => (
            <tr key={client.id} role="row">
              <th scope="row" role="rowheader" className="record-name">
                <Link className="record-person" to={`/clients/${client.id}`}>
                  <span className="record-avatar" aria-hidden="true">{client.name.trim().slice(0, 1).toUpperCase()}</span>
                  <span><strong>{client.name}</strong>{client.company && <small>{client.company}</small>}</span>
                </Link>
              </th>
              {!compact && <td role="cell" className="record-email">{client.email || 'No email'}</td>}
              <td role="cell" className="record-status"><StatusBadge status={client.status} /></td>
              <td role="cell" className="record-action">
                <Link className="icon-button" to={`/clients/${client.id}${compact ? '' : '/edit'}`} aria-label={`${compact ? 'View' : 'Edit'} ${client.name}`}>
                  {compact ? <ArrowUpRight aria-hidden="true" /> : <Pencil aria-hidden="true" />}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
