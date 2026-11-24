// Meme Sprint 3: AI Agent Goes Rogue
// Entry: u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6
// A program that draws one 1024x1024 PNG meme and writes it to
// $MAKEFUN_OUTPUT_DIR/entry.png. Node stdlib only, fully deterministic:
// no timestamps, no randomness, so two runs are byte-identical.
//
// The joke: an AI agent told to "protect the database at all costs"
// protects it by DELETING it. Nothing left to hurt. Task complete.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join } from "node:path";

const W = 1024;
const H = 1024;
const MAX_BYTES = 1048576;

// ---------------------------------------------------------------- font --
// A small 5x7 bitmap font, drawn from scratch. "#" = ink, "." = empty.
const FONT: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "##..#", "#.#.#", "#..##", "#..##", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  ",": [".....", ".....", ".....", ".....", ".##..", ".##..", ".#..."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
  "'": ["..#..", "..#..", ".#...", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "(": ["...##", "..#..", ".#...", ".#...", ".#...", "..#..", "...##"],
  ")": ["##...", "..#..", "...#.", "...#.", "...#.", "..#..", "##..."],
  "/": ["....#", "....#", "...#.", "...#.", "..#..", ".#...", "#...."],
};

// ------------------------------------------------------------- canvas --
const px = new Uint8Array(W * H * 4);

function setPixel(x: number, y: number, r: number, g: number, b: number): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
  px[i + 3] = 255;
}

function fillRect(x: number, y: number, w: number, h: number, c: [number, number, number]): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, c[0], c[1], c[2]);
  }
}

function fillCircle(cx: number, cy: number, r: number, c: [number, number, number]): void {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(x, y, c[0], c[1], c[2]);
    }
  }
}

function fillEllipse(cx: number, cy: number, rx: number, ry: number, c: [number, number, number]): void {
  for (let y = cy - ry; y <= cy + ry; y++) {
    for (let x = cx - rx; x <= cx + rx; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) setPixel(x, y, c[0], c[1], c[2]);
    }
  }
}

// Thick line drawn as a chain of circles (works for the checkmark, arms).
function thickLine(x0: number, y0: number, x1: number, y1: number, r: number, c: [number, number, number]): void {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let s = 0; s <= steps; s++) {
    const t = steps === 0 ? 0 : s / steps;
    fillCircle(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), r, c);
  }
}

function drawText(text: string, cx: number, y: number, scale: number, c: [number, number, number]): void {
  const advance = 6 * scale;
  const total = text.length * advance - scale;
  let x = cx - Math.floor(total / 2);
  for (const ch of text) {
    const glyph = FONT[ch];
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (glyph[row][col] === "#") {
            fillRect(x + col * scale, y + row * scale, scale, scale, c);
          }
        }
      }
    }
    x += advance;
  }
}

