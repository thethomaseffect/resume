const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE =
  'D:\\MEGA\\Camera Uploads\\ACTUAL PHOTOS AND SELFIES\\2024-11-09 21.02.21.jpg';
const OUT_DIR = path.join(__dirname, '..', 'public', 'images');

async function run() {
  if (!fs.existsSync(SOURCE)) {
    console.warn('Portrait source not found, skipping:', SOURCE);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const image = sharp(SOURCE).rotate();
  const meta = await image.metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) {
    throw new Error('Could not read portrait dimensions');
  }

  // After EXIF rotate the photo is portrait. Crop around the head.
  const cropWidth = Math.round(width * 0.92);
  const left = Math.round((width - cropWidth) / 2);
  const top = Math.round(height * 0.196);
  const cropHeight = Math.round(cropWidth * 1.22);

  const extract = {
    left,
    top,
    width: cropWidth,
    height: Math.min(cropHeight, height - top),
  };

  await image
    .clone()
    .extract(extract)
    .modulate({ brightness: 1.04, saturation: 1.06 })
    .sharpen()
    .jpeg({ quality: 90, mozjpeg: true })
    .resize(800)
    .toFile(path.join(OUT_DIR, 'portrait.jpg'));

  const squareSize = cropWidth;
  await sharp(SOURCE)
    .rotate()
    .extract({
      left: Math.round(width * 0.029),
      top: Math.round(height * 0.245),
      width: squareSize,
      height: squareSize,
    })
    .modulate({ brightness: 1.04, saturation: 1.06 })
    .sharpen()
    .jpeg({ quality: 90, mozjpeg: true })
    .resize(512, 512)
    .toFile(path.join(OUT_DIR, 'portrait-square.jpg'));

  console.log('Wrote portrait.jpg and portrait-square.jpg');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
