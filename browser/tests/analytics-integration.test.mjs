import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const analytics = readFileSync(new URL('../src/analytics.ts', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');
const pages = readFileSync(new URL('../../.github/workflows/pages.yml', import.meta.url), 'utf8');

test('analytics are opt-in and limited to production HTTPS GitHub Pages hosts', () => {
  assert.match(analytics, /VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
  assert.match(analytics, /import\.meta\.env\.PROD/);
  assert.match(analytics, /location\.protocol !== 'https:'/);
  assert.match(analytics, /PRODUCTION_HOSTS\.has/);
  assert.match(analytics, /TOKEN_PATTERN\.test\(token\)/);
});

test('only the Cloudflare page beacon is loaded, without custom conversion events', () => {
  assert.match(analytics, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
  assert.match(analytics, /data-cf-beacon/);
  assert.match(analytics, /spa: false/);
  assert.doesNotMatch(analytics, /navigator\.sendBeacon|XMLHttpRequest|\bfetch\s*\(|\.track\s*\(/);
  assert.match(ui, /analyticsEnabled \? 'Optional Cloudflare Web Analytics/);
  assert.match(ui, /Website analytics are currently disabled/);
});

test('CSP, static-host policy and build configuration all agree', () => {
  for (const policy of [html, headers]) {
    assert.match(policy, /script-src[^;]*https:\/\/static\.cloudflareinsights\.com/);
    assert.match(policy, /connect-src[^;]*https:\/\/cloudflareinsights\.com/);
  }
  assert.match(pages, /VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN: \$\{\{ vars\.CLOUDFLARE_WEB_ANALYTICS_TOKEN \}\}/);
});
