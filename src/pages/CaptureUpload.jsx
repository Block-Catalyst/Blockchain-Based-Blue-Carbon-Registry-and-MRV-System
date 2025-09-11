import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CaptureUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Handle file selection or camera capture
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  // Upload / verify the image
  const upload = async () => {
    if (!file) return alert("Please select a file first.");

    try {
      // Optional: get geolocation
      let coords = { latitude: null, longitude: null, accuracy: null };
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
        );
        coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch {
        console.warn("Geolocation not available or denied");
      }

      setUploading(true);

      // Simulate upload / verification (replace with your API if needed)
      await new Promise((res) => setTimeout(res, 1000));

      // Save verified image to localStorage (base64)
      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("verifiedImage", reader.result);
        setUploading(false);
        alert("✅ Image Verified Successfully!");
        navigate("/field-portal"); // go back to FieldUserPortal
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert("❌ Verification failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">📸 Verify Your Project Image</h2>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
      >
        ← Back
      </button>

      {/* File / camera input */}
      <input
        accept="image/*"
        capture="environment"
        type="file"
        onChange={handleFileChange}
        className="mb-4"
      />

      {/* Preview */}
      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="mb-4 w-64 h-64 object-cover rounded-lg shadow"
        />
      )}

      {/* Upload / verify button */}
      <button
        onClick={upload}
        disabled={uploading || !file}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {uploading ? "Verifying…" : "Verify & Continue"}
      </button>
    </div>
  );
}
