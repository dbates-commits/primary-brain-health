/**
 * Which voice the page is speaking in.
 *
 * Its own module so the server-rendered pieces and the client toggle can share
 * it without either importing the other.
 */
export type Mode = "plain" | "technical";

export const MODE_OPTIONS: { label: string; value: Mode }[] = [
  { label: "Plain English", value: "plain" },
  { label: "Technical", value: "technical" },
];
