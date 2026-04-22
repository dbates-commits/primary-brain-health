"use client";

interface BenefitItem {
  title?: string;
  body?: string;
  icon?: string;
}

interface BenefitsListProps {
  headline?: string;
  subheadline?: string;
  items?: BenefitItem[];
}

export function BenefitsList({
  headline,
  subheadline,
  items = [],
}: BenefitsListProps) {
  return (
    <section
      data-scroll-reveal
      data-scroll-stagger="110"
      className="px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* Left: headline + tagline */}
        <div data-scroll-item className="lg:col-span-5">
          {headline && (
            <h2 className="font-headline font-normal text-on-surface text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-balance">
              {headline}
            </h2>
          )}
          {subheadline && (
            <p className="mt-3 text-base md:text-lg text-on-surface-variant text-pretty max-w-sm">
              {subheadline}
            </p>
          )}
        </div>

        {/* Right: list of benefits */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          {items.map((item, i) => (
            <div key={i} data-scroll-item className="flex items-start gap-4">
              {item.icon && (
                <span
                  aria-hidden="true"
                  className="block shrink-0 w-8 h-8 md:w-9 md:h-9 bg-on-surface translate-y-[0.15em]"
                  style={{
                    maskImage: `url(${item.icon})`,
                    WebkitMaskImage: `url(${item.icon})`,
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center",
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <h3 className="font-headline font-normal text-on-surface text-2xl md:text-3xl leading-[1.2] text-balance">
                    {item.title}
                  </h3>
                )}
                {item.body && (
                  <p className="mt-2 text-on-surface-variant text-base md:text-lg leading-relaxed text-pretty max-w-md">
                    {item.body}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
