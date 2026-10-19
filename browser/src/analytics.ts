/**
 * Optional, aggregate website-traffic analytics for the public GitHub Pages site.
 *
 * Never include search text, RTF contents, PubMed output, or audit details in
 * custom analytics events. This integration only loads Cloudflare's page beacon.
 * The site remains fully functional when analytics are not configured/blocked.
 */
const BEACON_SOURCE = 'https://static.cloudflareinsights.com/beacon.min.js';
const PRODUCTION_HOSTS = new Set(['clinsearchbridge.github.io', 'yuewu57.github.io']);
const TOKEN_PATTERN = /^[a-f0-9]{32}$/i;

export function initializeTrafficAnalytics(): boolean {
  // Site tokens are public identifiers; no Cloudflare account API token is used.
  const token = (import.meta.env.VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN ?? '').trim();
  if (
    !import.meta.env.PROD ||
    !TOKEN_PATTERN.test(token) ||
    window.location.protocol !== 'https:' ||
    !PRODUCTION_HOSTS.has(window.location.hostname.toLowerCase())
  ) {
    return false;
  }

  const script = document.createElement('script');
  script.src = BEACON_SOURCE;
  script.async = true;
  script.setAttribute('data-cf-beacon', JSON.stringify({token, spa: false}));
  document.head.append(script);
  return true;
}
