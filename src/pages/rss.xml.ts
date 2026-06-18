import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const cases = await getCollection('cases');

  return rss({
    title: 'Savior Lab Notes',
    description: '바이브코딩과 로컬 AI 실험을 케이스 단위로 기록합니다.',
    site: context.site || 'https://blog.savior714.com',
    items: cases.map((entry) => ({
      title: entry.data.title,
      pubDate: new Date(entry.data.publishedAt),
      description: entry.data.summary,
      link: `/case/${entry.slug}`,
    })),
    customData: '<language>ko</language>',
  });
}
