import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from './Footer.astro';

describe('Footer.astro', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render footer element', async () => {
    const html = await container.renderToString(Footer);
    expect(html).toContain('<footer');
    expect(html).toContain('</footer>');
  });

  it('should render navigation with home link', async () => {
    const html = await container.renderToString(Footer);
    expect(html).toContain('href="/"');
    expect(html).toContain('Savior Lab Notes');
  });

  it('should render GitHub link with target="_blank"', async () => {
    const html = await container.renderToString(Footer);
    expect(html).toContain('href="https://github.com/savior714/blog"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
    expect(html).toContain('GitHub');
  });

  it('should render nav element', async () => {
    const html = await container.renderToString(Footer);
    expect(html).toContain('<nav');
    expect(html).toContain('</nav>');
  });
});
