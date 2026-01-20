const fs = require('fs');
const path = require('path');

(async () => {
  const imagemin = (await import('imagemin')).default;
  const imageminSvgo = (await import('imagemin-svgo')).default;
  const sharp = (await import('sharp')).default;

  const inputDir = 'img';
  const outputDir = 'dist/img';

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy non-image files first
  const nonImageFiles = ['manifest.json', 'browserconfig.xml'];
  nonImageFiles.forEach(file => {
    const srcPath = path.join(inputDir, file);
    const destPath = path.join(outputDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  // Get all image files
  const files = fs.readdirSync(inputDir);
  const imageFiles = files
    .filter(file => /\.(jpg|jpeg|png|svg|ico)$/i.test(file))
    .map(file => path.join(inputDir, file));

  // Process each image file
  for (const file of imageFiles) {
    const ext = path.extname(file).toLowerCase();
    const filename = path.basename(file);
    const outputPath = path.join(outputDir, filename);

    if (ext === '.svg') {
      // Optimize SVG files using imagemin-svgo
      const result = await imagemin([file], {
        plugins: [
          imageminSvgo({
            plugins: [
              {
                name: 'removeViewBox',
                active: false
              }
            ]
          })
        ]
      });
      if (result && result[0]) {
        fs.writeFileSync(outputPath, result[0].data);
      }
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      // Optimize raster images using sharp
      const image = sharp(file);
      const metadata = await image.metadata();

      if (ext === '.jpg' || ext === '.jpeg') {
        await image
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(outputPath);
      } else if (ext === '.png') {
        await image
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(outputPath);
      }
    } else if (ext === '.ico') {
      // Copy ICO files as-is (sharp doesn't handle ICO well)
      fs.copyFileSync(file, outputPath);
    }
  }

  console.log('Images optimized successfully!');
})().catch(error => {
  console.error('Error optimizing images:', error);
  process.exit(1);
});
