import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LeafletMap = lazy(() => import("./RequestMapLeaflet"));

interface MapRequest {
  id: string;
  type: string;
  status: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function RequestMap() {
  const [requests, setRequests] = useState<MapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id, type, status, description, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (!error && data) {
        setRequests(
          data
            .map((r: any) => ({
              id: r.id,
              type: r.type ?? "Unknown",
              status: r.status ?? "Open",
              description: r.description ?? "",
              latitude: Number(r.latitude),
              longitude: Number(r.longitude),
            }))
            .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
        );
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  const center = useMemo<[number, number] | null>(() => {
    if (requests.length === 0) return null;
    return [
      requests.reduce((sum, r) => sum + r.latitude, 0) / requests.length,
      requests.reduce((sum, r) => sum + r.longitude, 0) / requests.length,
    ];
  }, [requests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!requests.length || !center) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        No geolocated requests found.
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-muted/30 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Request Map</h3>
      <div className="overflow-hidden rounded-lg border border-border" style={{ height: 350 }}>
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-muted/30">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <LeafletMap requests={requests} center={center} />
        </Suspense>
      </div>
    </div>
  );
}
