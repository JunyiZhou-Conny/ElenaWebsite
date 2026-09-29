import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
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
for(const page of ['index.html','quiet/index.html','studio/index.html']){
 const filename=resolve(root,'dist',page),html=await readFile(filename,'utf8');
 assert(html.includes('<h1'),'Page needs a heading: '+page);
 assert(!/undefined|\[object Object\]/.test(html),'Missing content in '+page);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert(new Set(ids).size===ids.length,'Duplicate HTML ids in '+page);
 for(const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(target))continue;
  if(target.startsWith('#'))assert(ids.includes(target.slice(1)),'Broken anchor '+target+' in '+page);
  else await access(resolve(dirname(filename),target.replace(/\/$/,'/index.html')));
 }
}
console.log(`Checked ${projects.length} projects, source links, media, optional content and all 3 pages. No broken local references.`);