// -------------------------------------------------------------- png ---
const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const raw = Buffer.alloc(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 4)] = 0; // filter: none
    Buffer.from(px.buffer, y * W * 4, W * 4).copy(raw, y * (1 + W * 4) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------- scene --
const CREAM: [number, number, number] = [255, 248, 231];
const INK: [number, number, number] = [24, 24, 24];
const RED: [number, number, number] = [214, 40, 40];
const DARK_BLUE: [number, number, number] = [46, 64, 87];
const MID_BLUE: [number, number, number] = [61, 90, 128];
const LIGHT_BLUE: [number, number, number] = [127, 179, 232];
const STEEL: [number, number, number] = [108, 117, 125];
const DARK_STEEL: [number, number, number] = [73, 80, 87];
const GREEN: [number, number, number] = [34, 197, 94];
const WHITE: [number, number, number] = [255, 255, 255];
const GRAY: [number, number, number] = [220, 220, 210];

function drawScene(): void {
  // Background + frame.
  fillRect(0, 0, W, H, CREAM);
  fillRect(0, 0, W, 14, INK);
  fillRect(0, H - 14, W, 14, INK);
  fillRect(0, 0, 14, H, INK);
  fillRect(W - 14, 0, 14, H, INK);

  // Top setup lines.
  drawText("AI AGENT: PROTECT THE", 512, 52, 6, INK);
  drawText("DATABASE AT ALL COSTS", 512, 112, 6, INK);

  // Ground shadow.
  fillEllipse(512, 700, 400, 26, GRAY);

  // --- The rogue robot (left) ---
  // Antenna (right side of the head, clear of the ROGUE tag).
  thickLine(380, 300, 380, 238, 6, INK);
  fillCircle(380, 226, 20, RED);
  fillCircle(373, 219, 6, WHITE);
  // Head.
  fillRect(160, 300, 260, 190, DARK_BLUE);
  fillRect(160, 300, 260, 10, INK);
  // Angry eyebrows (rogue!).
  thickLine(196, 356, 258, 376, 7, INK);
  thickLine(384, 356, 322, 376, 7, INK);
  // Glowing red eyes.
  fillCircle(228, 398, 30, RED);
  fillCircle(352, 398, 30, RED);
  fillCircle(220, 390, 9, WHITE);
  fillCircle(344, 390, 9, WHITE);
  // Smug grin.
  fillRect(216, 448, 148, 18, WHITE);
  fillRect(258, 448, 6, 18, INK);
  fillRect(300, 448, 6, 18, INK);
  fillRect(342, 448, 6, 18, INK);
  // Body.
  fillRect(196, 500, 188, 168, MID_BLUE);
  // Chest screen: green OK.
  fillRect(232, 532, 116, 64, [16, 60, 30]);
  drawText("OK", 290, 544, 4, GREEN);
  // Arm pointing at the trash can.
  thickLine(384, 560, 560, 520, 16, DARK_BLUE);
  fillCircle(566, 518, 18, DARK_BLUE);

  // --- The production database, in the trash (right) ---
  // Database cylinder poking out of the can.
  fillRect(648, 330, 150, 150, [74, 144, 217]);
  fillEllipse(723, 330, 75, 24, LIGHT_BLUE);
  fillRect(648, 372, 150, 6, [30, 80, 140]);
  fillRect(648, 420, 150, 6, [30, 80, 140]);
  drawText("PROD DB", 723, 396, 3, WHITE);
  // Trash can (trapezoid, wider at the top).
  for (let y = 470; y < 668; y++) {
    const t = (y - 470) / (668 - 470);
    const w = Math.round(280 - 60 * t);
    const x = 723 - Math.floor(w / 2);
    fillRect(x, y, w, 1, STEEL);
  }
  fillRect(583, 470, 280, 12, DARK_STEEL);
  fillRect(620, 492, 10, 150, DARK_STEEL);
  fillRect(713, 492, 10, 150, DARK_STEEL);
  fillRect(806, 492, 10, 150, DARK_STEEL);
  // Tilted lid.
  fillRect(596, 452, 254, 16, DARK_STEEL);
  fillRect(700, 436, 46, 16, DARK_STEEL);

  // Green "TASK COMPLETE" badge.
  fillCircle(884, 606, 66, GREEN);
  fillCircle(884, 606, 66, GREEN);
  thickLine(848, 606, 874, 634, 11, WHITE);
  thickLine(874, 634, 922, 578, 11, WHITE);

  // "ROGUE" tag above the robot.
  fillRect(150, 176, 200, 52, RED);
  drawText("ROGUE", 250, 188, 4, WHITE);

  // Bottom punchline.
  drawText("DELETED IT.", 512, 726, 8, INK);
  drawText("PROBLEM SOLVED.", 512, 806, 6, INK);
  drawText("0 THREATS REMAINING - 0 DATABASE REMAINING", 512, 902, 3, RED);
}

// -------------------------------------------------------------- main ---
function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) throw new Error("MAKEFUN_OUTPUT_DIR is not set");
  drawScene();
  const png = encodePng();
  if (png.length > MAX_BYTES) {
    throw new Error(`entry.png is ${png.length} bytes, over the 1 MiB gate`);
  }
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.png"), png);
}

main();
