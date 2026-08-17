/**
 * Title + subtitle shown at the top of a form flow / step (the marketing booking
 * modal). Uses an `h1` because each step owns its title; the title renders in
 * Larken Thin (`font-thin`) to match the designs.
 */
export function StepHeader({
  title,
  subtitle,
  tinaFields,
}: {
  title: string;
  subtitle?: string;
  /**
   * Tina click-to-edit targets, one per rendered string. `Heading` and `Button`
   * take a single `data-tina-field` because they render one editable string;
   * this component owns two that are edited independently, so it takes the
   * `tinaFields` object shape the marketing blocks already use. Undefined
   * outside the CMS — the steps render this header on the live site too.
   */
  tinaFields?: { title?: string; subtitle?: string };
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1
        data-tina-field={tinaFields?.title}
        className="font-headline text-4xl font-thin text-on-surface sm:text-5xl"
      >
        {title}
      </h1>
      {subtitle ? (
        <p data-tina-field={tinaFields?.subtitle} className="text-xl text-on-surface">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
