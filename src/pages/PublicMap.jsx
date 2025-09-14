import React, { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';

export default function PublicMap() {
  const [showRegions, setShowRegions] = useState(false);

  // Dummy data with carbon credits
  const regions = [
    { id: 1, name: "Region A", lat: 20.5, lng: 78.9, credits: 3000 },
    { id: 2, name: "Region B", lat: 21.0, lng: 79.1, credits: 1500 },
    { id: 3, name: "Region C", lat: 20.8, lng: 79.5, credits: 800 },
  ];

  // Assign color based on credits
  const getColor = (credits) => {
    if (credits > 2500) return "red";
    if (credits > 1000) return "orange";
    return "green";
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold mb-4 text-center text-primary">
        🌍 Public Carbon Map
      </h2>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowRegions(!showRegions)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showRegions ? "Hide Carbon Regions" : "Show Carbon-Credited Regions"}
        </button>
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden border">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showRegions &&
            regions.map((region) => (
              <CircleMarker
                key={region.id}
                center={[region.lat, region.lng]}
                radius={Math.sqrt(region.credits) / 5}
                pathOptions={{
                  color: getColor(region.credits),
                  fillColor: getColor(region.credits),
                  fillOpacity: 0.5,
                }}
              >
                <Popup>
                  <strong>{region.name}</strong><br />
                  Credits: {region.credits}
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}
