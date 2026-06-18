import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Layout from './Layout.astro';

describe('Layout.astro', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render title tag with correct props', async () => {
    const result = await container.renderToString(Layout, {
      props: {
        title: 'Test Title | Savior Lab Notes',
        description: 'Test description',
      },
    });
    expect(result).toContain('<title>Test Title | Savior Lab Notes</title>');
  });

  it('should render meta description', async () => {
    const result = await container.renderToString(Layout, {
      props: { title: 'Test', description: 'Custom description' },
    });
    expect(result).toContain('meta name="description" content="Custom description"');
  });

  it('should render og:title and og:description', async () => {
    const result = await container.renderToString(Layout, {
      props: { title: 'OG Test', description: 'OG desc' },
    });
    expect(result).toContain('meta property="og:title" content="OG Test"');
    expect(result).toContain('meta property="og:description" content="OG desc"');
  });

  it('should render twitter:card meta tag', async () => {
    const result = await container.renderToString(Layout, {
      props: { title: 'TW Test' },
    });
    expect(result).toContain('meta name="twitter:card" content="summary_large_image"');
    expect(result).toContain('meta name="twitter:title" content="TW Test"');
  });

  it('should render html lang="ko"', async () => {
    const result = await container.renderToString(Layout, {
      props: { title: 'Test' },
    });
    expect(result).toContain('lang="ko"');
  });

  it('should use default description when not provided', async () => {
    const result = await container.renderToString(Layout, {
      props: { title: 'Test' },
    });
    expect(result).toContain('Notes on vibe coding and local AI workflows.');
  });
});
