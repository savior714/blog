declare module 'astro:content' {
  export interface RenderResult {
    Body: import('astro').AstroComponentFactory<{ content: string }, never, unknown>;
    metadata: Record<string, string>;
  }
  interface RenderResults {
    'cases': RenderResult;
  }
}
