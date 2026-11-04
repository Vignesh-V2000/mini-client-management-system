import { useEffect, useState } from 'react';

export function useApiData(load) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, attempt, data });
      },
      (error) => {
        if (!controller.signal.aborted) {
          setResult({ load, attempt, error: error.response?.data?.message ?? 'Could not load data.' });
        }
      },
    );
    return () => controller.abort();
  }, [load, attempt]);

  const current = result?.load === load && result.attempt === attempt ? result : null;
  return { data: current?.data, error: current?.error, retry: () => setAttempt((value) => value + 1) };
}
