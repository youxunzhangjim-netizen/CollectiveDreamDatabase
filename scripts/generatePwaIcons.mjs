import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iconDir = join(root, "public", "icons");

mkdirSync(iconDir, { recursive: true });

const outputs = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-icon-192.png", 192, true],
  ["maskable-icon-512.png", 512, true],
];

for (const [name, size, maskable] of outputs) {
  writeFileSync(join(iconDir, name), renderPng(size, maskable));
}

function renderPng(size, maskable) {
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size / 512;
  const safePad = maskable ? 0 : 36 * scale;
  const cornerRadius = maskable ? 0 : 96 * scale;

  fillRoundedRect(pixels, size, safePad, safePad, size - safePad * 2, size - safePad * 2, cornerRadius, [3, 4, 7, 255]);
  drawCircle(pixels, size, 256 * scale, 256 * scale, 174 * scale, [6, 21, 29, 255]);
  strokeCircle(pixels, size, 256 * scale, 256 * scale, 174 * scale, 18 * scale, [34, 211, 238, 255]);
  drawCircle(pixels, size, 256 * scale, 256 * scale, 105 * scale, [11, 16, 32, 255]);
  strokeCircle(pixels, size, 256 * scale, 256 * scale, 105 * scale, 10 * scale, [217, 70, 239, 230]);
  strokeEye(pixels, size, scale);
  drawCircle(pixels, size, 256 * scale, 270 * scale, 35 * scale, [34, 211, 238, 255]);
  drawLine(pixels, size, 256 * scale, 84 * scale, 256 * scale, 132 * scale, 16 * scale, [103, 232, 249, 255]);
  drawLine(pixels, size, 256 * scale, 380 * scale, 256 * scale, 428 * scale, 16 * scale, [103, 232, 249, 255]);
  drawLine(pixels, size, 84 * scale, 256 * scale, 132 * scale, 256 * scale, 16 * scale, [103, 232, 249, 255]);
  drawLine(pixels, size, 380 * scale, 256 * scale, 428 * scale, 256 * scale, 16 * scale, [103, 232, 249, 255]);

  return encodePng(size, size, pixels);
}

function fillRoundedRect(pixels, size, x, y, width, height, radius, color) {
  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      if (insideRoundedRect(px, py, x, y, width, height, radius)) {
        setPixel(pixels, size, px, py, color);
      }
    }
  }
}

function insideRoundedRect(px, py, x, y, width, height, radius) {
  if (px < x || py < y || px > x + width || py > y + height) return false;
  if (radius <= 0) return true;

  const cx = px < x + radius ? x + radius : px > x + width - radius ? x + width - radius : px;
  const cy = py < y + radius ? y + radius : py > y + height - radius ? y + height - radius : py;
  return (px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2;
}

function drawCircle(pixels, size, cx, cy, radius, color) {
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(size - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(size - 1, Math.ceil(cy + radius));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function strokeCircle(pixels, size, cx, cy, radius, thickness, color) {
  const outer = radius + thickness / 2;
  const inner = radius - thickness / 2;
  const minX = Math.max(0, Math.floor(cx - outer));
  const maxX = Math.min(size - 1, Math.ceil(cx + outer));
  const minY = Math.max(0, Math.floor(cy - outer));
  const maxY = Math.min(size - 1, Math.ceil(cy + outer));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (distance >= inner && distance <= outer) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function strokeEye(pixels, size, scale) {
  const cx = 256 * scale;
  const cy = 270 * scale;
  const rx = 112 * scale;
  const ry = 58 * scale;
  const thickness = Math.max(3, 16 * scale);

  for (let y = Math.max(0, Math.floor(cy - ry - thickness)); y <= Math.min(size - 1, Math.ceil(cy + ry + thickness)); y += 1) {
    for (let x = Math.max(0, Math.floor(cx - rx - thickness)); x <= Math.min(size - 1, Math.ceil(cx + rx + thickness)); x += 1) {
      const normalized = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
      if (normalized >= 0.78 && normalized <= 1.08) {
        setPixel(pixels, size, x, y, [165, 243, 252, 255]);
      }
    }
  }
}

function drawLine(pixels, size, x1, y1, x2, y2, thickness, color) {
  const minX = Math.max(0, Math.floor(Math.min(x1, x2) - thickness));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(x1, x2) + thickness));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2) - thickness));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(y1, y2) + thickness));
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy || 1;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
      const px = x1 + t * dx;
      const py = y1 + t * dy;
      if ((x - px) ** 2 + (y - py) ** 2 <= (thickness / 2) ** 2) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function setPixel(pixels, size, x, y, color) {
  const index = (Math.floor(y) * size + Math.floor(x)) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", Buffer.concat([
      uint32(width),
      uint32(height),
      Buffer.from([8, 6, 0, 0, 0]),
    ])),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  return Buffer.concat([
    uint32(data.length),
    typeBuffer,
    data,
    uint32(crc32(Buffer.concat([typeBuffer, data]))),
  ]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}
