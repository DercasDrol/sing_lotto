// Script to generate PWA icons and OG image from SVG
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconSizes = [192, 512];
const iconSvgPath = path.join(__dirname, '../public/icon.svg');
const ogSvgPath = path.join(__dirname, '../public/og-image.svg');
const outputDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = fs.readFileSync(iconSvgPath);
  
  for (const size of iconSizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated: ${outputPath}`);
  }
}

async function generateOgImage() {
  const svgBuffer = fs.readFileSync(ogSvgPath);
  const outputPath = path.join(publicDir, 'og-image.png');
  
  await sharp(svgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  await generateIcons();
  await generateOgImage();
  console.log('All images generated successfully!');
}

main().catch(console.error);
