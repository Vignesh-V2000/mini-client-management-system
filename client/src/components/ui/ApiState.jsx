export function ApiState({ error, retry }) {
  return error ? (
    <div className="panel p-4">
      <p className="mb-3 text-red-700" role="alert">{error}</p>
      <button className="button" onClick={retry}>Try again</button>
    </div>
  ) : <p role="status">Loading…</p>;
}
