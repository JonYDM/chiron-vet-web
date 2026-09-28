/**
 * Comprime/redimensiona una imagen en el cliente (canvas) antes de subirla, para
 * ahorrar datos del celular. El backend (ImageSharp) la reprocesa a WebP definitivo,
 * pero esta primera pasada evita mandar 5 MB desde el dispositivo.
 *
 * Redimensiona al lado máximo indicado y exporta a JPEG con la calidad dada.
 */
export async function comprimirImagen(
  archivo: File,
  { ladoMax = 1400, calidad = 0.82 }: { ladoMax?: number; calidad?: number } = {},
): Promise<Blob> {
  // Solo procesamos imágenes; si no lo es, devolvemos el archivo tal cual.
  if (!archivo.type.startsWith("image/")) return archivo;

  const bitmap = await createImageBitmap(archivo).catch(() => null);
  if (!bitmap) return archivo; // navegador sin soporte → subir original

  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return archivo;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", calidad),
  );
  return blob ?? archivo;
}
