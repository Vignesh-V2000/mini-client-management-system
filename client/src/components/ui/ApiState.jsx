import { CircleAlert, LoaderCircle } from 'lucide-react';

export function ApiState({ error, retry }) {
  return error ? (
    <div className="state-block">
      <p className="notice notice-error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>
      <button className="button" onClick={retry}>Try again</button>
    </div>
  ) : <p className="state-block loading-state" role="status"><LoaderCircle aria-hidden="true" /> Loading…</p>;
}
