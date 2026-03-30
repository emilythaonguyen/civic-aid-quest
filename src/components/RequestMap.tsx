import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Fix default marker icons (Leaflet + bundler issue)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id, type, status, description, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (!error && data) {
        setRequests(
          data.map((r: any) => ({
            id: r.id,
            type: r.type ?? "Unknown",
            status: r.status ?? "Open",
            description: r.description ?? "",
            latitude: Number(r.latitude),
            longitude: Number(r.longitude),
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        No geolocated requests found.
      </div>
    );
  }

  const center: [number, number] = [
    requests.reduce((s, r) => s + r.latitude, 0) / requests.length,
    requests.reduce((s, r) => s + r.longitude, 0) / requests.length,
  ];

  return (
    <div className="rounded-lg border border-border overflow-hidden" style={{ height: 350 }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {requests.map((r) => (
          <Marker key={r.id} position={[r.latitude, r.longitude]}>
            <Popup>
              <div className="space-y-1 text-xs">
                <p className="font-mono font-bold">#{r.id.slice(0, 8)}</p>
                <p><strong>Type:</strong> {r.type}</p>
                <p><strong>Status:</strong> {r.status}</p>
                <p className="max-w-[200px] truncate"><strong>Desc:</strong> {r.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
