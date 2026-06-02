export async function sendMonitoringLog(event: string, payload: any) {
  try {
    // Always emit to console for local debugging
    console.debug('Monitoring log', event, payload);

    const url = import.meta.env.VITE_MONITORING_URL;
    if (!url) return;

    // Do not block the main flow — fire-and-forget
    try {
      await fetch(url.replace(/\/$/, '') + '/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload, ts: new Date().toISOString() }),
      });
    } catch (err) {
      console.debug('Failed to send monitoring log', err);
    }
  } catch (err) {
    console.debug('sendMonitoringLog error', err);
  }
}
