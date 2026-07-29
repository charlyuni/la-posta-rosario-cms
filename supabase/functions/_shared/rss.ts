export interface RssItem {
  titulo: string;
  link: string;
  descripcion: string;
  publicadoEn: string | null;
}

function extractTag(block: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i").exec(block);
  if (cdataMatch) return cdataMatch[1].trim();

  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!plainMatch) return "";

  return plainMatch[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** Parser mínimo de RSS 2.0 / Atom, suficiente para feeds de medios argentinos. */
export function parseFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];

  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  for (const block of itemBlocks) {
    const titulo = extractTag(block, "title");
    let link = extractTag(block, "link");
    if (!link) {
      const hrefMatch = /<link[^>]*href=["']([^"']+)["']/i.exec(block);
      link = hrefMatch?.[1] ?? "";
    }
    const descripcion = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");
    const publicadoEn = extractTag(block, "pubDate") || extractTag(block, "published") || null;

    if (titulo && link) {
      items.push({ titulo, link, descripcion, publicadoEn });
    }
  }

  return items;
}
