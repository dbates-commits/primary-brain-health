/** What each shape and each colour means. */
export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-text-secondary">
      <span className="flex items-center gap-2">
        <span className="size-3.5 rounded-full border border-grey-400" />
        Start
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3.5 rounded-full border-[3px] border-grey-400" />
        End
      </span>
      <span className="flex items-center gap-2">
        <span className="h-3.5 w-6 rounded border border-grey-400" />
        Step
      </span>
      <span className="flex items-center gap-2">
        <span className="size-3 rotate-45 rounded-[2px] border border-grey-400" />
        Decision
      </span>
      <span className="flex items-center gap-2">
        <span className="h-px w-6 bg-grey-500" />
        Flow of the journey
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0 w-6 border-t border-dashed border-brand-default" />
        Continues elsewhere, loops back, or runs in parallel
      </span>
      <span className="flex items-center gap-2">
        <span className="rounded-full border border-brand-default bg-brand-subtle px-1 text-[9px] text-brand-default">
          ✉
        </span>
        Sends an email
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-aqua-default" />◇ Planned
      </span>
      <span className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-error" />
        Blocked
      </span>
    </div>
  );
}
