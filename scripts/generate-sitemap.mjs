import { mkdir, writeFile } from 'node:fs/promises';

const routes = [
  '/', '/documentation', '/documentation/getting-started', '/documentation/theme-settings',
  '/documentation/header', '/documentation/product-cards', '/documentation/cart-drawer',
  '/documentation/product-pages', '/documentation/collections', '/documentation/pet-finder-quiz',
  '/documentation/build-a-box', '/documentation/animations', '/documentation/accessibility',
  '/documentation/troubleshooting', '/support', '/changelog', '/privacy', '/terms'
];

const base = (process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${base}${route}</loc></url>`).join('\n')}
</urlset>\n`;

await mkdir('public', { recursive: true });
await writeFile('public/sitemap.xml', xml);
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
