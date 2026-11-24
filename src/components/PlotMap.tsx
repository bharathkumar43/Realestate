import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';

const pin = L.divIcon({
  className: '',
  html: `<div style="font-size:34px;line-height:1;transform:translate(-50%,-100%);filter:drop-shadow(0 4px 4px rgba(0,0,0,.35))">📍</div>`,
  iconSize: [0, 0],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))) });
  return null;
}

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  /** When given, the map becomes a pin picker. */
  onPick?: (lat: number, lng: number) => void;
  showPin?: boolean;
}

export default function PlotMap({ lat, lng, zoom = 14, className = 'h-72', onPick, showPin = true }: Props) {
  return (
    <div className={`overflow-hidden rounded-3xl ring-1 ring-violet-100 ${className}`}>
      <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={!!onPick} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showPin && <Marker position={[lat, lng]} icon={pin} />}
        <Recenter lat={lat} lng={lng} />
        {onPick && <ClickToPick onPick={onPick} />}
      </MapContainer>
    </div>
  );
}
