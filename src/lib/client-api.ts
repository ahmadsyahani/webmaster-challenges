export async function api<T>(url: string, data?: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: data ? 'POST' : 'GET', cache: 'no-store', credentials: 'same-origin',
    headers: data ? { 'Content-Type': 'application/json' } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Permintaan gagal. Coba lagi.');
  return result as T;
}
