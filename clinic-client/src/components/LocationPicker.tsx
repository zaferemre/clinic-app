import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };
type Props = {
  value: LatLng | null;
  onChange: (loc: LatLng) => void;
};

// Define your custom logo icon
const customIcon = new L.Icon({
  iconUrl: "/icons/logo-sm.png", // Place this file in /public or update the path if needed
  iconSize: [34, 34], // Adjust size as needed
  iconAnchor: [0, 34], // Anchor so the "point" is at the bottom center
  popupAnchor: [0, -52],
  className: "randevi-marker-icon",
});

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

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (mapRef.current) {
          mapRef.current.setView([coords.latitude, coords.longitude], 14);
        }
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const center = value ?? { lat: 41.0082, lng: 28.9784 }; // İstanbul default

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        width: "100%",
        height: 260,
        borderRadius: 18,
        boxShadow: "0 3px 16px #0001",
      }}
      className="border border-gray-300"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ClickHandler onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={customIcon} />}
    </MapContainer>
  );
}
