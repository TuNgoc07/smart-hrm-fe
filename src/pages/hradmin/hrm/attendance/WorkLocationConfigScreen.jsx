import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const TYPE_LABELS = {
  OFFICE: { label: "OFFICE", color: "bg-blue-100 text-blue-700" },
  REMOTE: { label: "REMOTE", color: "bg-purple-100 text-purple-700" },
  CLIENT_SITE: { label: "CLIENT SITE", color: "bg-amber-100 text-amber-700" },
};

const EMPTY_FORM = {
  locationName: "",
  locationType: "OFFICE",
  latitude: "",
  longitude: "",
  radiusMeters: 100,
  address: "",
  isActive: 1,
};

export default function WorkLocationConfigScreen() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const placeMarkerFnRef = useRef(null);

  const token = () => localStorage.getItem("token");

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/hradmin/work-locations`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      setLocations(data.data || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // ── Leaflet map (CDN) ─────────────────────────────────────────────────────

  const destroyMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    }
  };

  const initMap = (lat, lng) => {
    if (!mapContainerRef.current || leafletMapRef.current) return;
    const L = window.L;
    const centerLat = lat || 15.9704;
    const centerLng = lng || 108.2494;

    const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 16);
    leafletMapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const placeMarker = (clickLat, clickLng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e) => {
          const { lat: newLat, lng: newLng } = e.target.getLatLng();
          updateCoords(newLat, newLng);
        });
      }
      if (circleRef.current) map.removeLayer(circleRef.current);
      setForm((prev) => {
        const r = parseInt(prev.radiusMeters) || 100;
        circleRef.current = L.circle([clickLat, clickLng], {
          radius: r,
          color: "#3b82f6",
          fillColor: "#93c5fd",
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);
        return { ...prev, latitude: clickLat.toFixed(8), longitude: clickLng.toFixed(8) };
      });
      reverseGeocode(clickLat, clickLng);
    };

    placeMarkerFnRef.current = placeMarker;
    if (lat && lng) placeMarker(lat, lng);

    map.on("click", (e) => placeMarker(e.latlng.lat, e.latlng.lng));
    setMapReady(true);
  };

  const updateCoords = (lat, lng) => {
    setForm((prev) => ({ ...prev, latitude: lat.toFixed(8), longitude: lng.toFixed(8) }));
    reverseGeocode(lat, lng);
    if (circleRef.current && leafletMapRef.current) {
      circleRef.current.setLatLng([lat, lng]);
    }
  };

  const loadLeafletAndInit = (lat, lng) => {
    const onLoad = () => initMap(lat, lng);

    if (window.L) {
      onLoad();
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const existingJs = document.getElementById("leaflet-js");
    if (existingJs) {
      if (window.L) onLoad();
      else existingJs.addEventListener("load", onLoad, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = onLoad;
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    if (!showModal) {
      destroyMap();
      setMapReady(false);
      return;
    }
    const lat = parseFloat(form.latitude) || null;
    const lng = parseFloat(form.longitude) || null;
    const timer = setTimeout(() => loadLeafletAndInit(lat, lng), 80);
    return () => clearTimeout(timer);
  }, [showModal]);

  // Update circle radius when radiusMeters changes
  useEffect(() => {
    if (circleRef.current && leafletMapRef.current) {
      circleRef.current.setRadius(parseInt(form.radiusMeters) || 100);
    }
  }, [form.radiusMeters]);

  // ── Geocoding ─────────────────────────────────────────────────────────────

  const geocodeSearch = async () => {
    const q = searchQuery.trim();
    if (!q || !leafletMapRef.current) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { Accept: "application/json" } }
      );
      const results = await res.json();
      if (results.length > 0) {
        const numLat = parseFloat(results[0].lat);
        const numLng = parseFloat(results[0].lon);
        leafletMapRef.current.flyTo([numLat, numLng], 17);
        placeMarkerFnRef.current?.(numLat, numLng);
      } else {
        setSearchError("Address not found. Try a different keyword.");
      }
    } catch (_) {
      setSearchError("Search error. Please try again.");
    }
    setSearching(false);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { Accept: "application/json" } }
      );
      const data = await res.json();
      if (data.display_name) {
        setForm((prev) => ({ ...prev, address: data.display_name }));
      }
    } catch (_) {}
  };

  // ── Modal open/close ──────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSaveError("");
    setShowModal(true);
  };

  const openEdit = (loc) => {
    setEditingId(loc.locationId);
    setForm({
      locationName: loc.locationName || "",
      locationType: loc.locationType || "OFFICE",
      latitude: loc.latitude?.toString() || "",
      longitude: loc.longitude?.toString() || "",
      radiusMeters: loc.radiusMeters || 100,
      address: loc.address || "",
      isActive: loc.isActive ?? 1,
    });
    setSaveError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSaveError("");
    setSearchQuery("");
    setSearchError("");
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.locationName.trim()) { setSaveError("Location name cannot be empty."); return; }
    if (!form.latitude || !form.longitude) { setSaveError("Please select coordinates on the map."); return; }

    setSaving(true);
    setSaveError("");
    const url = editingId
      ? `${API_BASE}/api/hradmin/work-locations/${editingId}`
      : `${API_BASE}/api/hradmin/work-locations`;

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          ...form,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radiusMeters: parseInt(form.radiusMeters) || 100,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.message || "Failed to save."); return; }
      closeModal();
      fetchLocations();
    } catch (_) {
      setSaveError("Server connection error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Deactivate this location? Employees will not be able to use it for check-in.")) return;
    try {
      await fetch(`${API_BASE}/api/hradmin/work-locations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      fetchLocations();
    } catch (_) {}
  };

  const handleReactivate = async (id) => {
    try {
      await fetch(`${API_BASE}/api/hradmin/work-locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ isActive: 1 }),
      });
      fetchLocations();
    } catch (_) {}
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Locations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure office coordinates for GPS geofencing when employees check in / check out.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-base leading-none">add_location_alt</span>
          Add Location
        </button>
      </div>

      {/* Info banner */}
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <span className="material-symbols-outlined mt-0.5 text-blue-500">info</span>
        <div className="text-sm text-blue-700">
          <strong>How it works:</strong> When employees check in, the system calculates{" "}
          <code className="rounded bg-blue-100 px-1 font-mono text-xs">effectiveDistance = max(0, distance − accuracy)</code>.
          If it's less than the <strong>geofence radius</strong> → valid. Office locations are prioritized.
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {["Location Name", "Location Type", "Address", "Coordinates", "Radius", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <span className="material-symbols-outlined mb-2 block text-4xl text-gray-300">location_off</span>
                  <p className="text-gray-400">No locations yet. Click "Add location" to get started.</p>
                </td>
              </tr>
            ) : (
              locations.map((loc) => {
                const typeInfo = TYPE_LABELS[loc.locationType] || { label: loc.locationType, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={loc.locationId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{loc.locationName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-gray-500">
                      <span className="line-clamp-2">{loc.address || "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {loc.latitude != null && loc.longitude != null
                        ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{loc.radiusMeters ?? 100} m</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          loc.isActive === 1 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {loc.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(loc)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        {loc.isActive === 1 ? (
                          <button
                            onClick={() => handleDeactivate(loc.locationId)}
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(loc.locationId)}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? "Edit location" : "Add new location"}
              </h2>
              <button
                onClick={closeModal}
                className="material-symbols-outlined rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                close
              </button>
            </div>

            {/* Modal body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left panel — form */}
              <div className="flex w-80 flex-shrink-0 flex-col gap-4 overflow-y-auto border-r p-6">
                {/* Location name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Location Name *</label>
                  <input
                    value={form.locationName}
                    onChange={(e) => setForm((p) => ({ ...p, locationName: e.target.value }))}
                    placeholder="VD: Văn phòng Đà Nẵng"
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Location Type</label>
                  <select
                    value={form.locationType}
                    onChange={(e) => setForm((p) => ({ ...p, locationType: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  >
                    <option value="OFFICE">OFFICE — Văn phòng</option>
                    <option value="REMOTE">REMOTE — Làm từ xa</option>
                    <option value="CLIENT_SITE">CLIENT_SITE — Tại khách hàng</option>
                  </select>
                  <p className="mt-1 text-[11px] text-gray-400">OFFICE type is prioritized for GPS check-in</p>
                </div>

                {/* Radius */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Geofence Radius (meters)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={5000}
                    value={form.radiusMeters}
                    onChange={(e) => setForm((p) => ({ ...p, radiusMeters: e.target.value }))}
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Vòng tròn xanh trên bản đồ thể hiện phạm vi hợp lệ
                  </p>
                </div>

                {/* Address search */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">Search Address</label>
                  <div className="flex gap-2">
                    <input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setSearchError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && geocodeSearch()}
                      placeholder="Nhập địa chỉ, tên tòa nhà..."
                      className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      onClick={geocodeSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
                    >
                      {searching
                        ? <span className="material-symbols-outlined animate-spin text-sm leading-none">progress_activity</span>
                        : <span className="material-symbols-outlined text-sm leading-none">search</span>}
                    </button>
                  </div>
                  {searchError && <p className="mt-1 text-[11px] text-red-500">{searchError}</p>}
                  <p className="mt-1 text-[11px] text-gray-400">Nhấn Enter hoặc 🔍 để dò vị trí · Bản đồ tự bay đến</p>
                </div>

                {/* Address (auto-filled) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Address <span className="font-normal text-gray-400">(auto-filled from map)</span>
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    rows={2}
                    placeholder="Sẽ tự điền khi click bản đồ hoặc tìm kiếm"
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                {/* Coordinates display */}
                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-blue-700">Selected Coordinates</p>
                  {form.latitude && form.longitude ? (
                    <p className="font-mono text-xs text-blue-600 leading-relaxed">
                      Lat: {parseFloat(form.latitude).toFixed(6)}
                      <br />
                      Lng: {parseFloat(form.longitude).toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-xs text-blue-400 italic">Not selected — click on the map</p>
                  )}
                </div>

                {/* Map hint */}
                <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                  <strong>Guide:</strong> Find address using the search box or click directly on the map. Drag the pin to adjust. Only 1 pin allowed — clicking a new position will replace the old one.
                </div>

                {saveError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{saveError}</p>
                )}

                {/* Actions */}
                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.locationName || !form.latitude || !form.longitude}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                </div>
              </div>

              {/* Right panel — map */}
              <div className="relative flex-1">
                <div
                  ref={mapContainerRef}
                  className="h-full w-full"
                  style={{ minHeight: 400 }}
                />
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-400">
                      <span className="material-symbols-outlined animate-spin mb-2 block text-4xl">
                        progress_activity
                      </span>
                      <p className="text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
                <div className="absolute left-3 top-3 z-[1000] max-w-xs rounded-lg bg-white/90 px-3 py-2 text-xs text-gray-600 shadow backdrop-blur">
                  <span className="material-symbols-outlined align-middle text-sm text-blue-500">touch_app</span>{" "}
                  Click to set position · Drag pin to adjust
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
