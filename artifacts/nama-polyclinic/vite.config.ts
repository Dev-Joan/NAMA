import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

// Public address of the site, e.g. https://www.namapolyclinic.com. Used for the
// canonical URL, social share image URLs, sitemap.xml and robots.txt.
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '');

if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
  throw new Error(`Invalid SITE_URL value: "${siteUrl}" (must start with https://)`);
}

function siteMeta(): Plugin {
  const pageUrl = (origin: string) => `${origin}${basePath}`;
  const robots = (origin: string) =>
    `User-agent: *\nAllow: /\n${origin ? `\nSitemap: ${pageUrl(origin)}sitemap.xml\n` : ''}`;
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
      if (!siteUrl && config.command === 'build') {
        config.logger.warn(
          'SITE_URL is not set: canonical URL and sitemap.xml are left out, and share images use relative URLs.',
        );
      }
    },
    configureServer(server) {
      origin ||= `http://localhost:${port}`;
      server.middlewares.use((req, res, next) => {
        const file = req.url?.split('?')[0];
        if (file === `${basePath}robots.txt`) res.setHeader('Content-Type', 'text/plain').end(robots(origin));
        else if (file === `${basePath}sitemap.xml`) res.setHeader('Content-Type', 'application/xml').end(sitemap(origin));
        else next();
      });
    },
    // 'pre': replace the placeholder before Vite rewrites relative URLs on nested paths.
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        if (origin) return html.replaceAll('__SITE_URL__', pageUrl(origin));
        // Without a site URL, drop canonical/og:url and keep share images relative.
        return html
          .replace(/^\s*<[^>]*__SITE_URL__[^>]*>\s*$/gm, (tag) =>
            /og:image|twitter:image/.test(tag) ? tag : '',
          )
          .replaceAll('__SITE_URL__', basePath!);
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(siteUrl) });
      if (siteUrl) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(siteUrl) });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    siteMeta(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  // Read .env from the workspace root, next to .env.example.
  envDir: path.resolve(import.meta.dirname, '..', '..'),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
