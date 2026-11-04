import { useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
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
      <div className="page-heading">
        <div><p className="eyebrow">Directory</p><h1>Clients</h1><p className="page-description">Find, organize, and update your client records.</p></div>
        <Link className="button-primary" to="/clients/new"><Plus aria-hidden="true" /> Add client</Link>
      </div>
      {state?.notice && <p className="notice notice-success" role="status">{state.notice}</p>}
      <section className="panel records-panel" aria-label="Client directory">
        <form key={JSON.stringify([search, status])} className="filter-bar" onSubmit={applyFilters} onReset={() => setParams({})}>
          <label className="form-field filter-search">
            <span>Search clients</span>
            <span className="search-field"><Search aria-hidden="true" /><input className="field" name="search" type="search" defaultValue={search} maxLength={191} placeholder="Name, company, or email" /></span>
          </label>
          <label className="form-field">
            <span>Status</span>
            <select className="field" name="status" defaultValue={status}>
              <option value="">All statuses</option>
              {Object.entries(clientStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <div className="filter-actions"><button className="button">Apply filters</button><button type="reset" className="button button-quiet">Reset</button></div>
        </form>
        {data ? (
          <>
            <ClientTable clients={data.data} caption="Clients" emptyMessage={search || status ? 'No clients match these filters. Try a different search or reset the filters.' : 'No clients on this page. Add a client or return to the first page.'} />
            <nav aria-label="Client pages" className="pagination">
              <p>{data.pagination.total} {data.pagination.total === 1 ? 'client' : 'clients'} · Page {data.pagination.page} of {Math.max(data.pagination.totalPages, 1)}</p>
              <div className="action-row">
                <button className="button" disabled={data.pagination.page <= 1} onClick={() => goToPage(Math.min(data.pagination.page - 1, Math.max(data.pagination.totalPages, 1)))}><ChevronLeft aria-hidden="true" /> Previous</button>
                <button className="button" disabled={data.pagination.page >= data.pagination.totalPages} onClick={() => goToPage(data.pagination.page + 1)}>Next <ChevronRight aria-hidden="true" /></button>
              </div>
            </nav>
          </>
        ) : <ApiState error={error} retry={retry} />}
      </section>
    </>
  );
}
