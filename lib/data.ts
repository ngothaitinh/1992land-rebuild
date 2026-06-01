export type Project = {
  slug: string;
  title: string;
  location: string;
  area: string;
  developer: string;
  priceRange: string;
  status: string;
  type: string;
  excerpt: string;
  gradient: string;
  // Extended fields — FINAL-PLAN 3.1
  id: string;
  project_type: "can-ho" | "biet-thu" | "dat-nen" | "nha-pho" | "nghi-duong" | "phuc-hop";
  city: "tp-hcm" | "vung-tau" | "binh-duong" | "long-an" | "dong-nai";
  district?: string;
  price_from?: number;
  price_to?: number;
  area_from?: number;
  area_to?: number;
  unit_count?: number;
  hero_image?: string;
  gallery?: string[];
  faq?: { q: string; a: string }[];
  lat?: number;
  lng?: number;
  address_full?: string;
  google_ads_campaign_id?: string;
  google_ads_conversion_label?: string;
  created_at?: string;
  updated_at?: string;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  project: string;
  quote: string;
  initial: string;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
};

export const projects: Project[] = [
  {
    id: "prj_salacia_villas",
    slug: "salacia-villas-phu-my",
    title: "Salacia Villas Phú Mỹ",
    location: "Phú Mỹ, Bà Rịa — Vũng Tàu",
    area: "Bà Rịa — Vũng Tàu",
    project_type: "nghi-duong",
    city: "vung-tau",
    district: "Thị xã Phú Mỹ",
    developer: "Salacia Group",
    priceRange: "Liên hệ",
    price_from: undefined,
    price_to: undefined,
    area_from: 200,
    area_to: 500,
    unit_count: 120,
    status: "Đang mở bán",
    type: "Biệt thự nghỉ dưỡng",
    excerpt: "Khu biệt thự nghỉ dưỡng cao cấp ven biển tại Phú Mỹ, thiết kế theo phong cách resort sang trọng.",
    gradient: "from-blue-900 to-teal-800",
    hero_image: "/images/projects/salacia-villas-phu-my/hero.webp",
    gallery: ["/images/projects/salacia-villas-phu-my/hero.webp","/images/projects/salacia-villas-phu-my/gallery-1.webp","/images/projects/salacia-villas-phu-my/gallery-2.jpg","/images/projects/salacia-villas-phu-my/gallery-3.jpg"],
    faq: [
      { q: "Salacia Villas Phú Mỹ ở đâu?", a: "Dự án tọa lạc tại Thị xã Phú Mỹ, Bà Rịa — Vũng Tàu, cách trung tâm TP.HCM khoảng 80km theo cao tốc Biên Hòa — Vũng Tàu." },
      { q: "Salacia Villas có mức giá như thế nào?", a: "Mức giá cụ thể theo từng sản phẩm, liên hệ 1992 Land để nhận báo giá chi tiết và chính sách ưu đãi hiện hành." },
      { q: "Pháp lý dự án Salacia Villas như thế nào?", a: "Dự án có đầy đủ pháp lý, sổ đỏ lâu dài. Anh Thọ sẽ hỗ trợ kiểm tra và tư vấn chi tiết miễn phí." },
    ],
    lat: 10.542,
    lng: 107.067,
    address_full: "Thị xã Phú Mỹ, Bà Rịa — Vũng Tàu",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_ansana_kita",
    slug: "ansana-by-kita",
    title: "Ansana by Kita",
    location: "Bình Dương",
    area: "Bình Dương",
    project_type: "can-ho",
    city: "binh-duong",
    district: "Thành phố Thuận An",
    developer: "Kita Group",
    priceRange: "Từ 2.5 tỷ",
    price_from: 2500000000,
    price_to: 5000000000,
    area_from: 55,
    area_to: 95,
    unit_count: 650,
    status: "Đang mở bán",
    type: "Căn hộ cao cấp",
    excerpt: "Dự án căn hộ cao cấp với thiết kế xanh, tiện ích đẳng cấp tại trung tâm Bình Dương.",
    gradient: "from-emerald-900 to-green-800",
    hero_image: "/images/projects/ansana-by-kita/hero.jpg",
    gallery: ["/images/projects/ansana-by-kita/hero.jpg","/images/projects/ansana-by-kita/gallery-1.jpg","/images/projects/ansana-by-kita/gallery-2.jpg","/images/projects/ansana-by-kita/gallery-3.jpg"],
    faq: [
      { q: "Ansana by Kita giá bao nhiêu?", a: "Giá từ 2.5 tỷ đồng cho căn hộ 1 phòng ngủ. Liên hệ để nhận bảng giá cập nhật nhất và chính sách thanh toán linh hoạt." },
      { q: "Ansana by Kita ở đâu?", a: "Dự án tọa lạc tại Thành phố Thuận An, Bình Dương — cách trung tâm TP.HCM 20km, thuận tiện di chuyển qua QL13 và Đại lộ Bình Dương." },
      { q: "Tiến độ bàn giao Ansana như thế nào?", a: "Dự kiến bàn giao năm 2027. Liên hệ 1992 Land để cập nhật tiến độ xây dựng mới nhất." },
    ],
    lat: 10.879,
    lng: 106.707,
    address_full: "Thành phố Thuận An, Bình Dương",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_lusso_sai_gon",
    slug: "lusso-sai-gon",
    title: "Lusso Sài Gòn",
    location: "TP. Hồ Chí Minh",
    area: "TP.HCM",
    project_type: "can-ho",
    city: "tp-hcm",
    district: "Quận 7",
    developer: "Lusso Investments",
    priceRange: "Từ 5 tỷ",
    price_from: 5000000000,
    price_to: 12000000000,
    area_from: 65,
    area_to: 150,
    unit_count: 480,
    status: "Sắp mở bán",
    type: "Căn hộ hạng sang",
    excerpt: "Dự án căn hộ hạng sang tại vị trí đắc địa trung tâm TP.HCM, chuẩn mực sống quốc tế.",
    gradient: "from-purple-900 to-indigo-800",
    hero_image: "/images/projects/lusso-sai-gon/hero.jpg",
    gallery: ["/images/projects/lusso-sai-gon/hero.jpg","/images/projects/lusso-sai-gon/gallery-1.jpg","/images/projects/lusso-sai-gon/gallery-2.jpg","/images/projects/lusso-sai-gon/gallery-3.jpg"],
    faq: [
      { q: "Lusso Sài Gòn giá bao nhiêu?", a: "Giá từ 5 tỷ đến 12 tỷ đồng tùy diện tích và tầng. Liên hệ 1992 Land để nhận bảng giá và chính sách ưu đãi ra hàng." },
      { q: "Lusso Sài Gòn ở đâu?", a: "Dự án tọa lạc tại Quận 7, TP. Hồ Chí Minh — vị trí trung tâm khu Nam Sài Gòn, gần Phú Mỹ Hưng." },
      { q: "Khi nào Lusso Sài Gòn mở bán?", a: "Dự án sắp mở bán chính thức. Đăng ký ngay để nhận thông tin ra hàng sớm nhất và ưu tiên chọn căn đẹp." },
    ],
    lat: 10.736,
    lng: 106.722,
    address_full: "Quận 7, TP. Hồ Chí Minh",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_water_concept",
    slug: "water-concept",
    title: "Water Concept",
    location: "Long An",
    area: "Long An",
    project_type: "nha-pho",
    city: "long-an",
    district: "Huyện Cần Đước",
    developer: "Water Concept JSC",
    priceRange: "Từ 1.8 tỷ",
    price_from: 1800000000,
    price_to: 3500000000,
    area_from: 80,
    area_to: 150,
    unit_count: 300,
    status: "Đang mở bán",
    type: "Nhà phố thương mại",
    excerpt: "Khu nhà phố thương mại ven sông, thiết kế độc đáo lấy cảm hứng từ nước.",
    gradient: "from-cyan-900 to-blue-800",
    hero_image: "/images/projects/water-concept/hero.jpg",
    gallery: ["/images/projects/water-concept/hero.jpg"],
    faq: [
      { q: "Water Concept Long An giá bao nhiêu?", a: "Giá từ 1.8 tỷ đến 3.5 tỷ đồng tùy diện tích mặt tiền và vị trí trong dự án. Liên hệ để nhận bảng giá chi tiết." },
      { q: "Water Concept ở đâu tại Long An?", a: "Dự án tọa lạc tại Huyện Cần Đước, Long An — cách TP.HCM 30km theo hướng Cần Giuộc." },
      { q: "Pháp lý Water Concept như thế nào?", a: "Đất nền sổ đỏ riêng từng lô, pháp lý đầy đủ. Liên hệ 1992 Land để được xem hồ sơ pháp lý trực tiếp." },
    ],
    lat: 10.638,
    lng: 106.627,
    address_full: "Huyện Cần Đước, Long An",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_the_quay",
    slug: "the-quay-phuoc-hai",
    title: "The Quậy Phước Hải",
    location: "Phước Hải, Bà Rịa — Vũng Tàu",
    area: "Bà Rịa — Vũng Tàu",
    project_type: "nghi-duong",
    city: "vung-tau",
    district: "Huyện Đất Đỏ",
    developer: "The Quậy Development",
    priceRange: "Từ 3 tỷ",
    price_from: 3000000000,
    price_to: 8000000000,
    area_from: 120,
    area_to: 350,
    unit_count: 200,
    status: "Đang mở bán",
    type: "Biệt thự biển",
    excerpt: "Khu nghỉ dưỡng biệt thự biển tại Phước Hải, tận hưởng không khí trong lành và sóng biển.",
    gradient: "from-sky-900 to-blue-700",
    hero_image: "/images/projects/the-quay-phuoc-hai/hero.jpg",
    gallery: ["/images/projects/the-quay-phuoc-hai/hero.jpg","/images/projects/the-quay-phuoc-hai/gallery-1.jpg","/images/projects/the-quay-phuoc-hai/gallery-2.jpg","/images/projects/the-quay-phuoc-hai/gallery-3.jpg","/images/projects/the-quay-phuoc-hai/gallery-4.jpg"],
    faq: [
      { q: "The Quậy Phước Hải giá bao nhiêu?", a: "Giá từ 3 tỷ đến 8 tỷ đồng tùy vị trí và diện tích biệt thự. Liên hệ để nhận báo giá và tham quan thực tế dự án." },
      { q: "The Quậy ở đâu?", a: "Dự án tọa lạc tại bãi biển Phước Hải, Huyện Đất Đỏ, Bà Rịa — Vũng Tàu — một trong những bãi biển đẹp và yên tĩnh nhất khu vực." },
      { q: "Tiềm năng đầu tư The Quậy như thế nào?", a: "Phước Hải đang trong quy hoạch phát triển du lịch trọng điểm của tỉnh Bà Rịa — Vũng Tàu. Tiềm năng tăng giá và khai thác cho thuê nghỉ dưỡng rất tốt." },
    ],
    lat: 10.428,
    lng: 107.469,
    address_full: "Bãi biển Phước Hải, Huyện Đất Đỏ, Bà Rịa — Vũng Tàu",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_thanh_phu",
    slug: "thanh-phu-centre-point",
    title: "Thanh Phú Centre Point",
    location: "Bến Tre",
    area: "Đồng Nai",
    project_type: "dat-nen",
    city: "dong-nai",
    district: "TP. Bến Tre",
    developer: "Thanh Phú Group",
    priceRange: "Từ 1.5 tỷ",
    price_from: 1500000000,
    price_to: 3000000000,
    area_from: 80,
    area_to: 200,
    unit_count: 450,
    status: "Đang mở bán",
    type: "Đất nền trung tâm",
    excerpt: "Đất nền trung tâm hành chính tỉnh Bến Tre, tiềm năng tăng giá cao trong dài hạn.",
    gradient: "from-amber-900 to-orange-800",
    hero_image: "/images/projects/thanh-phu-centre-point/hero.png",
    gallery: ["/images/projects/thanh-phu-centre-point/hero.png","/images/projects/thanh-phu-centre-point/gallery-1.webp"],
    faq: [
      { q: "Thanh Phú Centre Point giá bao nhiêu?", a: "Giá từ 1.5 tỷ đến 3 tỷ đồng tùy vị trí lô đất. Liên hệ 1992 Land để nhận bảng giá và bản đồ vị trí từng lô." },
      { q: "Thanh Phú Centre Point ở đâu?", a: "Dự án tọa lạc tại trung tâm TP. Bến Tre, đối diện các công trình hành chính tỉnh — vị trí đắc địa nhất khu vực." },
      { q: "Pháp lý đất nền Thanh Phú như thế nào?", a: "Sổ đỏ riêng từng lô, pháp lý rõ ràng. Thích hợp cho cả mục đích ở thực và đầu tư dài hạn." },
    ],
    lat: 10.235,
    lng: 106.375,
    address_full: "TP. Bến Tre, tỉnh Bến Tre",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_sun_group_cu_lao",
    slug: "sun-group-cu-lao-pho",
    title: "Sun Group Cù Lao Phố",
    location: "Biên Hòa, Đồng Nai",
    area: "Đồng Nai",
    project_type: "phuc-hop",
    city: "dong-nai",
    district: "TP. Biên Hòa",
    developer: "Sun Group",
    priceRange: "Liên hệ",
    area_from: 150,
    area_to: 1000,
    unit_count: 800,
    status: "Sắp mở bán",
    type: "Khu phức hợp",
    excerpt: "Dự án phức hợp đẳng cấp của Sun Group tại đảo Cù Lao Phố, Biên Hòa — trải nghiệm sống khác biệt.",
    gradient: "from-yellow-900 to-amber-700",
    hero_image: "/images/projects/sun-group-cu-lao-pho/hero.jpg",
    gallery: ["/images/projects/sun-group-cu-lao-pho/hero.jpg","/images/projects/sun-group-cu-lao-pho/gallery-1.jpg","/images/projects/sun-group-cu-lao-pho/gallery-2.jpg","/images/projects/sun-group-cu-lao-pho/gallery-3.jpg","/images/projects/sun-group-cu-lao-pho/gallery-4.jpg"],
    faq: [
      { q: "Sun Group Cù Lao Phố là dự án gì?", a: "Đây là khu phức hợp nghỉ dưỡng và đô thị đẳng cấp của Sun Group tọa lạc trên đảo Cù Lao Phố giữa sông Đồng Nai, TP. Biên Hòa." },
      { q: "Khi nào Sun Group Cù Lao Phố mở bán?", a: "Dự án sắp mở bán chính thức. Đăng ký ngay để nhận thông tin ra hàng và ưu tiên chọn vị trí đẹp." },
      { q: "Tiềm năng đầu tư Sun Group Cù Lao Phố như thế nào?", a: "Biên Hòa là đô thị vệ tinh của TP.HCM với hạ tầng đang phát triển mạnh. Dự án Sun Group trên đảo là cơ hội hiếm có về bất động sản đảo tại miền Nam." },
    ],
    lat: 10.947,
    lng: 106.858,
    address_full: "Đảo Cù Lao Phố, TP. Biên Hòa, Đồng Nai",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
  {
    id: "prj_river_collection",
    slug: "river-collection-an-gia",
    title: "River Collection An Gia",
    location: "TP. Hồ Chí Minh",
    area: "TP.HCM",
    project_type: "can-ho",
    city: "tp-hcm",
    district: "Quận 7",
    developer: "An Gia Group",
    priceRange: "Từ 3.5 tỷ",
    price_from: 3500000000,
    price_to: 7000000000,
    area_from: 55,
    area_to: 110,
    unit_count: 900,
    status: "Đang mở bán",
    type: "Căn hộ ven sông",
    excerpt: "Căn hộ view sông thoáng đãng, chuẩn sống tinh tế giữa lòng thành phố.",
    gradient: "from-teal-900 to-cyan-800",
    hero_image: "/images/projects/river-collection-an-gia/hero.jpg",
    gallery: ["/images/projects/river-collection-an-gia/hero.jpg","/images/projects/river-collection-an-gia/gallery-1.jpg","/images/projects/river-collection-an-gia/gallery-2.jpg","/images/projects/river-collection-an-gia/gallery-3.jpg"],
    faq: [
      { q: "River Collection An Gia giá bao nhiêu?", a: "Giá từ 3.5 tỷ đến 7 tỷ đồng tùy tầng và view. Căn view sông giá cao hơn khoảng 10-15%. Liên hệ để nhận bảng giá mới nhất." },
      { q: "River Collection ở đâu?", a: "Dự án tọa lạc tại Quận 7, TP. Hồ Chí Minh — ven sông Sài Gòn, gần khu đô thị Phú Mỹ Hưng và cầu Phú Mỹ." },
      { q: "Tiến độ bàn giao River Collection như thế nào?", a: "Dự kiến bàn giao trong năm 2027. Tiến độ xây dựng đảm bảo theo cam kết hợp đồng." },
    ],
    lat: 10.728,
    lng: 106.735,
    address_full: "Quận 7, TP. Hồ Chí Minh",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Anh Khánh",
    role: "Nhà đầu tư",
    project: "Salacia Villas Phú Mỹ",
    quote: "Anh Thọ tư vấn rất tận tình và am hiểu thị trường. Từ lúc tìm hiểu đến khi ký hợp đồng, mình luôn được hỗ trợ đầy đủ thông tin. Yên tâm hoàn toàn.",
    initial: "K",
  },
  {
    id: 2,
    name: "Anh Tùng",
    role: "Mua để ở",
    project: "River Collection An Gia",
    quote: "Tôi rất hài lòng với dịch vụ của 1992 Land. Họ giúp tôi tìm được căn hộ đúng nhu cầu và ngân sách, không hề ép mua hay chạy theo hoa hồng.",
    initial: "T",
  },
  {
    id: 3,
    name: "Chị Vân",
    role: "Nhà đầu tư",
    project: "Ansana by Kita",
    quote: "Đội ngũ 1992 Land rất chuyên nghiệp. Họ phân tích tiềm năng dự án rõ ràng, giúp mình ra quyết định đầu tư tự tin hơn. Kết quả rất tốt.",
    initial: "V",
  },
  {
    id: 4,
    name: "Chị Ngân",
    role: "Mua để ở",
    project: "Lusso Sài Gòn",
    quote: "Lần đầu mua nhà nên rất lo về thủ tục pháp lý. May mắn gặp được anh Thọ — anh hướng dẫn từng bước, giải thích rõ ràng, cảm giác an tâm từ đầu đến cuối.",
    initial: "N",
  },
];

export const posts: Post[] = [
  {
    slug: "thi-truong-bds-hcmc-2026",
    title: "Thị trường bất động sản TP.HCM năm 2026: Cơ hội và thách thức",
    excerpt: "Phân tích toàn cảnh thị trường BĐS TP.HCM năm 2026 — phân khúc nào đang tăng trưởng, khu vực nào tiềm năng nhất cho nhà đầu tư.",
    date: "2026-05-20",
    category: "Thị trường",
    readTime: "5 phút đọc",
  },
  {
    slug: "dau-tu-bds-bien-vung-tau",
    title: "Đầu tư BĐS biển Vũng Tàu: Những điều cần biết trước khi xuống tiền",
    excerpt: "BĐS biển Vũng Tàu đang thu hút nhiều nhà đầu tư. Bài viết tổng hợp những yếu tố quan trọng cần cân nhắc kỹ trước khi quyết định đầu tư.",
    date: "2026-05-15",
    category: "Đầu tư",
    readTime: "7 phút đọc",
  },
  {
    slug: "phap-ly-can-ho-nhung-dieu-can-biet",
    title: "Pháp lý căn hộ chung cư: Những điều người mua cần biết để tránh rủi ro",
    excerpt: "Hướng dẫn kiểm tra pháp lý căn hộ chung cư từ A đến Z — sổ hồng, hợp đồng mua bán, biên bản bàn giao và các điểm quan trọng không được bỏ qua.",
    date: "2026-05-08",
    category: "Pháp lý",
    readTime: "10 phút đọc",
  },
  {
    slug: "mua-nha-lan-dau-sai-lam-can-tranh",
    title: "Mua nhà lần đầu: 7 sai lầm phổ biến và cách tránh hoàn toàn",
    excerpt: "Người mua nhà lần đầu thường mắc những lỗi có thể tránh được — từ bỏ qua kiểm tra pháp lý, đến bị cuốn theo cảm xúc khi chọn căn. Anh Thọ chia sẻ thẳng những gì anh đã thấy sau 5 năm tư vấn.",
    date: "2026-05-01",
    category: "Kinh nghiệm",
    readTime: "8 phút đọc",
  },
  {
    slug: "can-ho-hay-nha-pho-nen-mua-cai-nao",
    title: "Căn hộ hay nhà phố: Nên chọn cái nào cho phù hợp?",
    excerpt: "Không có câu trả lời đúng cho tất cả — mà chỉ có câu trả lời phù hợp với từng người. Bài viết giúp bạn phân tích theo 4 tiêu chí: ngân sách, mục đích, lối sống và kế hoạch dài hạn.",
    date: "2026-04-22",
    category: "Kinh nghiệm",
    readTime: "6 phút đọc",
  },
  {
    slug: "thu-duc-tiem-nang-bds-2026",
    title: "Thủ Đức 2026: Tại sao đây vẫn là vùng đất tiềm năng nhất TP.HCM?",
    excerpt: "Thành phố Thủ Đức đang trong giai đoạn chuyển mình mạnh nhất từ trước đến nay. Hạ tầng, khu công nghệ và quỹ đất còn lại — tại sao giá BĐS khu vực này vẫn còn dư địa tăng?",
    date: "2026-04-15",
    category: "Thị trường",
    readTime: "7 phút đọc",
  },
  {
    slug: "dong-tien-bds-tinh-the-nao",
    title: "Dòng tiền BĐS: Cách tính đơn giản để biết một dự án có thực sự sinh lời không",
    excerpt: "Nhiều người mua BĐS đầu tư mà không tính được dòng tiền thực. Bài viết hướng dẫn 3 chỉ số cơ bản — yield, ROI và thời gian hoàn vốn — và cách áp dụng vào các dự án tại Vũng Tàu, Bình Dương.",
    date: "2026-04-05",
    category: "Đầu tư",
    readTime: "9 phút đọc",
  },
  {
    slug: "biet-thu-nghi-duong-co-nen-mua-khong",
    title: "Biệt thự nghỉ dưỡng: Cơ hội đầu tư hay bẫy lãi suất ngân hàng?",
    excerpt: "Biệt thự nghỉ dưỡng hấp dẫn vì cam kết lợi nhuận cao — nhưng có những rủi ro ẩn mà brochure không bao giờ nói. Đây là phân tích thẳng thắn từ góc độ người tư vấn.",
    date: "2026-03-28",
    category: "Đầu tư",
    readTime: "8 phút đọc",
  },
  {
    slug: "quy-trinh-chuyen-nhuong-bds-tung-buoc",
    title: "Quy trình chuyển nhượng bất động sản từ A đến Z — bản đồ đầy đủ",
    excerpt: "Từ đặt cọc đến ra sổ, mỗi bước đều có rủi ro nếu không biết. Bài viết mô tả toàn bộ quy trình pháp lý một giao dịch BĐS tại TP.HCM — bao gồm thời gian, phí và những điểm cần chú ý.",
    date: "2026-03-15",
    category: "Pháp lý",
    readTime: "12 phút đọc",
  },
];

export const featuredProjects = projects.slice(0, 3);
export const remainingProjects = projects.slice(3);
