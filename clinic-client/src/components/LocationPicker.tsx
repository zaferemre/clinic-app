import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type L from "leaflet"; // Only for types, runtime is handled by react-leaflet
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };
type Props = {
  value: LatLng | null;
  onChange: (loc: LatLng) => void;
};

function ClickHandler({ onChange }: { onChange: (loc: LatLng) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Readonly<Props>) {
  const mapRef = useRef<L.Map | null>(null);

  // on mount, try to geolocate user
  useEffect(() => {
    if (!mapRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.setView([coords.latitude, coords.longitude], 13);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const center = value ?? { lat: 41.0082, lng: 28.9784 };

  return (
    <MapContainer
      whenReady={() => {
        // Use leaflet's map instance from the ref if needed
        // No parameter is passed to whenReady, so we can't set mapRef here
      }}
      center={center}
      zoom={12}
      className="w-full h-60 rounded-lg overflow-hidden border border-gray-300 shadow"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} />}
    </MapContainer>
  );
}
