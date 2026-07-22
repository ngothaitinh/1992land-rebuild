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

// Headings here render as h3/h4 (not h2) — SecHead in ProjectDetailView already
// owns the section's h2, so content headings sit one level below it.
export default function MarkdownBlocks({ blocks }: { blocks: MdBlock[] }) {
  return (
    <div className="space-y-4 max-w-[72ch]">
      {blocks.map((block, i) => {
        if (block.type === "p") {
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
          return (
            <h3 key={i} className="text-lg font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h3>
          );
        }
        if (block.type === "h3") {
          return (
            <h4 key={i} className="text-base font-bold text-navy-900 pt-2">
              <InlineNodes inline={block.inline} />
            </h4>
          );
        }
        if (block.type === "ul") {
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
            <ol key={i} className="list-decimal pl-5 space-y-1 text-[14.5px] text-navy-600 leading-[1.7]">
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
