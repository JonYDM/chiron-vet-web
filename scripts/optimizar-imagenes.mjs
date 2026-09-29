// Script de optimización de imágenes: convierte los PNG grandes de public/ a WebP
// redimensionados. Se corre a mano cuando cambian los assets:  node scripts/optimizar-imagenes.mjs
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// Los íconos/ilustraciones se muestran a ~112px máx → 256px cubre retina (2x).
const objetivos = [
  { archivo: "vet.png", ancho: 256 },
  { archivo: "pet-store.png", ancho: 256 },
  { archivo: "no-load.png", ancho: 320 },
  { archivo: "empty.png", ancho: 320 },
  { archivo: "wipo.png", ancho: 320 },
];

for (const { archivo, ancho } of objetivos) {
  const entrada = join(publicDir, archivo);
  const salida = join(publicDir, archivo.replace(/\.png$/, ".webp"));
  const original = (await readFile(entrada)).length;
  const buffer = await sharp(entrada)
    .resize({ width: ancho, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  await writeFile(salida, buffer);
  const kb = (n) => Math.round(n / 1024);
  console.log(`${archivo}: ${kb(original)}KB  ->  ${archivo.replace(/\.png$/, ".webp")}: ${kb(buffer.length)}KB`);
}
