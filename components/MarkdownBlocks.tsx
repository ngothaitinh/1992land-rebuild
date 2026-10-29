import type { MdBlock, MdInline } from "@/lib/markdown";

function InlineNodes({ inline }: { inline: MdInline[] }) {
  return (
    <>
      {inline.map((node, i) => {
        if (node.type === "bold") {
          return (
            <strong key={i} className="font-bold text-navy-900">
              {node.text}
            </strong>
          );
        }
        if (node.type === "italic") {
          return (
            <em key={i} className="italic">
              {node.text}
            </em>
          );
        }
        if (node.type === "link") {
          return (
            <a
              key={i}
              href={node.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-600 underline underline-offset-2 hover:text-gold-500"
            >
              {node.text}
            </a>
          );
        }
        return <span key={i}>{node.text}</span>;
      })}
    </>
  );
}

type Variant = "section" | "article";

// Hai bối cảnh typography khác nhau dùng chung một bộ render:
// - "section": nằm trong ProjectDetailView, nơi SecHead đã chiếm <h2> của mục,
//   nên heading nội dung tụt một cấp thành h3/h4.
// - "article": thân bài viết, "## " phải ra <h2> thật để đúng cấu trúc tài liệu.
export default function MarkdownBlocks({
  blocks,
  variant = "section",
}: {
  blocks: MdBlock[];
  variant?: Variant;
}) {
  const article = variant === "article";

  return (
    <div className={article ? "space-y-5 text-[15px]" : "space-y-4 max-w-[72ch]"}>
      {blocks.map((block, i) => {
        if (block.type === "p") {
          if (article) {
            return (
              <p key={i} className="leading-[1.85] text-ink">
                <InlineNodes inline={block.inline} />
              </p>
            );
          }
          return (
            <p
              key={i}
              className={
                block.lead
                  ? "text-[15.5px] font-[450] text-navy-800 leading-[1.88]"
                  : "text-[14.5px] text-navy-600 leading-[1.88]"
              }
            >
              <InlineNodes inline={block.inline} />
            </p>
          );
        }

        if (block.type === "h2") {
          if (article) {
            return (
              <h2 key={i} className="font-display text-2xl font-bold text-navy-900 mt-10 mb-4 tracking-tight">
                <InlineNodes inline={block.inline} />
              </h2>
            );
          }
          return (
            <h3 key={i} className="font-display text-lg font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h3>
          );
        }

        if (block.type === "h3") {
          if (article) {
            return (
              <h3 key={i} className="font-display text-xl font-bold text-navy-900 mt-8 mb-3 tracking-tight">
                <InlineNodes inline={block.inline} />
              </h3>
            );
          }
          return (
            <h4 key={i} className="font-display text-base font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h4>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={i} className="border-l-4 border-gold-500 pl-6 py-2 my-6 bg-gold-50 rounded-r-xl">
              <p className="text-navy-800 font-medium italic leading-relaxed">
                <InlineNodes inline={block.inline} />
              </p>
            </blockquote>
          );
        }

        if (block.type === "ul") {
          if (article) {
            return (
              <ul key={i} className="space-y-3 my-4">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 items-start">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                    <span className="leading-relaxed">
                      <InlineNodes inline={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <ul key={i} className="list-disc pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]">
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineNodes inline={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ol") {
          return (
            <ol
              key={i}
              className={
                article
                  ? "list-decimal pl-5 space-y-3 my-4 leading-relaxed marker:text-gold-500 marker:font-semibold"
                  : "list-decimal pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]"
              }
            >
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineNodes inline={item} />
                </li>
              ))}
            </ol>
          );
        }

        // block.type === "img" — user-uploaded, arbitrary aspect ratio, no
        // known intrinsic size at build time, so a plain <img> instead of
        // next/image (which requires width/height or a sized parent).
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-2xl border border-border-soft object-cover"
          />
        );
      })}
    </div>
  );
}
