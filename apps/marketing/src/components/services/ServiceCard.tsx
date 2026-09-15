import { cn } from "@pbh/ui/utils";

import { STATUS_LABELS, type Service } from "./services-data";

const STATUS_STYLE: Record<Service["status"], string> = {
  "in-use": "border-brand-default text-brand-default",
  partly: "border-aqua-default text-aqua-default",
  "not-set-up": "border-border-strong text-text-secondary",
};

/** One service, told in the order somebody unfamiliar would ask. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border-default bg-background-default p-5">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold text-text-heading">{service.name}</h2>
        <span className="text-body-sm text-text-secondary">{service.kind}</span>
        <span
          className={cn(
            "ml-auto rounded-full border px-2 py-0.5 text-[11px]",
            STATUS_STYLE[service.status],
          )}
        >
          {STATUS_LABELS[service.status]}
        </span>
      </header>

      <p className="text-body text-text-default">{service.what}</p>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
            What we use it for
          </h3>
          <p className="mt-1 text-body-sm text-text-default">{service.weUseItFor}</p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
            Who owns it
          </h3>
          <p className="mt-1 text-body-sm text-text-default">{service.owner}</p>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
            Where it exists
          </h3>
          <dl className="mt-1 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1">
            {service.environments.map((environment) => (
              <div key={environment.name} className="contents">
                <dt className="text-body-sm text-text-secondary">{environment.name}</dt>
                <dd className="text-body-sm text-text-default">{environment.detail}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold tracking-wide text-text-secondary uppercase">
            If it stops working
          </h3>
          <p className="mt-1 text-body-sm text-text-default">{service.ifItBreaks}</p>
        </div>
      </div>

      <p className="mt-auto border-t border-border-subtle pt-3 text-[11px] text-text-tertiary">
        Settings live in{" "}
        <code className="rounded bg-background-warm px-1 py-0.5">{service.configuredIn}</code>
      </p>
    </article>
  );
}
