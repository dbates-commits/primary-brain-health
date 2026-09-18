/**
 * The types behind the HubSpot comparison, kept apart from the data itself so
 * the data file reads as prose rather than as a schema.
 *
 * Client-safe and dependency-free: the page is a server component but the
 * toggle is not, so everything here has to cross that line.
 */

/** Which way a row actually falls, once the honest version is written down. */
export type Verdict = "ours" | "hubspot" | "even" | "depends";

/**
 * The same claim, said twice.
 *
 * Not a summary and its detail — two whole sentences that mean the same thing,
 * so the toggle swaps one for another rather than revealing more. `plain`
 * assumes no vocabulary at all; `technical` may name a product, a tier or a
 * file.
 */
export type Claim = {
  plain: string;
  technical: string;
};

export type Side = {
  /**
   * The scannable cell: a few words, and the only thing the table shows before
   * a row is opened.
   *
   * Deliberately not a {@link Claim} — it stays plain whichever mode the page
   * is in. Somebody running an eye down the table is looking for shape, not
   * detail, and a summary that changed under the toggle would just make the
   * column jump without telling them anything new.
   */
  summary: string;
  claim: Claim;
  pros: string[];
  cons: string[];
};

/**
 * Where a claim comes from.
 *
 * An external URL, or a repo-relative path when the claim is about our own
 * code. Every row carries at least one — this is the document where an
 * unsourced number gets challenged, and the services page next door earned its
 * credibility exactly this way.
 */
export type Source = {
  label: string;
  href: string;
  /** True for a vendor's own page — cited, but not neutral. */
  vendor?: boolean;
};

export type Dimension = {
  id: string;
  name: string;
  /** Why the row is on the page at all. One line, no jargon. */
  whyItMatters: string;
  ours: Side;
  hubspot: Side;
  verdict: Verdict;
  /** The sentence to say out loud if somebody asks about this row. */
  takeaway: string;
  /**
   * Something the repository does not know, written as a question for a person
   * rather than guessed at. Rendered as its own line so it cannot be mistaken
   * for a finding.
   */
  toConfirm?: string;
  sources: Source[];
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  ours: "What we have wins",
  hubspot: "HubSpot wins",
  even: "Much the same",
  depends: "Depends on the call",
};

/** The closing caveat, and where its numbers come from. */
export type Caveat = {
  text: string;
  sources: Source[];
};

/** A named site, and the one thing it is evidence of. */
export type Example = {
  name: string;
  /** What it runs on, in the fewest words that are still true. */
  runs: string;
  /** Why this particular name is worth saying to this particular room. */
  soWhat: string;
  href: string;
  /**
   * How we know. "Checked live" means the response headers said so on
   * 18 September 2026; "vendor" means one of the two companies claims it.
   */
  evidence: "checked-live" | "vendor";
};
