// Plain-text conversion for meta descriptions and other previews.
//
// Rich text from the TipTap editor is stored as HTML. Slicing that HTML as a string leaves
// the tags in, which is how job shares ended up rendering "<p>Create 3D models…" in WhatsApp
// and in Google's snippet.
//
// This feeds metadata and previews ONLY. Pages keep rendering the original HTML through
// dangerouslySetInnerHTML inside their `prose` wrappers, so headings, lists, bold and
// paragraph formatting are untouched.

// Decoded in order, with &amp; LAST: decoding it earlier would turn "&amp;lt;" into "&lt;"
// and then into "<", inventing markup that was only ever literal text.
const HTML_ENTITIES: ReadonlyArray<readonly [string, string]> = [
  ["&nbsp;", " "],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", '"'],
  ["&#39;", "'"],
  ["&apos;", "'"],
  ["&amp;", "&"],
];

/**
 * Strip HTML to readable plain text.
 *
 * Tags become a space rather than being deleted, so block boundaries stay word breaks:
 * "<p>A</p><p>B</p>" gives "A B", not "AB".
 */
export function htmlToPlainText(html?: string | null): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  for (const [entity, char] of HTML_ENTITIES) {
    text = text.split(entity).join(char);
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Roughly what search engines and social cards display before cutting a description off. */
export const META_DESCRIPTION_MAX = 160;

/**
 * Build a meta description from rich text or plain text.
 *
 * Truncates on a word boundary and only appends an ellipsis when something was actually
 * removed — the previous `substring(0, 160) + "..."` cut mid-word and promised more text
 * even for descriptions well under the limit.
 */
export function toMetaDescription(
  html?: string | null,
  maxLength: number = META_DESCRIPTION_MAX,
): string {
  const text = htmlToPlainText(html);
  if (text.length <= maxLength) return text;

  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  const onWordBoundary = lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped;
  // Drop tidy-up punctuation left dangling by the cut before adding the ellipsis.
  return `${onWordBoundary.replace(/[\s.,;:!?-]+$/, "")}…`;
}
