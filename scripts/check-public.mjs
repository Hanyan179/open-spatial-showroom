import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRoomProducts } from '../src/spatial/room-products.js';

// Release hygiene, not a substitute for reviewing asset rights and data consent.
const root = fileURLToPath(new URL('../', import.meta.url));
const problems = [];
const json = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const ignored = new Set(['.git', 'node_modules', 'dist']);
const sensitive = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\/Users\/[A-Za-z0-9_-]+\//,
  /https?:\/\/(?:192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+)(?=[:/])/,
];
let files = 0, models = 0;
async function walk(directory) {
  for (const entry of await fs.readdir(path.join(root, directory), { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) { problems.push(`${file}: symlinks must not point outside a release`); continue; }
    if (entry.isDirectory()) { await walk(file); continue; }
    files++;
    if (/^\.env(?:\.|$)/.test(entry.name) && entry.name !== '.env.example' || /\.(?:pem|key|xlsx|zip)$/.test(entry.name)) problems.push(`${file}: private or source-only file in release`);
    let text;
    if (file.endsWith('.glb')) {
      const buffer = await fs.readFile(path.join(root, file));
      if (buffer.readUInt32LE(0) !== 0x46546c67) { problems.push(`${file}: invalid GLB`); continue; }
      text = buffer.toString('utf8', 20, 20 + buffer.readUInt32LE(12));
      const model = JSON.parse(text); models++;
      if ((model.images || []).length) problems.push(`${file}: embedded images require an explicit provenance review`);
    } else if (/\.(?:[cm]?js|jsx|json|md|css|html|svg|yml|yaml|txt)$/.test(file) || entry.name === 'LICENSE') text = await fs.readFile(path.join(root, file), 'utf8');
    if (text && sensitive.some(pattern => pattern.test(text))) problems.push(`${file}: potential secret, personal path or private network address`);
  }
}
await walk('');
const config = await json('public/showroom.config.json');
for (const value of Object.values(config.content)) {
  if (value.startsWith('/')) await fs.access(path.join(root, 'public', value.slice(1))).catch(() => problems.push(`Missing configured feed ${value}`));
}
const products = validateRoomProducts(await json('public/data/room-products.json'));
for (const product of products.products) if (product.image.startsWith('/')) await fs.access(path.join(root, 'public', product.image.slice(1))).catch(() => problems.push(`Missing product image ${product.image}`));
const media = (await json('vendor/explorer/public/shared/explorer-media.json')).items;
const styles = (await json('vendor/explorer/public/shared/product-skus.json')).items;
for (const item of [...Object.values(media), ...styles.map(s => s.media).filter(Boolean)]) {
  for (const reference of [...(item.images || []).map(i => i.src), ...(item.video ? [item.video] : [])]) {
    if (/^https?:/.test(reference)) continue;
    await fs.access(path.join(root, 'vendor/explorer/public', reference)).catch(() => problems.push(`Missing explorer media ${reference}`));
  }
}
for (const file of ['README.md', 'AGENTS.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) await fs.access(path.join(root, file)).catch(() => problems.push(`Missing release document ${file}`));
if (problems.length) { console.error(problems.join('\n')); process.exitCode = 1; }
else console.log(`Public release checks passed: ${files} files, ${models} models, ${products.products.length} product records; local references and release hygiene checked.`);
