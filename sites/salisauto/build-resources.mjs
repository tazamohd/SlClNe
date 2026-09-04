// Resources section for the SALIS AUTO site. `node build-resources.mjs` writes the main pages
// (through build.mjs), then renders the enablement, training, knowledge-base and media docs
// from /docs into resources/**.html with the shared chrome, and writes the sitemap for both.
//
// The markdown files stay the source of truth; nothing here is copy. Documents render in the
// language(s) they were written in, so every block is dir="auto".
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, basename, extname } from 'node:path';
import { renderPage, writePages, writeSitemap, t, ROOT } from './build.mjs';

const REPO = join(ROOT, '..', '..');
const DOCS = join(REPO, 'docs');

/* ---------------------------------------------------------------- sections */
const SECTIONS = [
  // Public sections only (owner's decision 2026-09-05): training and the media kit.
  // The enablement layer (first-week plan, manual, how-tos) is the training material itself, so it ships under Training.
  { key: 'training', dir: 'training', out: 'training',
    title: ['Training', 'التدريب'],
    desc: ['Role courses, assessments and certification.', 'دورات الأدوار، والتقييمات، والشهادات.'] },
  { key: 'enablement', dir: 'enablement', out: 'training/guides',
    title: ['Training guide, manual and how-to', 'دليل التدريب والدليل وأدلة الخطوات'],
    desc: ['The first-week plan per role, the user manual by journey group, and task guides with their media blocks.', 'خطة الأسبوع الأول لكل دور، ودليل المستخدم بحسب مجموعات الرحلة، وأدلة المهام مع كتل الوسائط.'] },
  { key: 'media', dir: 'marketing/media', out: 'media',
    title: ['Media kit', 'عدة الوسائط'],
    desc: ['Video scripts, shorts, carousels, the photo brief and the screenshot guide.', 'نصوص الفيديو، والمقاطع القصيرة، والعروض المتتابعة، وموجز التصوير، ودليل لقطات الشاشة.'] },
];

/* ---------------------------------------------------------------- markdown */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, (m, c) => `<code dir="ltr">${c}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => {
    if (/^https?:|^mailto:/.test(href)) return `<a href="${href}">${txt}</a>`;
    const h = href.replace(/\.md(#.*)?$/, '.html$1');
    return `<a href="${h}">${txt}</a>`;
  });
  return s;
}
function md(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0, title = '';
  const flushPara = (buf) => { if (!buf.length) return; const labelled = buf.every((l) => /^[A-Z]{2}:\s/.test(l)); out.push(labelled ? `<p>${buf.map((l) => `<span dir="auto" style="display:block">${inline(l)}</span>`).join('')}</p>` : `<p dir="auto">${inline(buf.join(' '))}</p>`); };
  let para = [];
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) { flushPara(para); para = []; const code = []; i++; while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]); i++; out.push(`<pre dir="ltr"><code>${esc(code.join('\n'))}</code></pre>`); continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(para); para = []; const lvl = h[1].length; const text = h[2].trim(); if (lvl === 1 && !title) title = text; out.push(`<h${Math.min(lvl + 1, 6)} dir="auto" id="${slug(text)}">${inline(text)}</h${Math.min(lvl + 1, 6)}>`); i++; continue; }
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      flushPara(para); para = [];
      const rows = []; while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
      const cells = (r) => r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      out.push(`<div class="tablewrap"><table><thead><tr>${head.map((c) => `<th dir="auto">${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td dir="auto">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flushPara(para); para = [];
      const ordered = /^\s*\d+\./.test(line); const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) { let item = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''); i++; while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) item += ' ' + lines[i++].trim(); items.push(item); }
      out.push(`<${ordered ? 'ol' : 'ul'} dir="auto">${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) { flushPara(para); para = []; const q = []; while (i < lines.length && /^\s*>\s?/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, '')); out.push(`<blockquote dir="auto">${inline(q.join(' '))}</blockquote>`); continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { flushPara(para); para = []; out.push('<hr>'); i++; continue; }
    if (!line.trim()) { flushPara(para); para = []; i++; continue; }
    para.push(line.trim()); i++;
  }
  flushPara(para);
  return { title, html: out.join('\n') };
}
const slug = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80);

/* ---------------------------------------------------------------- files */
function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (extname(name) === '.md') out.push(p);
  }
  return out.sort();
}

const docPages = []; // { path, title, section, group }
const written = [];
writePages();

