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
    slug: "salacia-villas-phu-my",
    title: "Salacia Villas Phú Mỹ",
    location: "Phú Mỹ, Bà Rịa — Vũng Tàu",
    area: "Bà Rịa — Vũng Tàu",
    developer: "Salacia Group",
    priceRange: "Liên hệ",
    status: "Đang mở bán",
    type: "Biệt thự nghỉ dưỡng",
    excerpt: "Khu biệt thự nghỉ dưỡng cao cấp ven biển tại Phú Mỹ, thiết kế theo phong cách resort sang trọng.",
    gradient: "from-blue-900 to-teal-800",
  },
  {
    slug: "ansana-by-kita",
    title: "Ansana by Kita",
    location: "Bình Dương",
    area: "Bình Dương",
    developer: "Kita Group",
    priceRange: "Từ 2.5 tỷ",
    status: "Đang mở bán",
    type: "Căn hộ cao cấp",
    excerpt: "Dự án căn hộ cao cấp với thiết kế xanh, tiện ích đẳng cấp tại trung tâm Bình Dương.",
    gradient: "from-emerald-900 to-green-800",
  },
  {
    slug: "lusso-sai-gon",
    title: "Lusso Sài Gòn",
    location: "TP. Hồ Chí Minh",
    area: "TP.HCM",
    developer: "Lusso Investments",
    priceRange: "Từ 5 tỷ",
    status: "Sắp mở bán",
    type: "Căn hộ hạng sang",
    excerpt: "Dự án căn hộ hạng sang tại vị trí đắc địa trung tâm TP.HCM, chuẩn mực sống quốc tế.",
    gradient: "from-purple-900 to-indigo-800",
  },
  {
    slug: "water-concept",
    title: "Water Concept",
    location: "Long An",
    area: "Long An",
    developer: "Water Concept JSC",
    priceRange: "Từ 1.8 tỷ",
    status: "Đang mở bán",
    type: "Nhà phố thương mại",
    excerpt: "Khu nhà phố thương mại ven sông, thiết kế độc đáo lấy cảm hứng từ nước.",
    gradient: "from-cyan-900 to-blue-800",
  },
  {
    slug: "the-quay-phuoc-hai",
    title: "The Quậy Phước Hải",
    location: "Phước Hải, Bà Rịa — Vũng Tàu",
    area: "Bà Rịa — Vũng Tàu",
    developer: "The Quậy Development",
    priceRange: "Từ 3 tỷ",
    status: "Đang mở bán",
    type: "Biệt thự biển",
    excerpt: "Khu nghỉ dưỡng biệt thự biển tại Phước Hải, tận hưởng không khí trong lành và sóng biển.",
    gradient: "from-sky-900 to-blue-700",
  },
  {
    slug: "thanh-phu-centre-point",
    title: "Thanh Phú Centre Point",
    location: "Bến Tre",
    area: "Đồng Nai — Bến Tre",
    developer: "Thanh Phú Group",
    priceRange: "Từ 1.5 tỷ",
    status: "Đang mở bán",
    type: "Đất nền trung tâm",
    excerpt: "Đất nền trung tâm hành chính tỉnh Bến Tre, tiềm năng tăng giá cao trong dài hạn.",
    gradient: "from-amber-900 to-orange-800",
  },
  {
    slug: "sun-group-cu-lao-pho",
    title: "Sun Group Cù Lao Phố",
    location: "Biên Hòa, Đồng Nai",
    area: "Đồng Nai",
    developer: "Sun Group",
    priceRange: "Liên hệ",
    status: "Sắp mở bán",
    type: "Khu phức hợp",
    excerpt: "Dự án phức hợp đẳng cấp của Sun Group tại đảo Cù Lao Phố, Biên Hòa — trải nghiệm sống khác biệt.",
    gradient: "from-yellow-900 to-amber-700",
  },
  {
    slug: "river-collection-an-gia",
    title: "River Collection An Gia",
    location: "TP. Hồ Chí Minh",
    area: "TP.HCM",
    developer: "An Gia Group",
    priceRange: "Từ 3.5 tỷ",
    status: "Đang mở bán",
    type: "Căn hộ ven sông",
    excerpt: "Căn hộ view sông thoáng đãng, chuẩn sống tinh tế giữa lòng thành phố.",
    gradient: "from-teal-900 to-cyan-800",
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
];

export const featuredProjects = projects.slice(0, 3);
export const remainingProjects = projects.slice(3);
