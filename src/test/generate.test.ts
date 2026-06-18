import { describe, it, expect } from 'vitest';
import { generateFallbackSummary } from './generate.json';

describe('generateFallbackSummary', () => {
  it('should extract summary from Korean content', () => {
    const result = generateFallbackSummary(
      'Local LLM으로 블로그 요약 자동 생성하기',
      '# Local LLM으로 블로그 요약 자동 생성하기\n\n로컬에서运行的 LLM을 사용하여 블로그 포스트의 요약을 자동으로 생성하는 방법에 대해 설명합니다.\n\n## 왜 Local LLM인가?\n\n클라우드 API를 사용하지 않고 로컬에서 모델을运行하면 데이터 프라이버시를 보장할 수 있습니다.'
    );
    
    expect(result.summary).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.summary.length).toBeLessThanOrEqual(50);
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('viewBox="0 0 400 225"');
  });

  it('should extract summary from English content', () => {
    const result = generateFallbackSummary(
      'Test Post',
      'This is a test post about local LLM summarization.\n\nWe use a local model to generate summaries without sending data to external APIs.'
    );
    
    expect(result.summary).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.svg).toContain('Test Post');
  });

  it('should handle markdown elements in content', () => {
    const result = generateFallbackSummary(
      'Markdown Test',
      '# Header\n\nThis is a [link](http://example.com) and an ![image](img.png).\n\nCode block:\n\n```javascript\nconst x = 1;\n```\n\nFinal sentence here.'
    );
    
    expect(result.summary).toBeTruthy();
    expect(result.svg).toContain('Markdown Test');
  });

  it('should fallback to title when content has no sentences', () => {
    const result = generateFallbackSummary(
      'No Sentences Title',
      'Just some words without punctuation'
    );
    
    expect(result.summary).toContain('No Sentences Title');
  });

  it('should handle empty content gracefully', () => {
    const result = generateFallbackSummary(
      'Empty Content Title',
      ''
    );
    
    expect(result.summary).toContain('Empty Content Title');
    expect(result.svg).toBeTruthy();
  });

  it('should generate SVG with title text', () => {
    const result = generateFallbackSummary(
      'Short Title',
      'Some content here.'
    );
    
    expect(result.svg).toContain('Short Title');
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('should split long titles into two lines in SVG', () => {
    const result = generateFallbackSummary(
      'The Quick Brown Fox Jumps Over',
      'Content here.'
    );
    
    // Count text elements in SVG - should have 3+ (title1 + title2 + summary)
    const textMatches = result.svg.match(/<text/g);
    expect(textMatches).toBeTruthy();
    expect(textMatches!.length).toBeGreaterThanOrEqual(3); // title1 + title2 + summary
  });

  it('should HTML-escape special characters in summary', () => {
    const result = generateFallbackSummary(
      'Special <Title> & Test',
      'Content with <html> tags & "quotes" here.'
    );
    
    // The summary should escape HTML entities from content
    expect(result.svg).toContain('&amp;');
  });
});
