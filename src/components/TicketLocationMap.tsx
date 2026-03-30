import { lazy, Suspense } from "react";
import { Loader2, MapPin } from "lucide-react";

const LeafletSingleMarker = lazy(() => import("./TicketLocationMapLeaflet"));

interface Props {
  latitude: number | null;
  longitude: number | null;
  ticketId: string;
  address?: string;
  description?: string;
}

export default function TicketLocationMap({ latitude, longitude, ticketId, address, description }: Props) {
  if (latitude == null || longitude == null) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        No location data available.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="text-sm text-muted-foreground">Location Map</span>
      <div className="overflow-hidden rounded-lg border border-border" style={{ height: 300 }}>
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <LeafletSingleMarker
            latitude={latitude}
            longitude={longitude}
            ticketId={ticketId}
            address={address}
            description={description}
          />
        </Suspense>
      </div>
    </div>
  );
}
