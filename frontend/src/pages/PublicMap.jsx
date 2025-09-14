import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import indiaStates from "../data/india_states.json";

// ✅ Initial Carbon Data
const initialCarbonData = {
  Gujarat: { emission: 14, credits: 1200 },
  Odisha: { emission: 13, credits: 980 },
  Chhattisgarh: { emission: 10, credits: 850 },
  Jharkhand: { emission: 9, credits: 770 },
  Karnataka: { emission: 8, credits: 950 },
  Maharashtra: { emission: 8, credits: 1020 },
  "Andhra Pradesh": { emission: 7, credits: 890 },
  Rajasthan: { emission: 5, credits: 600 },
  "West Bengal": { emission: 5, credits: 650 },
  "Tamil Nadu": { emission: 4, credits: 720 },
};

// ✅ Mangrove Data
const mangroveData = {
  "Andaman and Nicobar": { very: 255, moderate: 272, open: 110, total: 637 },
  "Andhra Pradesh": { very: 0, moderate: 15, open: 314, total: 329 },
  "Daman and Diu": { very: 0, moderate: 0, open: 1, total: 1 },
  Goa: { very: 0, moderate: 14, open: 2, total: 16 },
  Gujarat: { very: 0, moderate: 195, open: 741, total: 936 },
  Kerala: { very: 0, moderate: 3, open: 5, total: 8 },
  Karnataka: { very: 0, moderate: 3, open: 0, total: 3 },
  Maharashtra: { very: 0, moderate: 58, open: 100, total: 158 },
  Orissa: { very: 0, moderate: 156, open: 47, total: 203 }, // GeoJSON uses Orissa
  Puducherry: { very: 0, moderate: 0, open: 1, total: 1 },
  "Tamil Nadu": { very: 0, moderate: 18, open: 17, total: 35 },
  "West Bengal": { very: 892, moderate: 895, open: 331, total: 2118 },
};

// ✅ Color Scales
const getEmissionColor = (val) =>
  val > 12 ? "#800026"
  : val > 10 ? "#BD0026"
  : val > 8 ? "#E31A1C"
  : val > 6 ? "#FC4E2A"
  : val > 4 ? "#FD8D3C"
  : "#FEB24C";

const getCreditColor = (val) =>
  val > 1100 ? "#08519c"
  : val > 900 ? "#3182bd"
  : val > 700 ? "#6baed6"
  : val > 500 ? "#9ecae1"
  : "#c6dbef";

const getMangroveColor = (val) =>
  val > 1000 ? "#084081"
  : val > 500 ? "#0868ac"
  : val > 100 ? "#2b8cbe"
  : val > 50 ? "#4eb3d3"
  : val > 10 ? "#7bccc4"
  : val > 0 ? "#a8ddb5"
  : "#FF0000";