for (const sec of SECTIONS) {
  const dir = join(DOCS, sec.dir);
  let files = walk(dir);
  if (sec.only) files = files.filter((f) => sec.only.includes(basename(f)));
  const entries = [];
  for (const file of files) {
    const rel = relative(dir, file).replace(/\\/g, '/');
    const outRel = `resources/${sec.out}/${rel.replace(/\.md$/, '.html')}`;
    const { title, html } = md(readFileSync(file, 'utf8'));
    const docTitle = title || basename(file, '.md');
    const group = rel.includes('/') ? rel.split('/')[0] : '';
    entries.push({ path: outRel, title: docTitle, group, source: `docs/${sec.dir}/${rel}` });
    const b = '../'.repeat(outRel.split('/').length - 1);
    const page = { path: outRel, key: 'resources', title: [docTitle, docTitle], desc: [`${docTitle} — SALIS AUTO ${sec.title[0]}.`, `${docTitle} — ${sec.title[1]} SALIS AUTO.`] };
    const body = `
<section class="wrap doc">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${b}resources/index.html">${t('Resources', 'المصادر')}</a> › <a href="${b}resources/${sec.out}/index.html">${t(sec.title[0], sec.title[1])}</a></nav>
  <p class="fine">${t('Shown in the language it was written in. Source:', 'يُعرض باللغة التي كُتب بها. المصدر:')} <code dir="ltr">${page.desc[0] ? entries[entries.length - 1].source : ''}</code></p>
  <article class="doc-body" dir="${/[؀-ۿ]/.test(docTitle) ? 'rtl' : 'ltr'}">
${html}
  </article>
</section>`;
    const outPath = join(ROOT, outRel);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, renderPage(page, body, { scenes: false }));
    written.push(outRel);
  }
  sec.entries = entries;
  // section index
  const groups = [...new Set(entries.map((e) => e.group))];
  const idxPath = `resources/${sec.out}/index.html`;
  const b = '../../';
  const list = groups.map((g) => `
  ${g ? `<h3 dir="auto">${g.replace(/-/g, ' ')}</h3>` : ''}
  <ul class="doc-list">
    ${entries.filter((e) => e.group === g).map((e) => `<li><a href="${b}${e.path}" dir="auto">${esc(e.title)}</a><span class="mono" dir="ltr">${e.source}</span></li>`).join('\n    ')}
  </ul>`).join('\n');
  const body = `
<section class="wrap doc">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="${b}resources/index.html">${t('Resources', 'المصادر')}</a></nav>
  <div class="sec-head"><div class="eyebrow">${t('Resources', 'المصادر')}</div><h1>${t(sec.title[0], sec.title[1])}</h1><p>${t(sec.desc[0], sec.desc[1])}</p></div>
  ${list}
</section>`;
  writeFileSync(join(ROOT, idxPath), renderPage({ path: idxPath, key: 'resources', title: sec.title, desc: sec.desc }, body, { scenes: false }));
  written.push(idxPath);
  docPages.push(...entries);
}

// resources landing
const landing = `
<section class="wrap doc">
  <div class="sec-head"><div class="eyebrow">${t('Resources', 'المصادر')}</div><h1>${t('Training, manuals, how-to guides and the media kit.', 'التدريب، والأدلة، وأدلة الخطوات، وعدة الوسائط.')}</h1>
  <p>${t('Everything a workshop needs to learn the product, and everything a producer needs to turn it into photos, videos and shorts. Documents open in the language they were written in.', 'كل ما تحتاجه الورشة لتعلّم المنتج، وكل ما يحتاجه المنتِج لتحويله إلى صور وفيديوهات ومقاطع قصيرة. تُفتح الوثائق باللغة التي كُتبت بها.')}</p></div>
  <div class="res-grid">
    ${SECTIONS.map((s) => `<a class="res-card" href="${s.out}/index.html"><b>${t(s.title[0], s.title[1])}</b><span>${t(s.desc[0], s.desc[1])}</span><em class="mono">${s.entries.length} ${t('documents', 'وثيقة')}</em></a>`).join('\n    ')}
  </div>
</section>`;
writeFileSync(join(ROOT, 'resources/index.html'), renderPage({ path: 'resources/index.html', key: 'resources', title: ['Resources', 'المصادر'], desc: ['Training, manuals, how-to guides, knowledge base and the media kit for SALIS AUTO.', 'التدريب والأدلة وأدلة الخطوات وقاعدة المعرفة وعدة الوسائط لـ SALIS AUTO.'] }, landing, { scenes: false }));
written.push('resources/index.html');

writeSitemap(written);
console.log('resources:', docPages.length, 'documents,', written.length, 'pages');
