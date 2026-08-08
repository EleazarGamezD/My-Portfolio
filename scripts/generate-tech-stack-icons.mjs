import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const bundlePath = resolve('node_modules/tech-stack-icons/dist/index.js');
const outputPath = resolve('public/assets/data/tech-stack-icons.json');
const source = await readFile(bundlePath, 'utf8');
const startMarker = 'var f=';
const endMarker = ';var h=f';
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);

if (start < 0 || end < 0) {
  throw new Error('No se pudo leer el catálogo de tech-stack-icons.');
}

const icons = vm.runInNewContext(
  `(${source.slice(start + startMarker.length, end)})`,
);
const catalog = Object.entries(icons)
  .map(([name, icon]) => ({ name, svg: icon.svg?.light }))
  .filter((icon) => icon.svg)
  .sort((a, b) => a.name.localeCompare(b.name));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(catalog));
console.log(`Catálogo generado: ${catalog.length} iconos.`);
