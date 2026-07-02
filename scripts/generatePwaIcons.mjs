import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync, inflateSync } from "node:zlib";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const iconDir = join(root, "public", "icons");
const sourcePath = join(root, "assets", "brand", "collective-dream-observatory-icon.png");

mkdirSync(iconDir, { recursive: true });

const source = decodePng(readFileSync(sourcePath));
const outputs = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["maskable-icon-192.png", 192],
  ["maskable-icon-512.png", 512],
];

for (const [name, size] of outputs) {
  const resized = resizeContain(source, size, size);
  writeFileSync(join(iconDir, name), encodePng(size, size, resized));
}

const svg = renderEmbeddedSvg(readFileSync(join(iconDir, "icon-512.png")));
writeFileSync(join(root, "public", "app-icon.svg"), svg);
writeFileSync(join(iconDir, "icon.svg"), svg);
writeFileSync(join(iconDir, "maskable-icon.svg"), svg);

function decodePng(buffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error("Source icon must be a PNG file.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];

      if (bitDepth !== 8 || ![2, 6].includes(colorType) || data[10] !== 0 || data[11] !== 0 || data[12] !== 0) {
        throw new Error("Source icon must be a non-interlaced 8-bit RGB or RGBA PNG.");
      }
    }

    if (type === "IDAT") idatChunks.push(data);
    if (type === "IEND") break;
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const rgba = Buffer.alloc(width * height * 4);
  const previous = Buffer.alloc(stride);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filterType = inflated[inputOffset];
    inputOffset += 1;
    const current = Buffer.from(inflated.subarray(inputOffset, inputOffset + stride));
    inputOffset += stride;
    unfilterRow(current, previous, filterType, bytesPerPixel);

    for (let x = 0; x < width; x += 1) {
      const sourceIndex = x * bytesPerPixel;
      const targetIndex = (y * width + x) * 4;
      rgba[targetIndex] = current[sourceIndex];
      rgba[targetIndex + 1] = current[sourceIndex + 1];
      rgba[targetIndex + 2] = current[sourceIndex + 2];
      rgba[targetIndex + 3] = colorType === 6 ? current[sourceIndex + 3] : 255;
    }

    current.copy(previous);
  }

  return { width, height, rgba };
}

function unfilterRow(current, previous, filterType, bytesPerPixel) {
  for (let index = 0; index < current.length; index += 1) {
    const left = index >= bytesPerPixel ? current[index - bytesPerPixel] : 0;
    const up = previous[index] || 0;
    const upLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] || 0 : 0;

    if (filterType === 1) current[index] = (current[index] + left) & 255;
    else if (filterType === 2) current[index] = (current[index] + up) & 255;
    else if (filterType === 3) current[index] = (current[index] + Math.floor((left + up) / 2)) & 255;
    else if (filterType === 4) current[index] = (current[index] + paeth(left, up, upLeft)) & 255;
    else if (filterType !== 0) throw new Error(`Unsupported PNG filter type: ${filterType}`);
  }
}

function paeth(left, up, upLeft) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);
  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) return left;
  if (upDistance <= upLeftDistance) return up;
  return upLeft;
}

function resizeContain(sourceImage, width, height) {
  const target = Buffer.alloc(width * height * 4);
  fill(target, [3, 4, 7, 255]);

  const scale = Math.min(width / sourceImage.width, height / sourceImage.height);
  const drawWidth = Math.round(sourceImage.width * scale);
  const drawHeight = Math.round(sourceImage.height * scale);
  const offsetX = Math.round((width - drawWidth) / 2);
  const offsetY = Math.round((height - drawHeight) / 2);

  for (let y = 0; y < drawHeight; y += 1) {
    for (let x = 0; x < drawWidth; x += 1) {
      const sourceX = clamp(((x + 0.5) / scale) - 0.5, 0, sourceImage.width - 1);
      const sourceY = clamp(((y + 0.5) / scale) - 0.5, 0, sourceImage.height - 1);
      const color = sampleBilinear(sourceImage, sourceX, sourceY);
      setPixel(target, width, x + offsetX, y + offsetY, color);
    }
  }

  return target;
}

function fill(buffer, color) {
  for (let index = 0; index < buffer.length; index += 4) {
    buffer[index] = color[0];
    buffer[index + 1] = color[1];
    buffer[index + 2] = color[2];
    buffer[index + 3] = color[3];
  }
}

function sampleBilinear(image, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(image.width - 1, x0 + 1);
  const y1 = Math.min(image.height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const c00 = getPixel(image, x0, y0);
  const c10 = getPixel(image, x1, y0);
  const c01 = getPixel(image, x0, y1);
  const c11 = getPixel(image, x1, y1);

  return c00.map((_, channel) => {
    const top = c00[channel] * (1 - tx) + c10[channel] * tx;
    const bottom = c01[channel] * (1 - tx) + c11[channel] * tx;
    return Math.round(top * (1 - ty) + bottom * ty);
  });
}

function getPixel(image, x, y) {
  const index = (y * image.width + x) * 4;
  return [
    image.rgba[index],
    image.rgba[index + 1],
    image.rgba[index + 2],
    image.rgba[index + 3],
  ];
}

function setPixel(buffer, width, x, y, color) {
  const index = (y * width + x) * 4;
  buffer[index] = color[0];
  buffer[index + 1] = color[1];
  buffer[index + 2] = color[2];
  buffer[index + 3] = color[3];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function renderEmbeddedSvg(pngBuffer) {
  const base64 = pngBuffer.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Collective Dream Observatory icon">
  <image href="data:image/png;base64,${base64}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
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
