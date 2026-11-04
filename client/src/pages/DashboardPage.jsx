import { Link } from 'react-router-dom';
import { ClientTable } from '../components/clients/ClientTable.jsx';
import { ApiState } from '../components/ui/ApiState.jsx';
import { useApiData } from '../hooks/useApiData.js';
import { api } from '../lib/api.js';

async function loadStats(signal) {
  const { data } = await api.get('/dashboard/stats', { signal });
  return data;
}

const cards = [
  ['Total clients', 'totalClients'],
  ['Active clients', 'activeClients'],
  ['Leads', 'leads'],
  ['Inactive clients', 'inactiveClients'],
];

export function DashboardPage() {
  const { data, error, retry } = useApiData(loadStats);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link className="button-primary" to="/clients/new">Add client</Link>
      </div>
      {data ? (
        <>
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, key]) => (
              <div className="panel p-5" key={key}>
                <dt className="text-sm font-medium text-slate-600">{label}</dt>
                <dd className="mt-2 text-3xl font-semibold">{data[key]}</dd>
              </div>
            ))}
          </dl>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Recent clients</h2>
              <Link className="text-sm font-medium text-indigo-700 hover:underline" to="/clients">View all clients</Link>
            </div>
            <ClientTable clients={data.recentClients} caption="Recent clients" emptyMessage="Add your first client to get started." />
          </section>
        </>
      ) : <ApiState error={error} retry={retry} />}
    </>
  );
}
