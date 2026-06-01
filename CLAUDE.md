# 1992land Rebuild — Project Context

## Brand
1992 Land — môi giới BĐS HCMC. Tagline: "Giá Trị Kiến Tạo Lòng Tin"
Owner: Nguyễn Hữu Thọ, 0909474123, Thủ Đức.
Email: nguyenhuutho911@gmail.com
Zalo: zalo.me/0909474123 | Messenger: m.me/165126330021000

## Stack
Next.js 16 App Router, static export (`output: "export"`), Tailwind v4 (CSS config),
framer-motion, lucide-react. Deploy Cloudflare Pages → `out/` directory.

## Cấu trúc thực tế
- `app/` ở ROOT (không phải src/)
- `components/` ở ROOT
- `lib/data.ts` — static data (projects, testimonials, posts)
- Tailwind config: `globals.css` dùng `@theme`, KHÔNG có `tailwind.config.ts`
- tsconfig cần `"baseUrl": "."` để `@/*` resolve đúng

## Content nguồn
- `lib/data.ts` — 8 projects, 4 testimonials, 3 posts (static, chờ migrate từ WP)
- WP REST API 1992land.com trả 404 — cần wget hoặc manual copy

## Rules
- KHÔNG dùng client component nếu không cần state/effect
- KHÔNG over-abstract. Component < 150 dòng.
- KHÔNG dùng tone sales ("CỰC KỲ", "NHẤT THỊ TRƯỜNG")
- KHÔNG caps lock trong content
- Mọi link external có target="_blank" rel="noopener"
- Tiếng Việt là ngôn ngữ chính
- Font: Be Vietnam Pro (sans), Inter (numeric)
- Colors: navy-* và gold-* từ globals.css

## Deploy
`pnpm build` → `out/` → Cloudflare Pages
`wrangler.toml` đã có. `public/_redirects` đã có redirect từ WP URLs cũ.
