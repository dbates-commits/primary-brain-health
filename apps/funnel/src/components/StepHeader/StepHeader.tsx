/**
 * Title + subtitle shown at the top of each funnel step. Uses an `h1` because
 * the page no longer carries its own heading — each step owns its title. The
 * title renders in Larken Thin (`font-thin`) to match the designs.
 */
export function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="font-headline text-4xl font-thin text-on-surface sm:text-5xl">
        {title}
      </h1>
      {subtitle ? <p className="text-xl text-on-surface">{subtitle}</p> : null}
    </div>
  );
}
