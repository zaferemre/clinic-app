import { useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const ISTANBUL_CENTER = { lat: 41.0082, lng: 28.9784 }; // Istanbul center

type Props = {
  value: { lat: number; lng: number } | null;
  onChange: (loc: { lat: number; lng: number }) => void;
};

export default function LocationPicker({ value, onChange }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY as string,
  });

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        onChange({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      }
    },
    [onChange]
  );

  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: 300 }}
      center={value || ISTANBUL_CENTER}
      zoom={12}
      onClick={handleMapClick}
      options={{
        restriction: {
          latLngBounds: {
            north: 41.21,
            south: 40.82,
            west: 28.6,
            east: 29.26,
          },
          strictBounds: true,
        },
      }}
    >
      {value && <Marker position={value} />}
    </GoogleMap>
  );
}
