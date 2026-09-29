import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { render } from '../src/templates.mjs';
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
console.log('Built LELE Films: /quiet/ and /studio/');
