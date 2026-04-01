export interface TinaFieldsMap {
  headline?: string;
  subheadline?: string;
  badge?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export interface HeroProps {
  variant?: "centered" | "split" | "splitReverse" | "fullImage" | "brainMask" | "video" | "gradient";
  theme?: "light" | "dark" | "primary" | "secondary";
  headline?: string;
  subheadline?: string;
  image?: string;
  videoUrl?: string;
  backgroundImage?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badge?: string;
  gradientFrom?: string;
  gradientTo?: string;
  tinaFields?: TinaFieldsMap;
}

export const TRUST_AVATARS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=120&h=120&fit=crop&crop=face",
];

export const DEFAULT_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDNxnMqkM7wh-NeTbmWT0l2NlKUmJrrTidcZnWEXxvnju2Jei6aDT63L4nXAt4hLnKpR4AMo0x0Bbid-t81ttvL3rMd_PITyqJLpFd3_eyjDKgKi_lBlIPPg8xKtKCFciAth4zPjMVEhM5dmUvoN7EWuV42RwaKVZGe3K80g-xQAURoDSV8EXI2JAHYyllON3lyJiu1xdFKgu1m53AQ2Xw-cdOvkEx1ZMgIlfBd3DIt03CqdxUNKudZTJL2iPRbSShdEMxFqbcz2WQ";

export function highlightBrainHealth(headline: string, colorClass = "text-secondary") {
  const parts = headline.split(/(Brain Health)/i);
  return parts.map((part, i) =>
    /brain health/i.test(part) ? (
      <span key={i} className={colorClass}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function TrustAvatars({ borderClass = "border-surface" }: { borderClass?: string }) {
  return (
    <div className="flex items-center">
      {TRUST_AVATARS.map((src, i) => (
        <div
          key={i}
          className={`w-[60px] h-[60px] rounded-full overflow-hidden border-2 ${borderClass}`}
          style={{ marginLeft: i > 0 ? "-8px" : 0 }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
