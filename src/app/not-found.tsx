import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
      <h1 className="font-headline text-6xl font-bold text-on-surface mb-4">404</h1>
      <p className="text-on-surface-variant text-lg mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-sm font-bold hover:brightness-110 active:scale-95 transition-all duration-200"
      >
        Back to Home
      </Link>
    </div>
  );
}
