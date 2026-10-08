import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { elenaPages } from '../src/elena.mjs';
import { motionPages, sitePages, siteOrigin } from '../src/motion.mjs';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const d=JSON.parse(await readFile(resolve(root,'content/site.json'),'utf8'));
const projects=[...d.projects,...d.company.companyProjects];
assert(d.projects.length>0,'Keep at least one personal project for the opening imagery.');
assert(new Set(projects.map(p=>p.id)).size===projects.length,'Project IDs must be unique.');
function url(value){if(!value)return;assert(/^https:\/\//.test(value),`Use a complete HTTPS URL: ${value}`);new URL(value);}
for(const p of projects){
 assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id),`Use a lowercase-hyphenated project id: ${p.id}`);
 for(const key of ['title','year','format','status','creditOwner','summary','image','imageAlt'])assert(p[key],`Missing ${key} in ${p.id}`);
 assert(Array.isArray(p.credits)&&p.credits.length,`Add verified credits for ${p.id}`);
 for(const file of [p.image,p.poster].filter(Boolean))await access(resolve(root,'public/images',file));
 for(const link of [p.sourceUrl,p.moreUrl,p.videoUrl,p.videoEmbed])url(link);
 if(p.videoEmbed)assert(/^https:\/\/player\.vimeo\.com\/video\/\d+\?/.test(p.videoEmbed),'Use a Vimeo embed URL with its query string.');
}
for(const p of d.company.team){assert(p.name&&p.role&&p.bio,'Team members need name, role and bio.');if(p.image)await access(resolve(root,'public/images',p.image));}
for(const s of d.company.services)assert(s.title&&s.description,'Services need a title and description.');
if(d.company.email)assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.company.email),'Use a real email address.');
url(d.founder.archiveUrl);url(d.founder.aboutUrl);d.writing.forEach(w=>url(w.url));
for(const page of ['index.html','quiet/index.html','studio/index.html', ...[...elenaPages,...motionPages].map(page=>page+'index.html')]){
 const filename=resolve(root,'dist',page),html=await readFile(filename,'utf8');
 assert(html.includes('<h1'),'Page needs a heading: '+page);
 assert(!/undefined|\[object Object\]/.test(html),'Missing content in '+page);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert(new Set(ids).size===ids.length,'Duplicate HTML ids in '+page);
 for(const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(target))continue;
  if(target.startsWith('#'))assert(ids.includes(target.slice(1)),'Broken anchor '+target+' in '+page);
  else await access(resolve(dirname(filename),target.split(/[?#]/)[0].replace(/\/$/,'/index.html')));
 }
}
console.log(`Checked ${projects.length} projects, source links, media, optional content and all 11 pages. No broken local references.`);

const elena=JSON.parse(await readFile(resolve(root,'content/elena.json'),'utf8'));
assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(elena.contact.email),'Elena contact email must be valid.');
assert(elena.film.slug==='goodbye-yiwu','Update the page manifest if the project slug changes.');
for(const media of [elena.film.cover,...elena.film.stills]) {
 assert(media.alt && media.image,'Every still needs an image and alt text.');
 for(const size of [800,1600]) await access(resolve(root,`dist/elena/images/${media.image}-${size}.webp`));
}
for(const link of elena.film.press) url(link.url);
url(elena.contact.instagram);
const css=await readFile(resolve(root,'dist/elena/elena.css'),'utf8');
for(const [,file] of css.matchAll(/url\(['"]([^'"]+)['"]\)/g)) await access(resolve(root,'dist/elena',file));
console.log('Checked Elena’s content, responsive stills and self-hosted font files.');

// The public website (site/): complete, open to search engines, addressed as lelefilms.com, and free of design-study links.
for(const page of sitePages){
 const filename=resolve(root,'site',page,'index.html'),html=await readFile(filename,'utf8');
 assert(html.includes('<h1'),'Page needs a heading: site/'+page);
 assert(!/undefined|\[object Object\]/.test(html),'Missing content in site/'+page);
 assert(!/noindex/.test(html),'The public site must not be hidden from search engines: site/'+page);
 assert(html.includes(`<link rel="canonical" href="${siteOrigin}${page}">`),'Missing canonical address in site/'+page);
 assert(!/href="[^"]*\b(elena|quiet|studio|motion)\/"/.test(html),'The public site must not link to the design studies: site/'+page);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert(new Set(ids).size===ids.length,'Duplicate HTML ids in site/'+page);
 for(const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(target))continue;
  if(target.startsWith('#'))assert(ids.includes(target.slice(1)),'Broken anchor '+target+' in site/'+page);
  else await access(resolve(dirname(filename),target.split(/[?#]/)[0].replace(/\/$/,'/index.html')));
 }
}
for(const file of ['404.html','robots.txt','sitemap.xml'])await access(resolve(root,'site',file));
const siteCss=await readFile(resolve(root,'site/elena/elena.css'),'utf8');
for(const [,file] of siteCss.matchAll(/url\(['"]([^'"]+)['"]\)/g)) await access(resolve(root,'site/elena',file));
console.log(`Checked the public website: ${sitePages.length} pages for ${siteOrigin}, open to search engines, no design-study links.`);

// Elena's October 8 review applies to Edition 04 in both the design preview and public site.
// Check rendered output so changes to the shared renderer cannot leave one deployment behind.
const htmlText = value => value
 .replace(/<[^>]*>/g,'')
 .replace(/&(amp|lt|gt|quot|#39|copy|#169);/g,(_,entity)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'",copy:'©','#169':'©'}[entity]))
 .replace(/\s+/g,' ').trim();
const attribute = (tag,name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
function section(html,id,label){
 const match=html.match(new RegExp(`<section\\b[^>]*\\baria-labelledby="${id}"[^>]*>([\\s\\S]*?)<\\/section>`));
 assert(match,`Missing ${id} section in ${label}`);
 return {markup:match[0],body:match[1],index:match.index};
}
assert.equal(elena.film.status,'Work In Progress','Keep the production status separate from the working title.');
assert.equal(elena.film.stills.length,4,'Elena requested four film stills.');
for(const [directory,pages] of [['dist',motionPages],['site',sitePages]]){
 const output=await Promise.all(pages.map(page=>readFile(resolve(root,directory,page,'index.html'),'utf8')));
 const [home,works,film,contact]=output;
 const label=`${directory}/${pages[0]}`;
 for(let i=0;i<output.length;i++){
  assert(!/\b(?:sticker-stage|data-reset-stickers|data-drag(?:-status)?|data-mode|data-reset-photos|gallery-controls|photo-stage|photo-grip|photo-open|photo-dialog|contact-mark)\b|<dialog\b/.test(output[i]),`Retired interactive markup remains in ${directory}/${pages[i]}`);
 }
 assert(/©\s*(?:\d{4}\s*)?LeLe\s+Films/i.test(htmlText(home)),`Home needs the LeLe Films copyright in ${label}`);

 const projectHeading=works.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1];
 assert(projectHeading,`Works needs a project heading in ${label}`);
 const workingTitle=projectHeading.match(/<span\b[^>]*class="[^"]*\bproject-working-title\b[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1];
 const chineseTitle=projectHeading.match(/<span\b[^>]*class="[^"]*\bproject-chinese\b[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1];
 assert.equal(htmlText(workingTitle||''),'(working title)',`Works needs the separate working-title note in ${label}`);
 assert.equal(htmlText(chineseTitle||''),elena.film.chineseTitle,`Works needs the Chinese title in ${label}`);
 assert(!htmlText(projectHeading).includes(elena.film.status),`Production status must not become part of the title in ${label}`);
 const worksMeta=works.match(/\bid="works-meta"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
 assert(htmlText(worksMeta).includes(elena.film.status),`Works metadata needs Work In Progress in ${label}`);
 assert(!/working title/i.test(htmlText(worksMeta)),`Working title must stay with the title, not replace production status in ${label}`);

 const stills=section(film,'stills',label),director=section(film,'director',label),press=section(film,'press',label);
 assert(stills.index<director.index&&director.index<press.index,`Director must follow Stills and precede Press in ${label}`);
 const grid=stills.body.match(/<div\b[^>]*class="[^"]*\bstills-grid\b[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1];
 assert(grid,`Stills needs a plain image grid in ${label}`);
 const stillImages=[...grid.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
 assert.equal(stillImages.length,4,`Stills must display exactly four images in ${label}`);
 assert.equal(grid.replace(/<img\b[^>]*>/g,'').trim(),'',`Stills must contain plain images without links, captions or controls in ${label}`);
 assert(!/<(?:a|button|dialog|figcaption)\b|\btabindex\s*=|\brole="(?:button|link)"/.test(stills.body),`Film stills must remain noninteractive in ${label}`);
 stillImages.forEach((img,i)=>{
  assert(attribute(img,'src')?.endsWith(`/images/${elena.film.stills[i].image}-800.webp`),`Still ${i+1} is missing or out of order in ${label}`);
  assert.equal(htmlText(attribute(img,'alt')||''),elena.film.stills[i].alt,`Still ${i+1} needs its descriptive alt text in ${label}`);
 });
 assert(/<h2\b[^>]*\bid="director"[^>]*>\s*Director:\s*<\/h2>/.test(director.body),`Director section needs a labelled heading in ${label}`);
 assert(/class="[^"]*\bdirector-layout\b/.test(director.body),`Director section needs its portrait and biography layout in ${label}`);
 const portrait=director.body.match(/<img\b[^>]*class="[^"]*\bdirector-portrait\b[^"]*"[^>]*>/)?.[0];
 assert(portrait&&htmlText(attribute(portrait,'alt')||''),`Director portrait needs meaningful alt text in ${label}`);
 const biography=director.body.match(/<div\b[^>]*class="[^"]*\bdirector-bio\b[^"]*"[^>]*>([\s\S]*?)<\/div>/)?.[1]||'';
 const paragraphs=[...biography.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)];
 assert(paragraphs.length&&paragraphs.every(match=>htmlText(match[1])),`Director biography needs nonempty paragraphs in ${label}`);

 const pressLinks=[...press.body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
 assert.equal(pressLinks.length,elena.film.press.length,`Keep every supplied press URL in ${label}`);
 pressLinks.forEach((link,i)=>{
  const expected=elena.film.press[i].url;
  assert.equal(htmlText(attribute(link[1],'href')||''),expected,`Press URL ${i+1} changed in ${label}`);
  const visible=link[2].replace(/<span\b[^>]*class="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/span>/g,'').replace(/<span\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/span>/g,'');
  assert.equal(htmlText(visible),expected,`Press label ${i+1} must show its raw URL in ${label}`);
 });
 assert(contact.includes(`href="mailto:${elena.contact.email}"`),`Contact needs the real email link in ${label}`);
 assert(contact.includes(`data-copy="${elena.contact.email}"`),`Contact needs its copy-email control in ${label}`);
 const copyStatus=contact.match(/<[^>]*\bdata-copy-status\b[^>]*>/)?.[0]||'';
 assert(/\brole="status"|\baria-live="polite"/.test(copyStatus),`Copy-email feedback must be announced accessibly in ${label}`);
}
console.log('Checked Elena’s review: copyright, separate working title/status, four plain stills, director biography, raw press URLs and accessible contact controls.');
