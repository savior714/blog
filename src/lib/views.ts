const VIEWS_KEY = 'savior_views';

function getViews(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveViews(views: Record<string, number>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}

export function incrementView(slug: string): number {
  const views = getViews();
  views[slug] = (views[slug] || 0) + 1;
  saveViews(views);
  return views[slug];
}

export function getViews(): Record<string, number> {
  return getViews();
}
