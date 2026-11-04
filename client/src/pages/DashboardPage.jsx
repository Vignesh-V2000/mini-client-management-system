import { ArrowRight, CircleCheck, CircleMinus, Plus, Target, UsersRound } from 'lucide-react';
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
  { label: 'Total clients', key: 'totalClients', icon: UsersRound, tone: 'accent' },
  { label: 'Active clients', key: 'activeClients', icon: CircleCheck, tone: 'active' },
  { label: 'Leads', key: 'leads', icon: Target, tone: 'lead' },
  { label: 'Inactive clients', key: 'inactiveClients', icon: CircleMinus, tone: 'inactive' },
];

function ClientBreakdown({ data }) {
  const active = data.totalClients ? data.activeClients / data.totalClients * 100 : 0;
  const leadEnd = data.totalClients ? (data.activeClients + data.leads) / data.totalClients * 100 : 0;

  return (
    <section className="panel breakdown" aria-labelledby="breakdown-title">
      <h2 id="breakdown-title">Client mix</h2>
      <p className="page-description">Clients by relationship status.</p>
      <div className="breakdown-chart" data-empty={!data.totalClients} style={{ '--active-end': `${active}%`, '--lead-end': `${leadEnd}%` }} aria-hidden="true">
        <div><strong>{data.totalClients}</strong><span>Total clients</span></div>
      </div>
      <ul className="breakdown-legend">
        {cards.slice(1).map(({ label, key, tone }) => (
          <li key={key}><span className={`legend-dot tone-${tone}`} /><span>{label}</span><strong>{data[key]}</strong></li>
        ))}
      </ul>
    </section>
  );
}

export function DashboardPage() {
  const { data, error, retry } = useApiData(loadStats);

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Overview</p><h1>Dashboard</h1><p className="page-description">Track your client relationships and see who was added recently.</p></div>
        <Link className="button-primary" to="/clients/new"><Plus aria-hidden="true" /> Add client</Link>
      </div>
      {data ? (
        <>
          <dl className="metrics">
            {cards.map(({ label, key, icon: Icon, tone }) => (
              <div className="panel metric" key={key}>
                <dt><span className={`metric-icon tone-${tone}`}><Icon aria-hidden="true" /></span>{label}</dt>
                <dd>{data[key]}</dd>
              </div>
            ))}
          </dl>
          <div className="dashboard-grid">
            <section className="panel records-panel" aria-labelledby="recent-title">
              <div className="section-heading">
                <div><h2 id="recent-title">Recent clients</h2><p className="page-description">The latest records in your workspace.</p></div>
                <Link className="text-link" to="/clients">View all <ArrowRight aria-hidden="true" /></Link>
              </div>
              <ClientTable clients={data.recentClients} caption="Recent clients" emptyMessage="Add your first client to get started." compact />
            </section>
            <ClientBreakdown data={data} />
          </div>
        </>
      ) : <ApiState error={error} retry={retry} />}
    </>
  );
}
