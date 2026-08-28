"use client";

import type { ReactNode } from "react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import { hasRichTextContent } from "@/lib/rich-text";

/**
 * The CMS-authored consent agreement, rendered into the consent step's
 * scrolling box.
 *
 * Returns `null` when the field holds no words, so a caller that renders this
 * unconditionally still can't put an empty agreement in front of a customer —
 * though callers should also check `hasRichTextContent` themselves, since
 * `ConsentForm` falls back to the code-owned terms only when its `terms` prop
 * is absent, not when it renders to nothing.
 *
 * The overrides below deliberately reproduce the code-owned terms' type scale
 * rather than inheriting a prose default: an agreement that changed size and
 * spacing depending on where the words came from would read as two different
 * documents.
 *
 * Each override renders `children` explicitly and spreads nothing — Tina passes
 * the rendered children as React children and the node's own fields (`type`,
 * `_content_source`) as props, so spreading leaks those onto the DOM.
 */
export function ConsentTerms({ content }: { content?: unknown }) {
  if (!hasRichTextContent(content)) {
    return null;
  }

  return (
    <TinaMarkdown
      content={content as TinaMarkdownContent}
      components={{
        p: (props?: { children?: ReactNode }) => (
          <p className="text-body-sm leading-normal text-grey-700">
            {props?.children}
          </p>
        ),
        // Headings render at body size, bold — the code-owned terms number
        // their sections rather than scaling them up, and a legal document that
        // suddenly grows 32px type reads as a different page.
        h1: (props?: { children?: ReactNode }) => (
          <p className="text-body-sm font-bold text-grey-900">{props?.children}</p>
        ),
        h2: (props?: { children?: ReactNode }) => (
          <p className="text-body-sm font-bold text-grey-900">{props?.children}</p>
        ),
        h3: (props?: { children?: ReactNode }) => (
          <p className="text-body-sm font-bold text-grey-900">{props?.children}</p>
        ),
        ul: (props?: { children?: ReactNode }) => (
          <ul className="flex list-disc flex-col gap-2 pl-5 text-body-sm leading-normal text-grey-700">
            {props?.children}
          </ul>
        ),
        ol: (props?: { children?: ReactNode }) => (
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-sm leading-normal text-grey-700">
            {props?.children}
          </ol>
        ),
        a: (props?: { url?: string; children?: ReactNode }) => (
          <a
            className="text-brand-default underline"
            href={props?.url}
            // Terms routinely link out to a privacy policy; opening in place
            // would lose a booking mid-flow.
            target="_blank"
            rel="noreferrer"
          >
            {props?.children}
          </a>
        ),
      }}
    />
  );
}
