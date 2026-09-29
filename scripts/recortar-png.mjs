// Recorta un PNG RGBA al rectángulo donde hay píxeles visibles (alfa > 0).
// Sin dependencias: decodifica y vuelve a codificar el PNG con zlib.
import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync, crc32 } from "node:zlib";

const FIRMA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};

const leer = (archivo) => {
  const buf = readFileSync(archivo);
  let pos = 8, ancho, alto, profundidad, tipo, entrelazado;
  const idat = [];
  while (pos < buf.length) {
    const largo = buf.readUInt32BE(pos);
    const nombre = buf.toString("ascii", pos + 4, pos + 8);
    const datos = buf.subarray(pos + 8, pos + 8 + largo);
    if (nombre === "IHDR") {
      ancho = datos.readUInt32BE(0);
      alto = datos.readUInt32BE(4);
      [profundidad, tipo] = [datos[8], datos[9]];
      entrelazado = datos[12];
    } else if (nombre === "IDAT") idat.push(datos);
    pos += 12 + largo;
  }
  if (profundidad !== 8 || tipo !== 6 || entrelazado !== 0) {
    throw new Error("Solo se admiten PNG RGBA de 8 bits sin entrelazar");
  }
  const crudo = inflateSync(Buffer.concat(idat));
  const fila = ancho * 4;
  const px = Buffer.alloc(fila * alto);
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[y * (fila + 1)];
    const src = crudo.subarray(y * (fila + 1) + 1, (y + 1) * (fila + 1));
    const off = y * fila;
    for (let i = 0; i < fila; i++) {
      const a = i >= 4 ? px[off + i - 4] : 0;
      const b = y > 0 ? px[off - fila + i] : 0;
      const c = i >= 4 && y > 0 ? px[off - fila + i - 4] : 0;
      const pred = [0, a, b, (a + b) >> 1, paeth(a, b, c)][filtro];
      px[off + i] = (src[i] + pred) & 0xff;
    }
  }
  return { ancho, alto, px };
};

const chunk = (nombre, datos) => {
  const cab = Buffer.alloc(8);
  cab.writeUInt32BE(datos.length, 0);
  cab.write(nombre, 4, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([cab.subarray(4), datos])) >>> 0);
  return Buffer.concat([cab, datos, crc]);
};

const escribir = (archivo, ancho, alto, px) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const fila = ancho * 4;
  const crudo = Buffer.alloc((fila + 1) * alto);
  for (let y = 0; y < alto; y++) px.copy(crudo, y * (fila + 1) + 1, y * fila, (y + 1) * fila);
  writeFileSync(archivo, Buffer.concat([
    FIRMA, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(crudo)), chunk("IEND", Buffer.alloc(0)),
  ]));
};

/** Devuelve el tamaño recortado, o null si la imagen está vacía. */
export const recortarPng = (entrada, destino, margen = 24) => {
  const { ancho, alto, px } = leer(entrada);
  let x0 = ancho, y0 = alto, x1 = -1, y1 = -1;
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      if (px[(y * ancho + x) * 4 + 3] > 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  x0 = Math.max(0, x0 - margen); y0 = Math.max(0, y0 - margen);
  x1 = Math.min(ancho - 1, x1 + margen); y1 = Math.min(alto - 1, y1 + margen);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    px.copy(out, y * w * 4, ((y0 + y) * ancho + x0) * 4, ((y0 + y) * ancho + x1 + 1) * 4);
  }
  escribir(destino, w, h, out);
  return { w, h };
};
