import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Page from './index.astro';

describe('case/index.astro', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('should render SSR with cases-list placeholder', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('id="cases-list"');
    expect(html).toContain('loading');
    expect(html).toContain('로딩 중...');
  });

  it('should render inline script for client-side fetch', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('fetch(\'/api/cases.json\')');
    expect(html).toContain('case-card');
  });

  it('should render inline script with empty-case message', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('등록된 사례가 없습니다');
  });

  it('should render inline script with error message', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('사례를 불러오지 못했습니다');
  });

  it('should render Cases page structure', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('Case Studies');
    expect(html).toContain('Cases | Savior Lab Notes');
    expect(html).toContain('admin-page');
    expect(html).toContain('cases-grid');
  });

  it('should render admin navigation', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('admin-nav');
    expect(html).toContain('href="/case"');
    expect(html).toContain('href="/editor"');
  });

  it('should have correct page title', async () => {
    const html = await container.renderToString(Page);
    expect(html).toContain('<title>Cases | Savior Lab Notes</title>');
  });
});
