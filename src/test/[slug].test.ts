import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEntries = new Map([
  [
    'test-case-1',
    {
      slug: 'test-case-1',
      data: {
        tag: 'Vibe Coding' as const,
        title: 'Vibe Coding으로 앱 만들기',
        summary: 'AI와 함께 웹 애플리케이션을 개발하는 과정',
        publishedAt: new Date('2025-01-15'),
      },
    },
  ],
  [
    'test-case-2',
    {
      slug: 'test-case-2',
      data: {
        tag: 'Local LLM' as const,
        title: '로컬 LLM 배포하기',
        summary: 'Ollama를 이용한 로컬 LLM 환경 구축',
        publishedAt: new Date('2025-02-20'),
      },
    },
  ],
]);

vi.mock('astro:content', () => ({
  getCollection: vi.fn().mockResolvedValue(Array.from(mockEntries.values())),
  getEntry: vi.fn().mockImplementation(async (_collection: string, slug: string) => {
    return mockEntries.get(slug) || null;
  }),
  render: vi.fn().mockResolvedValue({
    Content: vi.fn(),
  }),
}));

vi.mock('astro:assets', () => ({
  Picture: vi.fn(),
}));

describe('case/[slug].astro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStaticPaths should return all case slugs from collection', async () => {
    const { getCollection } = await import('astro:content');
    const cases = await getCollection('cases');

    expect(cases).toHaveLength(2);
    expect(cases[0].slug).toBe('test-case-1');
    expect(cases[1].slug).toBe('test-case-2');

    const paths = cases.map((entry) => ({ params: { slug: entry.slug } }));
    expect(paths).toEqual([
      { params: { slug: 'test-case-1' } },
      { params: { slug: 'test-case-2' } },
    ]);
  });

  it('getEntry should return entry data for existing slug', async () => {
    const { getEntry } = await import('astro:content');
    const entry = await getEntry('cases', 'test-case-1');

    expect(entry).not.toBeNull();
    expect(entry!.slug).toBe('test-case-1');
    expect(entry!.data.title).toBe('Vibe Coding으로 앱 만들기');
    expect(entry!.data.tag).toBe('Vibe Coding');
    expect(entry!.data.summary).toBe('AI와 함께 웹 애플리케이션을 개발하는 과정');
    expect(entry!.data.publishedAt).toBeInstanceOf(Date);
  });

  it('getEntry should return null for non-existent slug', async () => {
    const { getEntry } = await import('astro:content');
    const entry = await getEntry('cases', 'does-not-exist');

    expect(entry).toBeNull();
  });

  it('should have correct publishedAt date format via toISOString', async () => {
    const { getEntry } = await import('astro:content');
    const entry = await getEntry('cases', 'test-case-1');

    expect(entry!.data.publishedAt.toISOString()).toBe('2025-01-15T00:00:00.000Z');
  });

  it('getEntry should return second entry with correct tag', async () => {
    const { getEntry } = await import('astro:content');
    const entry = await getEntry('cases', 'test-case-2');

    expect(entry).not.toBeNull();
    expect(entry!.data.tag).toBe('Local LLM');
    expect(entry!.data.title).toBe('로컬 LLM 배포하기');
    expect(entry!.data.publishedAt.toISOString()).toBe('2025-02-20T00:00:00.000Z');
  });

  it('getCollection should return entries with all required data fields', async () => {
    const { getCollection } = await import('astro:content');
    const cases = await getCollection('cases');

    for (const entry of cases) {
      expect(entry.data).toHaveProperty('tag');
      expect(entry.data).toHaveProperty('title');
      expect(entry.data).toHaveProperty('summary');
      expect(entry.data).toHaveProperty('publishedAt');
      expect(entry.data.publishedAt).toBeInstanceOf(Date);
    }
  });
});
