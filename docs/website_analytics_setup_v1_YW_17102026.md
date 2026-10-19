# Website traffic analytics (opt-in) — ClinSearchBridge

**Version:** v1 · 17 October 2026

## Purpose and scope

Count visits and page views to the publicly hosted ClinSearchBridge website, view daily traffic, and inspect aggregate country, device, browser and referrer breakdowns in an **administrator-only** Cloudflare Web Analytics dashboard. This is *website traffic* analysis, not individual-user profiling or conversion accuracy monitoring.

The deterministic Python/Pyodide converter runs locally exactly as before. This integration does not submit Ovid strategies, RTF files, converted PubMed queries, results, validation decisions, or audit data as analytics events. There is no login, visitor database, marketing tag, analytics cookie, or publicly visible visitor counter.

## What can be measured

| Request | Cloudflare metric / caveat |
| --- | --- |
| Today's visits | Visits, select an appropriate *Today* time range |
| Today's page loads | Page views |
| Previous days / weeks / months | Selectable chart date ranges |
| Total so far | Select a cumulative date range since activation, **only while it is still within the six-month reporting window** |
| Geographical breakdown | Country (approximate, aggregated) |
| Device profile | Desktop/mobile/tablet, browser, operating system |
| Acquisition | Referrer source (may be missing due to privacy settings) |

**The free Cloudflare Web Analytics dashboard currently only exposes the previous six months. It does not provide a permanent lifetime visit counter.** If permanent cumulative reporting is essential, arrange a separate *private* long-term aggregate series (for example, exporting or archiving counts on a recurring schedule) or select a platform with longer retention. Do not claim this implementation provides an indefinite all-time figure.

Age, gender, education, medical specialty, and profession are **not** available in the privacy-first analytics; do not guess them from country, IP or device. Visits are not unique people, and page views are not visits. Figures begin **after activation** and do not recover earlier GitHub Pages traffic. Browser blocking, network errors and vendor sampling/retention may affect totals.

## Setup — one-time owner action

1. Visit **Cloudflare Dashboard → Web Analytics → Add a site**. Register the exact current published hostname, expected to be `clinsearchbridge.github.io`. If the website is actually served at `yuewu57.github.io/ClinSearchBridge/`, register the hostname `yuewu57.github.io` instead. The domain does **not** need to use Cloudflare DNS or Cloudflare Pages.
2. Under **Manage site**, copy the `token` string from the snippet `data-cf-beacon='{"token":"..."}'`. **Use the public website beacon token, not any Cloudflare API key**. The integration expects a 32-character hexadecimal token.
3. Open **GitHub → yuewu57/ClinSearchBridge → Settings → Secrets and variables → Actions → Variables → New repository variable**. Set the name `CLOUDFLARE_WEB_ANALYTICS_TOKEN` and the value to that token. GitHub repository **variable** is appropriate because this value must be embedded in public browser JavaScript; do not put a privileged API key here.
4. Merge the reviewed change and trigger/re-run **Publish GitHub Pages** on `main`. The build embeds `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN`. Without the variable (or with an invalid token) the tracker is **not loaded**, and the website continues to operate normally.
5. Open the actual published HTTPS website and inspect its browser network panel. The browser should load `static.cloudflareinsights.com/beacon.min.js` and send traffic beacons to `cloudflareinsights.com`. Confirm the Cloudflare dashboard begins reporting page views/visits after a short processing delay.
6. In Cloudflare **Web Analytics**, select **Today** to inspect daily figures; use date-range selection for trends and *Country*, *Device type*, *Browser*, *Referer* for breakdowns. The dashboard is private to the Cloudflare account/team with permission.

The script activates only for production builds served over HTTPS on `clinsearchbridge.github.io` or `yuewu57.github.io`. Local development, previews and non-GitHub hostnames do not load the tracker. If the site migrates to a custom domain later, update the production-host allowlist and re-check the Cloudflare site hostname.

## Privacy and technical design

- One opt-in Cloudflare beacon is loaded by `browser/src/analytics.ts`; no custom events or user identifiers are sent.
- `browser/index.html` has the active GitHub Pages CSP meta policy, selectively allowing the Cloudflare beacon script and its data endpoint; `browser/public/_headers` mirrors this for hosts that honour response-header config (GitHub Pages does not).
- The existing `no-referrer` policy is retained. Consequently, referring-site measurements may be incomplete; do **not** weaken the policy merely to improve marketing analytics without a separate privacy review.
- This adds a **third-party JavaScript trust boundary**, although the application never passes strategy data into the beacon's API. The provider's script technically runs within the page; website owners should account for this in their public privacy notice and third-party dependency review. Never claim the site contains no analytics when the token is enabled.
- Cloudflare's product states that Web Analytics does not use visitors' personal data. Nonetheless, confirm that the site's privacy disclosure and deployment meet applicable UK/EU privacy requirements before enabling it.

**Privacy safeguard:** do not add query text, file names, PMIDs, study titles, analysis results, or free-text field contents as custom analytics labels, URL parameters, or events. No conversion events have been implemented here.

## Checks

```bash
cd browser
npm ci
npm test
npm run build
```

- No token: `browser/dist` should have no request to Cloudflare Web Analytics when opened locally.
- Valid token in a production HTTPS GitHub Pages build: one Cloudflare beacon script is loaded.
- Conversion input/results must remain entirely browser-local; existing conversion tests must continue to pass.

References:
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/faq/
- https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/
