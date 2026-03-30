import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface MapRequest {
  id: string;
  type: string;
  status: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface Props {
  requests: MapRequest[];
  center: [number, number];
}

export default function RequestMapLeaflet({ requests, center }: Props) {
  return (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {requests.map((request) => (
        <Marker key={request.id} position={[request.latitude, request.longitude]}>
          <Popup>
            <div className="space-y-1 text-xs">
              <p className="font-mono font-bold">#{request.id.slice(0, 8)}</p>
              <p><strong>Type:</strong> {request.type}</p>
              <p><strong>Status:</strong> {request.status}</p>
              <p className="max-w-[200px]"><strong>Description:</strong> {request.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
