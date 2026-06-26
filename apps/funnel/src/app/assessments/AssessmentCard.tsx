import { cn } from "@pbh/ui";
import { AssessmentModalButton } from "./AssessmentModalButton";
import type { EnrollmentView } from "./register-and-enroll";

/**
 * A single assessment row from the Figma "Welcome Back" design: title +
 * description + info link on the left, duration + "Start Assessment" CTA on the
 * right. `highlighted` renders the teal-bordered "Start Here" treatment.
 */
export function AssessmentCard({
  enrollment,
  highlighted = false,
}: {
  enrollment: EnrollmentView;
  highlighted?: boolean;
}) {
  const { name, description, duration, infoUrl, redirect } = enrollment;

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-xl border p-6 sm:flex-row sm:items-center sm:gap-6",
        highlighted
          ? "border-primary bg-primary/[0.03]"
          : "border-[#d8d8d8] bg-white",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-2xl font-thin text-on-surface sm:text-[2rem] sm:leading-tight">
            {name}
          </h3>
          {description && (
            <p className="font-body text-lg font-light text-on-surface-variant">
              {description}
            </p>
          )}
        </div>
        {/* Placeholder link until each assessment has a real info URL. */}
        <a
          href={infoUrl ?? "#"}
          {...(infoUrl
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-sm text-primary underline decoration-from-font"
        >
          Assessment Information
        </a>
      </div>

      <div className="flex flex-col items-stretch justify-center gap-2.5 sm:shrink-0 sm:items-center">
        {duration && (
          <p className="text-center text-sm font-light text-on-surface-variant whitespace-nowrap">
            {duration}
          </p>
        )}
        <AssessmentModalButton redirect={redirect} name={name} />
      </div>
    </div>
  );
}
