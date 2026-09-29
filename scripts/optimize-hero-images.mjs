// Builds the homepage hero carousel's WebP files from the PNG banners in
// public/hero (1.png … 4.png): <n>.webp at up to 2048px and <n>-1024.webp for
// phones. The PNGs are the editable source (~2.3MB each); the WebPs are what
// the site serves (~70–200KB). A WebP is only regenerated when it is missing
// or older than its PNG, so replacing a banner PNG is all that's needed.
// Runs as part of `npm run build`, `npm run dev` and `npm start`; see
// site/content/media.ts#HERO_SLIDES. If a WebP is still missing, the carousel
// falls back to the PNG (hero-carousel.tsx).
import {existsSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = new URL('../public/hero/', import.meta.url);
const sizes = [{width: 2048, suffix: ''}, {width: 1024, suffix: '-1024'}];

for (const file of readdirSync(dir).filter((name) => /^\d+\.png$/i.test(name))) {
    const source = path.join(dir.pathname.replace(/^\/(\w:)/, '$1'), file);
    const base = source.replace(/\.png$/i, '');
    for (const {width, suffix} of sizes) {
        const target = `${base}${suffix}.webp`;
        if (existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs) continue;
        const info = await sharp(source).resize({width, withoutEnlargement: true}).webp({quality: 80}).toFile(target);
        console.log(`hero: ${path.basename(target)} ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
    }
}
