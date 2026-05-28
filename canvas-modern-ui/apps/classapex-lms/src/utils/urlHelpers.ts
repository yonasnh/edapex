export function extractPath(url: string): string {
  if (!url) return '#';
  if (url.startsWith('/')) return url;
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}
