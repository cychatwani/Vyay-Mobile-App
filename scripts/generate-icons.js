const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SVG_PATH = path.join(ROOT, "assets", "brand", "vyay-appicon.svg");
const ROUND_SVG_PATH = path.join(ROOT, "assets", "brand", "vyay-badge-primary.svg");
const SPLASH_SVG_PATH = path.join(ROOT, "assets", "brand", "vyay-badge-english.svg");

const flatSvg = fs.readFileSync(SVG_PATH, "utf8");
// Foreground-only variant: strip the background rect so only the white glyph remains on a transparent canvas.
const glyphSvg = flatSvg.replace(/<rect[^>]*\/>/, "");
const roundSvg = fs.readFileSync(ROUND_SVG_PATH, "utf8");
const splashSvg = fs.readFileSync(SPLASH_SVG_PATH, "utf8");

const LAUNCHER_SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const FOREGROUND_SIZES = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };
const SPLASH_SIZES = { mdpi: 150, hdpi: 225, xhdpi: 300, xxhdpi: 450, xxxhdpi: 600 };

async function renderFlat(size) {
  return sharp(Buffer.from(flatSvg)).resize(size, size).png().toBuffer();
}

async function renderGlyph(size) {
  return sharp(Buffer.from(glyphSvg)).resize(size, size).png().toBuffer();
}

async function renderRound(size) {
  return sharp(Buffer.from(roundSvg)).resize(size, size).png().toBuffer();
}

async function renderSplash(width) {
  return sharp(Buffer.from(splashSvg)).resize(width, width).png().toBuffer();
}

async function writeFile(buffer, ...destParts) {
  const dest = path.join(...destParts);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
  console.log("wrote", path.relative(ROOT, dest));
}

async function main() {
  // assets/images sources used by app.json / future expo prebuild
  await writeFile(await renderFlat(1024), ROOT, "assets", "images", "icon.png");
  await writeFile(await renderGlyph(1024), ROOT, "assets", "images", "adaptive-icon.png");
  await writeFile(await renderSplash(1024), ROOT, "assets", "images", "splash-icon.png");

  const resDir = path.join(ROOT, "android", "app", "src", "main", "res");

  for (const [density, size] of Object.entries(LAUNCHER_SIZES)) {
    const mipmapDir = path.join(resDir, `mipmap-${density}`);
    const oldLauncher = path.join(mipmapDir, "ic_launcher.webp");
    const oldRound = path.join(mipmapDir, "ic_launcher_round.webp");
    const oldForeground = path.join(mipmapDir, "ic_launcher_foreground.webp");
    if (fs.existsSync(oldLauncher)) fs.unlinkSync(oldLauncher);
    if (fs.existsSync(oldRound)) fs.unlinkSync(oldRound);
    if (fs.existsSync(oldForeground)) fs.unlinkSync(oldForeground);

    await writeFile(await renderFlat(size), mipmapDir, "ic_launcher.png");
    await writeFile(await renderRound(size), mipmapDir, "ic_launcher_round.png");
    await writeFile(await renderGlyph(FOREGROUND_SIZES[density]), mipmapDir, "ic_launcher_foreground.png");
  }

  for (const [density, width] of Object.entries(SPLASH_SIZES)) {
    const drawableDir = path.join(resDir, `drawable-${density}`);
    await writeFile(await renderSplash(width), drawableDir, "splashscreen_logo.png");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
