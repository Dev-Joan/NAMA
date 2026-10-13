import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type Plugin } from 'vite';

// siteUrl: public address of the site, e.g. https://www.namapolyclinic.com. Used for the
// canonical URL, social share image URLs, sitemap.xml and robots.txt.
// preview: review period (PREVIEW=true) - search engines are asked not to index anything.
function siteMeta(siteUrl: string, port: number, preview: boolean): Plugin {
  const pageUrl = (origin: string) => `${origin}/`;
  const robots = (origin: string) =>
    preview
      ? 'User-agent: *\nDisallow: /\n'
      : `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${pageUrl(origin)}sitemap.xml\n` : ''}`;
  // Keep in sync with the legal page slugs in src/site.ts.
  const sitemapPaths = ['', 'confidentialite', 'mentions-legales'];
  const sitemap = (origin: string) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
      .map((page) => `  <url>\n    <loc>${pageUrl(origin)}${page}</loc>\n  </url>\n`)
      .join('')}</urlset>\n`;
  let origin = siteUrl;

  return {
    name: 'nama-site-meta',
    configResolved(config) {
      if (preview) config.logger.info('PREVIEW=true: pages are marked noindex, nofollow and robots.txt disallows everything.');
      if (!siteUrl && config.command === 'build') {
        config.logger.info('SITE_URL is not set: canonical URL and sitemap.xml are left out, and share images use relative URLs.');
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
    // 'pre': replace the placeholder before Vite rewrites relative URLs on nested paths.
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (preview) html = html.replace(/<meta name="robots" content="[^"]*"/, '<meta name="robots" content="noindex, nofollow"');
        if (origin) return html.replaceAll('__SITE_URL__', pageUrl(origin));
        // Without a site URL, drop canonical/og:url and keep share images relative.
        return html
          .replace(/^\s*<[^>]*__SITE_URL__[^>]*>\s*$/gm, (tag) => (/og:image|twitter:image/.test(tag) ? tag : ''))
          .replaceAll('__SITE_URL__', '/');
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(siteUrl) });
      if (siteUrl && !preview) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(siteUrl) });
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
