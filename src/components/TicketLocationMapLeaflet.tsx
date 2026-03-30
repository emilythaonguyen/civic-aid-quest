import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  latitude: number;
  longitude: number;
  ticketId: string;
  address?: string;
  description?: string;
}

export default function TicketLocationMapLeaflet({ latitude, longitude, ticketId, address, description }: Props) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="space-y-1 text-xs">
            <p className="font-mono font-bold">#{ticketId.slice(0, 8)}</p>
            {address && <p>{address}</p>}
            {description && <p className="max-w-[200px] truncate">{description}</p>}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
