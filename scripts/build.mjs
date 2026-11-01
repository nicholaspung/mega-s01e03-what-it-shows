import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import { compile } from 'svelte/compiler';
import { compile as mdsvex } from 'mdsvex';

const root = process.cwd();
const styles = new Map();
await build({
  configFile: false,
  resolve: { alias: { '#lib': path.join(root, 'src/lib') }, conditions: ['svelte'] },
  plugins: [{
    name: 'kb-ssr',
    async transform(source, id) {
      if (!/\.(svelte|svx)$/.test(id)) return;
      if (id.endsWith('.svx')) {
        source = (await mdsvex(source, { filename: id, layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') } })).code;
      }
      const result = compile(source, { filename: id, generate: 'server', css: 'external' });
      if (result.css) styles.set(id, result.css.code);
      return { code: result.js.code, map: result.js.map };
    }
  }],
  build: { ssr: 'scripts/render-entry.mjs', outDir: '.build', emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'render.mjs' } } }
});
const { pages } = await import(pathToFileURL(path.join(root, '.build/render.mjs')).href + '?t=' + Date.now());
const css = [...styles.values()].join('\n');
fs.rmSync('rendered', { recursive: true, force: true });
for (const page of pages) {
  const target = path.join('rendered', page.route, 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${page.head}<style>${css}</style></head><body>${page.body}</body></html>`);
}
fs.writeFileSync('rendered/pages.json', JSON.stringify(pages.map(p=>({route:p.route,metadata:p.metadata})), null, 2)+'\n');
console.log('Rendered', pages.length, 'pages from their actual Svelte components.');
