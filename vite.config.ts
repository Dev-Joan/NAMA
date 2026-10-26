import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

import { clinicStructuredData, localePath, locales, ogLocales, pageMeta, type Locale } from './src/clinic';

// siteUrl: public address of the site, e.g. https://www.namapolyclinic.com. Used for the
// canonical URLs, language versions (hreflang), share image URLs, sitemap.xml and robots.txt.
// preview: review period (PREVIEW=true) - search engines are asked not to index anything.
// Each language gets its own page with its own head: / (English), /fr/ and /ar/.
function siteMeta(siteUrl: string, port: number, preview: boolean): Plugin {
  const pageUrl = (origin: string) => `${origin}/`;
  const robots = (origin: string) =>
    preview
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${pageUrl(origin)}sitemap.xml\n` : ''}`;
  const alternates = (origin: string, indent: string, tag: (hreflang: string, href: string) => string) =>
    [...locales.map((locale) => tag(locale, `${pageUrl(origin)}${localePath(locale)}`)), tag('x-default', pageUrl(origin))].join(`\n${indent}`);
  // Keep in sync with the legal page slugs in src/site.ts.
  const legalPaths = ['confidentialite', 'mentions-legales'];
  const sitemap = (origin: string) => {
    const homes = locales.map((locale) => `  <url>\n    <loc>${pageUrl(origin)}${localePath(locale)}</loc>\n    ${alternates(origin, '    ', (hreflang, href) => `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`)}\n  </url>\n`);
    const legal = legalPaths.map((page) => `  <url>\n    <loc>${pageUrl(origin)}${page}</loc>\n  </url>\n`);
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...homes, ...legal].join('')}</urlset>\n`;
  };
  const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  // Title, description, share tags, language versions and structured data of one language's page.
  // Without a site URL, canonical, og:url and hreflang are left out and share images stay relative.
  const seoHead = (locale: Locale, origin: string) => {
    const { title, description, imageAlt } = pageMeta[locale];
    const url = `${pageUrl(origin)}${localePath(locale)}`;
    const image = `${origin ? pageUrl(origin) : '/'}og-image.png`;
    const tags = [
      `<title>${escape(title)}</title>`,
      `<meta name="description" content="${escape(description)}" />`,
      `<meta name="robots" content="${preview ? 'noindex, nofollow' : 'index, follow'}" />`,
      ...(origin ? [
        `<link rel="canonical" href="${url}" />`,
        alternates(origin, '    ', (hreflang, href) => `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`),
        `<meta property="og:url" content="${url}" />`,
      ] : []),
      `<meta property="og:title" content="${escape(title)}" />`,
      `<meta property="og:description" content="${escape(description)}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:image" content="${image}" />`,
      '<meta property="og:image:width" content="1200" />',
      '<meta property="og:image:height" content="630" />',
      `<meta property="og:image:alt" content="${escape(imageAlt)}" />`,
      `<meta property="og:locale" content="${ogLocales[locale]}" />`,
      ...locales.filter((other) => other !== locale).map((other) => `<meta property="og:locale:alternate" content="${ogLocales[other]}" />`),
      '<meta property="og:site_name" content="NAMA Polyclinic" />',
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escape(title)}" />`,
      `<meta name="twitter:description" content="${escape(description)}" />`,
      `<meta name="twitter:image" content="${image}" />`,
      `<script type="application/ld+json">${JSON.stringify(clinicStructuredData(locale, origin)).replace(/</g, '\\u003c')}</script>`,
    ];
    return `<!-- seo -->\n    ${tags.join('\n    ')}\n    <!-- /seo -->`;
  };
  const localizeHtml = (html: string, locale: Locale, origin: string) => html
    .replace(/<html[^>]*>/, `<html lang="${locale}"${locale === 'ar' ? ' dir="rtl"' : ''}>`)
    .replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, seoHead(locale, origin));
  let origin = siteUrl;

  return {
    name: 'nama-site-meta',
    configResolved(config) {
      if (preview) config.logger.info('PREVIEW=true: pages are marked noindex, nofollow and robots.txt disallows everything.');
      if (!siteUrl && config.command === 'build') {
        config.logger.info('SITE_URL is not set: canonical URLs, hreflang and sitemap.xml are left out, and share images use relative URLs.');
      }
    },
    configureServer(server) {
      origin ||= `http://localhost:${port}`;
      server.middlewares.use((req, res, next) => {
        const file = req.url?.split('?')[0];
        if (file === '/robots.txt') res.setHeader('Content-Type', 'text/plain').end(robots(origin));
        else if (file === '/sitemap.xml') res.setHeader('Content-Type', 'application/xml').end(sitemap(origin));
        else next();
      });
    },
    // The build fills in the English page here and writes the other languages in generateBundle;
    // the dev server serves this same file for /fr/ and /ar/, so it picks the language from the address.
    transformIndexHtml(html, ctx) {
      const folder = (ctx.originalUrl ?? '').split(/[?#]/)[0].split('/')[1];
      const locale = locales.find((option) => option !== 'en' && option === folder) ?? 'en';
      return localizeHtml(html, locale, origin);
    },
    generateBundle: {
      // 'post': runs once Vite has added the built index.html to the bundle.
      order: 'post',
      handler(_options, bundle) {
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(siteUrl) });
        if (siteUrl && !preview) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(siteUrl) });
        const home = bundle['index.html'];
        if (home?.type !== 'asset') throw new Error('index.html is missing from the build output.');
        for (const locale of locales.filter((option) => option !== 'en')) {
          this.emitFile({ type: 'asset', fileName: `${localePath(locale)}index.html`, source: localizeHtml(String(home.source), locale, siteUrl) });
        }
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  // Reads .env as well as real environment variables (Cloudflare build variables).
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT || 5173);
  const siteUrl = (env.SITE_URL ?? '').replace(/\/+$/, '');
  const preview = env.PREVIEW === 'true';
  if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
    throw new Error(`Invalid SITE_URL value: "${siteUrl}" (must start with https://)`);
  }

  return {
    plugins: [react(), tailwindcss(), siteMeta(siteUrl, port, preview)],
    build: {
      // Browsers from roughly the last four years, including iOS 15.4+ Safari and
      // Samsung Internet 18+ (also the floor for the CSS cascade layers Tailwind uses).
      target: ['es2020', 'chrome99', 'edge99', 'firefox100', 'safari15.4', 'ios15.4'],
    },
    server: { port, host: true },
    preview: { port, host: true },
  };
});
