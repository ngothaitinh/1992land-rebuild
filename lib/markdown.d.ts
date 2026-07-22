export type MdInline =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "link"; text: string; href: string };

export type MdBlock =
  | { type: "p"; inline: MdInline[]; lead: boolean }
  | { type: "h2"; inline: MdInline[] }
  | { type: "h3"; inline: MdInline[] }
  | { type: "ul"; items: MdInline[][] }
  | { type: "ol"; items: MdInline[][] }
  | { type: "img"; src: string; alt: string };

export function parseMarkdownBlocks(text: string | null | undefined): MdBlock[];
