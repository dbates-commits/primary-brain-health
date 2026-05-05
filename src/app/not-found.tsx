import { Button } from "@/components/shared/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
      <h1 className="font-headline text-6xl font-bold text-on-surface mb-4">404</h1>
      <p className="text-on-surface-variant text-lg mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button href="/" variant="solid" color="primary" size="md">
        Back to Home
      </Button>
    </div>
  );
}
