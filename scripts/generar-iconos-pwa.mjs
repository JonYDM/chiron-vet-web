// Genera los íconos de la PWA a partir de la imagen de Wipo (fuente en Downloads).
// Uso puntual:  node scripts/generar-iconos-pwa.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const fuente = "C:/Users/jonyo/Downloads/wipo_upscayl_5x_upscayl-lite-4x.png";

// Fondo blanco (coincide con el login) para que el ícono no salga transparente.
const fondo = { r: 255, g: 255, b: 255, alpha: 1 };

async function icono(tamano, archivo, padding = 0) {
  const contenido = tamano - padding * 2;
  const wipo = await sharp(fuente)
    .resize({ width: contenido, height: contenido, fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: tamano, height: tamano, channels: 4, background: fondo } })
    .composite([{ input: wipo, gravity: "center" }])
    .png()
    .toFile(join(publicDir, archivo));
  console.log(`generado ${archivo} (${tamano}x${tamano}, padding ${padding})`);
}

// Normales (Wipo casi lleno) y maskable (con más padding para el área segura).
await icono(192, "pwa-192x192.png", 16);
await icono(512, "pwa-512x512.png", 40);
await icono(512, "pwa-512x512-maskable.png", 100);
await icono(180, "apple-touch-icon.png", 16);
