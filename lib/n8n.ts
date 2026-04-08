export async function getN8nTemplateCount(username: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.n8n.io/api/templates/search?creator=${username}&limit=50&page=1`,
      { next: { revalidate: 3600 } } // revalidate every hour
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return Array.isArray(data.workflows) ? data.workflows.length : 0;
  } catch {
    return 0;
  }
}
