import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const dirs = [
  path.join(root, "Products"),
  path.join(root, "assets", "brand"),
];

let converted = 0;
let savedBytes = 0;

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir)) {
    if (!file.toLowerCase().endsWith(".png")) continue;

    const input = path.join(dir, file);
    const webpOut = path.join(dir, file.replace(/\.png$/i, ".webp"));
    const jpgOut = path.join(dir, file.replace(/\.png$/i, ".jpg"));

    const inputSize = fs.statSync(input).size;

    await sharp(input).webp({ quality: 82, effort: 6 }).toFile(webpOut);
    await sharp(input).jpeg({ quality: 85, mozjpeg: true }).toFile(jpgOut);

    const webpSize = fs.statSync(webpOut).size;
    const jpgSize = fs.statSync(jpgOut).size;

    savedBytes += inputSize - webpSize;
    converted++;

    console.log(
      `${path.relative(root, input)} → webp ${(webpSize / 1024).toFixed(0)}KB, jpg ${(jpgSize / 1024).toFixed(0)}KB (was ${(inputSize / 1024 / 1024).toFixed(1)}MB)`
    );
  }
}

console.log(`\nConverted ${converted} images. WebP saves ~${(savedBytes / 1024 / 1024).toFixed(1)}MB total.`);
