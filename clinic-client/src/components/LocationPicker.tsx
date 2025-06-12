// src/components/LocationPicker.tsx
import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };
type Props = {
  value: LatLng | null;
  onChange: (loc: LatLng) => void;
};

function ClickHandler({ onChange }: Props) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
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
      whenCreated={(map) => (mapRef.current = map)}
      center={center}
      zoom={12}
      className="w-full h-60 rounded-lg overflow-hidden border border-gray-300 shadow"
    >
      {/* swap the URL below for whatever tile style you like */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler onChange={onChange} value={value} />

      {value && <Marker position={[value.lat, value.lng]} />}
    </MapContainer>
  );
}
