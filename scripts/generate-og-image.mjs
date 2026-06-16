import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '..', 'public', 'og-image.jpg');

const W = 1200, H = 630;

// SVG template — rendered by sharp/librsvg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B1F3A"/>
      <stop offset="100%" stop-color="#162E52"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Decorative gold lines -->
  <rect x="80" y="180" width="60" height="4" fill="#C9A961" rx="2"/>
  <rect x="80" y="196" width="30" height="4" fill="#C9A961" opacity="0.5" rx="2"/>

  <!-- Brand name -->
  <text x="80" y="290"
    font-family="Arial, sans-serif"
    font-size="88"
    font-weight="700"
    letter-spacing="6"
    fill="white">1992 LAND</text>

  <!-- Gold divider -->
  <rect x="80" y="318" width="480" height="3" fill="#C9A961" rx="1.5"/>

  <!-- Tagline -->
  <text x="80" y="380"
    font-family="Arial, sans-serif"
    font-size="34"
    font-weight="400"
    fill="#C9A961"
    letter-spacing="1">Giá Trị Kiến Tạo Lòng Tin</text>

  <!-- Subtitle -->
  <text x="80" y="430"
    font-family="Arial, sans-serif"
    font-size="24"
    fill="rgba(255,255,255,0.65)"
    letter-spacing="0.5">Môi giới BĐS · TP.HCM · Vũng Tàu · Bình Dương</text>

  <!-- Right accent block -->
  <rect x="980" y="0" width="8" height="${H}" fill="#C9A961" opacity="0.15"/>
  <rect x="988" y="0" width="4" height="${H}" fill="#C9A961" opacity="0.08"/>

  <!-- Bottom accent -->
  <rect x="0" y="${H - 6}" width="${W}" height="6" fill="#C9A961" opacity="0.4"/>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(OUT);

console.log(`✅ og-image.jpg → ${OUT}`);
