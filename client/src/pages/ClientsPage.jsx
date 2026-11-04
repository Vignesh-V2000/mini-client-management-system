import { useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ClientTable } from '../components/clients/ClientTable.jsx';
import { ApiState } from '../components/ui/ApiState.jsx';
import { listClients } from '../features/clients/clientApi.js';
import { clientStatuses } from '../features/clients/clientStatus.js';
import { useApiData } from '../hooks/useApiData.js';

export function ClientsPage() {
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const search = params.get('search') ?? '';
  const status = params.get('status') ?? '';
  const page = params.get('page') ?? '1';
  const load = useCallback((signal) => listClients({ page, search, status: status || undefined }, signal), [page, search, status]);
  const { data, error, retry } = useApiData(load);

  function applyFilters(event) {
    event.preventDefault();
    const filters = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const query = filters.get('search').trim();
    if (query) next.set('search', query);
    if (filters.get('status')) next.set('status', filters.get('status'));
    setParams(next);
  }

  function goToPage(nextPage) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link className="button-primary" to="/clients/new">Add client</Link>
      </div>
      {state?.notice && <p className="text-sm text-emerald-800" role="status">{state.notice}</p>}
      <form key={JSON.stringify([search, status])} className="panel flex flex-wrap items-end gap-3 p-4" onSubmit={applyFilters}>
        <label className="min-w-0 flex-[1_1_15rem] space-y-1 text-sm font-medium">
          <span>Search clients</span>
          <input className="field" name="search" defaultValue={search} maxLength={191} placeholder="Name, company, or email" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Status</span>
          <select className="field" name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {Object.entries(clientStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="button">Apply filters</button>
        <Link className="button" to="/clients">Reset</Link>
      </form>
      {data ? (
        <>
          <ClientTable clients={data.data} caption="Clients" emptyMessage="No clients match this page or filter." />
          <nav aria-label="Client pages" className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{data.pagination.total} clients · Page {data.pagination.page} of {Math.max(data.pagination.totalPages, 1)}</p>
            <div className="flex gap-2">
              <button className="button" disabled={data.pagination.page <= 1} onClick={() => goToPage(Math.min(data.pagination.page - 1, Math.max(data.pagination.totalPages, 1)))}>Previous</button>
              <button className="button" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => goToPage(data.pagination.page + 1)}>Next</button>
            </div>
          </nav>
        </>
      ) : <ApiState error={error} retry={retry} />}
    </>
  );
}
