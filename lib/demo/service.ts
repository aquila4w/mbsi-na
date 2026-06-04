const API_BASE = '/api/demo';

export async function seedDemoData(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/seed`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to seed demo data');
  }

  return data;
}

export async function cleanupDemoData(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/cleanup`, { method: 'POST' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to cleanup demo data');
  }

  return data;
}