// ✅ Zoom Helper
function MapZoom({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 6, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function PublicMap() {
  const [view, setView] = useState("emission");
  const [carbonData, setCarbonData] = useState(initialCarbonData);
  const [selectedState, setSelectedState] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeStep, setTimeStep] = useState(0);
  const [highlightLatLng, setHighlightLatLng] = useState(null);
  const mapRef = useRef();

  // 🔄 Simulated emission change
  useEffect(() => {
    if (timeStep > 0) {
      const updated = { ...initialCarbonData };
      Object.keys(updated).forEach((state) => {
        updated[state].emission = Math.max(
          0,
          updated[state].emission + Math.floor(Math.random() * 3 - 1)
        );
      });
      setCarbonData(updated);
    }
  }, [timeStep]);

  // ✅ Filter Logic
  const matchesEmissionFilter = (data) => {
    if (!data) return false;
    if (filterStatus === "all") return true;
    if (filterStatus === "high") return data.emission > 10;
    if (filterStatus === "medium") return data.emission <= 10 && data.emission > 5;
    if (filterStatus === "low") return data.emission <= 5;
    return true;
  };

  // ✅ Style states based on view
  const stateStyle = (feature) => {
    const name = feature.properties.NAME_1;
    let val = 0;

    if (view === "emission") {
      const data = carbonData[name];
      val = data ? data.emission : 0;
      return {
        fillColor: getEmissionColor(val),
        weight: 1,
        color: "gray",
        dashArray: "3",
        fillOpacity: !matchesEmissionFilter(data) ? 0.4 : 0.7,
      };
    }

    if (view === "credits") {
      const data = carbonData[name];
      val = data ? data.credits : 0;
      return {
        fillColor: getCreditColor(val),
        weight: 1,
        color: "gray",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    }

    if (view === "mangroves") {
      const data = mangroveData[name];
      val = data ? data.total : 0;
      return {
        fillColor: getMangroveColor(val),
        weight: 1,
        color: "black",
        dashArray: "3",
        fillOpacity: 0.7,
      };
    }
  };

  // ✅ Popup
  const onEachState = (feature, layer) => {
    const name = feature.properties.NAME_1;
    const dataCarbon = carbonData[name];
    const dataMangrove = mangroveData[name];

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          color: "#000",
          dashArray: "",
          fillOpacity: 0.9,
        });
      },
      mouseout: (e) => {
        e.target.setStyle(stateStyle(feature));
      },
      click: (e) => {
        const coords = e.latlng;
        setSelectedState(name);
        setHighlightLatLng(coords);
      },
    });

    if (view === "mangroves" && dataMangrove) {
      layer.bindPopup(
        `<b>${name}</b><br/>
         Very Dense: ${dataMangrove.very} km²<br/>
         Moderately Dense: ${dataMangrove.moderate} km²<br/>
         Open: ${dataMangrove.open} km²<br/>
         Total: <b>${dataMangrove.total} km²</b>`
      );
    } else {
      layer.bindPopup(
        `<b>${name}</b><br/>Emission: ${
          dataCarbon ? dataCarbon.emission + " Mt" : "No data"
        }<br/>Credits: ${dataCarbon ? dataCarbon.credits : "No data"}`
      );
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-sky-50 via-emerald-50 to-teal-100">
      <h2 className="text-4xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-emerald-700 to-teal-800 drop-shadow">
        Carbon Emission, Credits & Mangroves Dashboard
      </h2>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => setView("emission")}
          className={`px-5 py-2 rounded-xl shadow-md font-medium transition ${
            view === "emission"
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 border hover:bg-gray-100"
          }`}
        >
          Emissions
        </button>
        <button
          onClick={() => setView("credits")}
          className={`px-5 py-2 rounded-xl shadow-md font-medium transition ${
            view === "credits"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 border hover:bg-gray-100"
          }`}
        >
          Credits
        </button>
        <button
          onClick={() => setView("mangroves")}
          className={`px-5 py-2 rounded-xl shadow-md font-medium transition ${
            view === "mangroves"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105"
              : "bg-white text-gray-700 border hover:bg-gray-100"
          }`}
        >
          Mangroves
        </button>

        {view === "emission" && (
          <>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All</option>
              <option value="high">High Emission</option>
              <option value="medium">Medium Emission</option>
              <option value="low">Low Emission</option>
            </select>

            <input
              type="range"
              min="0"
              max="10"
              value={timeStep}
              onChange={(e) => setTimeStep(Number(e.target.value))}
              className="w-40 accent-emerald-600"
            />
          </>
        )}
      </div>

      {/* Map + Legend */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[600px] flex-1 rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <MapContainer
            center={[22.5, 80]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON data={indiaStates} style={stateStyle} onEachFeature={onEachState} />
            {highlightLatLng && (
              <MapZoom lat={highlightLatLng.lat} lng={highlightLatLng.lng} />
            )}
          </MapContainer>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full lg:w-72 bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-md border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {view === "emission"
              ? "Carbon Emission"
              : view === "credits"
              ? "Carbon Credits"
              : "Mangrove Area (km²)"}
          </h3>
          <div className="flex flex-col gap-3">
            {(view === "emission"
              ? [
                  { label: "12+", color: "#800026" },
                  { label: "10–12", color: "#BD0026" },
                  { label: "8–10", color: "#E31A1C" },
                  { label: "6–8", color: "#FC4E2A" },
                  { label: "4–6", color: "#FD8D3C" },
                  { label: "0–4", color: "#FEB24C" },
                ]
              : view === "credits"
              ? [
                  { label: "1100+", color: "#08519c" },
                  { label: "900–1100", color: "#3182bd" },
                  { label: "700–900", color: "#6baed6" },
                  { label: "500–700", color: "#9ecae1" },
                  { label: "0–500", color: "#c6dbef" },
                ]
              : [
                  { label: "1000+", color: "#084081" },
                  { label: "500–1000", color: "#0868ac" },
                  { label: "100–500", color: "#2b8cbe" },
                  { label: "50–100", color: "#4eb3d3" },
                  { label: "10–50", color: "#7bccc4" },
                  { label: "1–10", color: "#a8ddb5" },
                  { label: "No Data", color: "#FF0000" },
                ]
            ).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-6 h-6 rounded-md border border-gray-300"
                ></span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
