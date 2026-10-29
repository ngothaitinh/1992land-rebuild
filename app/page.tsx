import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { loadProjects, loadPosts } from "@/lib/loadData";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import Signature from "@/components/Signature";
import HomeHero from "@/components/home/HomeHero";
import HomeProjects from "@/components/home/HomeProjects";
import NewsList from "@/components/NewsList";
import { H2 } from "@/components/maia/ui";
import { legal, contact } from "@/lib/site-config";

const allProjects = loadProjects();
// Mới nhất trước (created_at giảm dần)
const projectsByDate = [...allProjects].sort((a, b) => {
  const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const tB = b.created_at ? new Date(b.created_at).getTime() : 0;
  return tB - tA;
});
const newest = projectsByDate[0];
const posts = loadPosts();

export default function Home() {
  return (
    <>
      <HomeHero project={newest} />
      <HomeProjects featured={newest} rest={projectsByDate.slice(1)} total={allProjects.length} />

      <section className="bg-navy-900 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <H2>Giá trị thật, lòng tin bền</H2>
            <Signature light className="mb-8 mt-8 max-w-[120px]" />
            <p className="mb-6 max-w-[60ch] leading-relaxed text-navy-50">
              1992 Land là chuyên trang dự án của {legal.name}, do {contact.name} — {contact.jobTitle.toLowerCase()} — phụ trách.
              Từ năm 2020 đến nay đã đồng hành cùng hơn 500 gia đình, từ căn hộ đầu tiên đến danh mục đầu tư thứ ba.
            </p>
            <p className="mb-10 max-w-[60ch] leading-relaxed text-navy-50">
              Anh Thọ tin rằng một giao dịch tốt không cần phải hối thúc. Khách hàng cần thời gian, thông tin thật và người tư vấn
              dám nói thẳng, kể cả khi câu trả lời là &ldquo;chưa phải lúc.&rdquo;
            </p>
            <Link href="/gioi-thieu" className="inline-flex min-h-12 items-center gap-2 border-b border-gold-300 text-base font-semibold text-gold-300 hover:text-gold-100">
              Tìm hiểu thêm về chúng tôi <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden lg:mx-0">
            <Image
              src="/images/team/nguyen-huu-tho-team.jpg"
              alt="Nguyễn Hữu Thọ và đội ngũ 1992 Land"
              fill
              className="origin-center scale-[3.3] object-cover object-[55%_50%]"
              sizes="448px"
            />
          </div>
        </div>
      </section>

      <section className="bg-navy-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <H2 className="!text-navy-900">Cập nhật thị trường</H2>
            <Link href="/tin-tuc" className="inline-flex min-h-12 items-center gap-2 text-base font-semibold text-navy-800 hover:text-navy-950">
              Xem tất cả tin tức <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <NewsList posts={posts} />
        </div>
      </section>

      <Testimonials />

      <section className="bg-navy-950 px-4 py-24 text-white sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="max-w-4xl text-balance text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
            Chúng tôi không bán nhà.
            <span className="block text-navy-200">Chúng tôi giúp bạn tìm đúng ngôi nhà.</span>
          </p>
          <div className="mt-10 flex items-center gap-4">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image src="/images/team/nguyen-huu-tho-portrait.png" alt="" fill className="object-cover object-top" sizes="40px" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Nguyễn Hữu Thọ</span>
              <span className="block text-xs text-navy-100">Giám đốc dự án · TPI Land</span>
            </span>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <H2 className="text-center">Sẵn sàng tìm ngôi nhà của bạn?</H2>
          <p className="mx-auto mt-5 max-w-xl text-center text-lg text-navy-50">
            Để lại thông tin, chuyên gia 1992 Land sẽ liên hệ trong vòng 30 phút trong giờ làm việc.
          </p>
          <div className="mt-10 bg-white p-6 sm:p-8">
            <ContactForm subject="[Lead] Tư vấn từ Trang chủ 1992land.com" />
            <p className="mt-4 text-center text-sm text-muted">
              Hoặc gọi trực tiếp:{" "}
              <a href={`tel:${contact.phone}`} className="font-semibold text-gold-700">{contact.phoneDisplay}</a>
              {" "}· 8:00 — 20:00, Thứ 2 — Chủ nhật
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
