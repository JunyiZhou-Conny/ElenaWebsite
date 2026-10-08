import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { render } from '../src/templates.mjs';
import { renderElena, elenaPages } from '../src/elena.mjs';
import { renderMotion, motionPages, sitePages, siteOrigin } from '../src/motion.mjs';
const content = JSON.parse(await readFile(new URL('../content/site.json', import.meta.url), 'utf8'));
const root = new URL('../dist/', import.meta.url);
await mkdir(root, { recursive: true });
await cp(new URL('../public/', import.meta.url), root, { recursive: true });
for (const file of ['site.css','site.js']) await cp(new URL(`../src/${file}`,import.meta.url),new URL(file,root));
for (const theme of ['quiet','studio','compare']) {
 const folder = new URL(theme === 'compare' ? './' : `${theme}/`,root);
 await mkdir(folder,{recursive:true});
 await writeFile(new URL('index.html',folder),render(theme,content));
}
await writeFile(new URL('404.html',root),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found — LELE Films</title><body style="background:#161412;color:#eee;font:20px Arial;padding:10vw"><h1>This frame is missing.</h1><p><a style="color:inherit" href="/">Return to LELE Films</a></p></body></html>');
// A new URL when either motion asset changes prevents returning visitors seeing stale CSS/JS.
const motionAssets = await Promise.all(['motion.css','motion.js'].map(file => readFile(new URL(`../src/${file}`, import.meta.url))));
const assetVersion = createHash('sha256').update(Buffer.concat(motionAssets)).digest('hex').slice(0,12);
const elena = JSON.parse(await readFile(new URL('../content/elena.json', import.meta.url), 'utf8'));
for (const file of ['elena.css', 'elena.js']) await cp(new URL(`../src/${file}`, import.meta.url), new URL(`elena/${file}`, root));
for (const page of elenaPages) {
 const folder = new URL(page, root);
 await mkdir(folder, {recursive:true});
 await writeFile(new URL('index.html', folder), renderElena(page, elena));
}
await mkdir(new URL('motion/', root), { recursive: true });
for (const file of ['motion.css','motion.js']) await cp(new URL(`../src/${file}`, import.meta.url), new URL(`motion/${file}`, root));
for (const page of motionPages) {
 const folder = new URL(page, root);
 await mkdir(folder, {recursive:true});
 await writeFile(new URL('index.html', folder), renderMotion(page, elena, {assetVersion}));
}
// site/ is the public website for lelefilms.com: Edition 04 at the root, its media and fonts, nothing from the design studies.
const site = new URL('../site/', import.meta.url);
await rm(site, {recursive:true, force:true});
await mkdir(new URL('motion/', site), {recursive:true});
await cp(new URL('../public/elena/', import.meta.url), new URL('elena/', site), {recursive:true});
await cp(new URL('../public/motion/', import.meta.url), new URL('motion/', site), {recursive:true});
await cp(new URL('../src/elena.css', import.meta.url), new URL('elena/elena.css', site));
for (const file of ['motion.css','motion.js']) await cp(new URL(`../src/${file}`, import.meta.url), new URL(`motion/${file}`, site));
for (const page of sitePages) {
 const folder = new URL(page || './', site);
 await mkdir(folder, {recursive:true});
 await writeFile(new URL('index.html', folder), renderMotion(page, elena, {site:true, assetVersion}));
}
await writeFile(new URL('404.html', site), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — ${elena.brand}</title></head><body style="margin:0;min-height:100svh;display:grid;place-items:center;font:20px/1.4 Arial,sans-serif;color:#111;background:#fff;text-align:center"><main><p>This page isn’t here.</p><p><a href="/" style="color:#002fa7">${elena.brand} →</a></p></main></body></html>`);
await writeFile(new URL('robots.txt', site), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}sitemap.xml\n`);
await writeFile(new URL('sitemap.xml', site), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePages.map(page => `  <url><loc>${siteOrigin}${page}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Built LELE Films: /quiet/, /studio/, /elena/, and /motion/ in dist/; the public website in site/');
