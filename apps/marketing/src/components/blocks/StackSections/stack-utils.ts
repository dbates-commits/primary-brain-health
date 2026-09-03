/** One bullet under a step's body copy. An object, not a bare string, so each
 *  line carries its own `data-tina-field` and stays click-to-edit in the CMS. */
export interface StackBulletItem {
  text?: string;
}

export interface StackItem {
  eyebrow?: string;
  title?: string;
  body?: string;
  bullets?: StackBulletItem[];
  image?: string;
}

export interface StackSectionsProps {
  label?: string;
  headline?: string;
  subheadline?: string;
  items?: StackItem[];
  tinaFields?: {
    label?: string;
    headline?: string;
    subheadline?: string;
  };
  /** The Tina data node for this block, used to resolve per-item field paths. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}
