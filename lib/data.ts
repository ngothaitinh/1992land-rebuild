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
  id: string;
  order?: number;
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
  payment_policy?: { installment: string; percent: number; note?: string }[];
  discount?: string;
  bank_support?: string;
  grace_period?: string;
  product_types?: { name: string; area: string; price_range: string; available?: number; total?: number }[];
  nearby?: { name: string; distance: string; category: "school" | "hospital" | "mall" | "road" | "other" }[];
  highlights?: { title: string; desc: string }[];
  amenities_internal?: string[];
  amenities_external?: string[];
  amenities_images?: string[];
  overview_image?: string;
  location_image?: string;
  masterplan_image?: string;
  floor_plans?: { name: string; area: string; layout: string; image?: string }[];
  legal_status?: string;
  handover_date?: string;
  ownership?: string;
  construction_update?: string;
  scale?: string;
  hidden_sections?: string[];
  descriptions?: Record<string, string>;
};

export type Testimonial = {
  id: number;
  name: string;
  role: string;
  project: string;
  quote: string;
  initial: string;
};

export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  hero_image?: string;
  related_projects?: string[];
  body?: string;
  content?: PostBlock[];
};

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
