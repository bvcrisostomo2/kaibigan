import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('GitHub Pages workflow', () => {
  const yml = readFileSync('.github/workflows/pages.yml', 'utf8');

  it('deploys on every push to main, after the tests and the build', () => {
    expect(yml).toMatch(/push:\s*\n\s*branches: \[main\]/);
    const order = ['npm ci', 'npm test', 'npm run build', 'actions/upload-pages-artifact', 'actions/deploy-pages'].map((s) => yml.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('fails the job if local art leaks into the build', () => {
    expect(yml).toContain('grep -rlE "data:image/png|_kb|local-assets/portraits" dist');
    expect(yml).toContain('exit 1');
  });
});
