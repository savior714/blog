import { beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  // Mock fetch — returns empty array by default
  globalThis.fetch = vi.fn().mockImplementation(async (_url: string | URL | Request) => ({
    json: () => Promise.resolve([]),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    headers: new Headers(),
  })) as typeof fetch;

  // Inject CSS variables so getComputedStyle returns concrete values
  const style = document.createElement('style');
  style.setAttribute('data-vitest', 'true');
  style.textContent = `
    :root {
      --accent: #4a72e8;
      --foreground: #21304d;
      --muted: #627395;
      --line: #dbe4f6;
      --card: #ffffff;
      --background: #f7f9ff;
    }
  `;
  document.head.appendChild(style);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  document.head.querySelectorAll('style[data-vitest]').forEach((s) => s.remove());
});
