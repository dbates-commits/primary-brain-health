/**
 * Flatten a Tina rich-text value to the words a customer would read.
 *
 * Rich-text fields hand back an MDX syntax tree, not a string, so anything that
 * inspects the copy — the banned-terms validate in the admin, the sweep over the
 * documents on disk — has to walk it first. Node shapes vary (`text`, `value`,
 * children of children), so this collects every string it recognises and joins
 * them with spaces: enough for a word-level scan, never used for rendering.
 *
 * Deliberately dependency-free. It is imported by the Tina schema (bundled for
 * the admin browser) and by a Node-side vitest sweep, and must work in both.
 */
export function richTextToPlainText(value: unknown): string {
  const collected: string[] = [];

  const walk = (node: unknown): void => {
    if (typeof node === "string") {
      collected.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") {
      return;
    }
    const record = node as Record<string, unknown>;
    // `text` on a text node; `value` on code blocks and raw MDX nodes. `alt`
    // and `title` carry customer-readable words on images and links.
    for (const key of ["text", "value", "alt", "title"]) {
      if (typeof record[key] === "string") {
        collected.push(record[key] as string);
      }
    }
    walk(record.children);
  };

  walk(value);
  return collected.join(" ");
}

/**
 * Whether a rich-text value actually holds words.
 *
 * A cleared field is not empty — Tina hands back a document containing an empty
 * paragraph, which is a truthy object. Anything deciding "is there copy here,
 * or do we fall back?" has to ask this rather than test the value itself, or a
 * customer ends up staring at an empty box where the agreement should be.
 */
export function hasRichTextContent(value: unknown): boolean {
  return richTextToPlainText(value).trim() !== "";
}
