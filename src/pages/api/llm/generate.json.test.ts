import { describe, it, expect } from 'vitest';
import { generateFallbackSummary } from './generate.json';

describe('generateFallbackSummary', () => {
  it('should return summary and svg', () => {
    const result = generateFallbackSummary('Test Title', 'This is a test content.');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('svg');
  });

  it('should extract sentences from content', () => {
    const result = generateFallbackSummary(
      'My Blog Post',
      'This is the first sentence. This is the second sentence. This is the third sentence.'
    );
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it('should handle empty content', () => {
    const result = generateFallbackSummary('Empty Title', '');
    expect(result.summary).toBe('Empty Title');
  });

  it('should generate valid SVG', () => {
    const result = generateFallbackSummary('SVG Test', 'Some content here.');
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('SVG Test');
  });

  it('should split long titles into two lines', () => {
    const result = generateFallbackSummary(
      'A Very Long Title That Should Be Split Into Two Lines',
      'Content for testing.'
    );
    expect(result.svg).toContain('</text>\n      <text');
  });

  it('should keep short titles on one line', () => {
    const result = generateFallbackSummary('Short', 'Content.');
    expect(result.svg).not.toContain('</text>\n      <text');
  });

  it('should escape HTML entities', () => {
    const result = generateFallbackSummary('Title <test>', 'Content.');
    expect(result.svg).toContain('&lt;');
    expect(result.svg).toContain('&gt;');
  });

  it('should handle markdown content', () => {
    const result = generateFallbackSummary(
      'Markdown Test',
      '# Header\n\nThis is **bold** and `code`.\n\n- List item\n\n> Quote'
    );
    expect(result.summary).not.toContain('#');
    expect(result.summary).not.toContain('**');
  });
});
