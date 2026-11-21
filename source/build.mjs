// Builds Disha into single-file pages.
//   ../index.html (+ app files)   the website served by GitHub Pages from the repository root
//   artifact.html                  page body for a Claude artifact
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = (p) => readFileSync(join(root, 'src', p), 'utf8');
const ORDER = ['data', 'data2', 'astro', 'numerology', 'ui', 'store', 'vastu', 'app', 'today', 'kundli', 'jyotish2', 'numview', 'vastuview', 'calc', 'ask', 'extras'];

const LOGO = 'data:image/png;base64,' + readFileSync(join(root, 'src', 'brand', 'logo-160.png')).toString('base64');
const js = (ORDER.map((n) => `/* ---- ${n}.js ---- */\n` + src(`js/${n}.js`)).join('\n') + '\nDisha.app.start();\n').replace(/@@LOGO@@/g, LOGO);
if (/<\/script|<script|<!--/i.test(js)) throw new Error('Script text contains a sequence that would break inline embedding.');
const css = src('app.css');
const body = src('index.html').replace('/*@CSS@*/', () => css).replace('/*@JS@*/', () => js);

const OUT = join(root, '..');
writeFileSync(join(root, 'artifact.html'), body);

const reset = '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}img{max-width:100%}</style>' +
  '\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png" type="image/png">\n<link rel="apple-touch-icon" href="icon-192.png">' +
  '\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="Anubhuti">' +
  '\n<script>if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(function () {});</script>';
// installable-app files for the standalone copy (offline use, home-screen icon)
for (const f of ['manifest.webmanifest', 'sw.js']) copyFileSync(join(root, 'src', 'pwa', f), join(OUT, f));
for (const f of ['icon-192.png', 'icon-512.png']) copyFileSync(join(root, 'src', 'brand', f), join(OUT, f));
copyFileSync(join(root, 'src', 'brand', 'logo-160.png'), join(OUT, 'logo.png'));
const standalone = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + reset + '\n' +
  body.replace('<div id="root">', '</head>\n<body>\n<div id="root">') + '\n</body>\n</html>\n';
writeFileSync(join(OUT, 'index.html'), standalone);
console.log('Built index.html for GitHub Pages and source/artifact.html (' + (body.length / 1024).toFixed(0) + ' KB)');
