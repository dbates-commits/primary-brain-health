import { ServiceCard } from "./ServiceCard";
import { SERVICES } from "./services-data";

/** Every service, in the order a reader meets them going through the journey. */
export function ServiceList() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {SERVICES.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
