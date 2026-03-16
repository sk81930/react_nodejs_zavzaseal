import React, { useMemo, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";

const crews = [
  {
    id: 1,
    name: "Alex Gomez",
    role: "Crew Member",
    points: [
      {
        lat: 40.744,
        lng: -73.918,
        time: "06:53 AM",
        event: "Clocked In",
        address: "Saran Dr, Farmingdale, NY",
      },
      {
        lat: 40.748,
        lng: -73.925,
        time: "09:10 AM",
        event: "Job Location",
        address: "Roosevelt Field Mall, NY",
      },
      {
        lat: 40.752,
        lng: -73.93,
        time: "03:21 PM",
        event: "Clocked Out",
        address: "5 Conduit Ave, NY",
      },
    ],
  },
  {
    id: 2,
    name: "Anthony Fuller",
    role: "Crew Member",
    points: [
      { lat: 40.733, lng: -73.99, time: "06:40 AM", event: "Clocked In", address: "Queens, NY" },
      { lat: 40.742, lng: -73.88, time: "09:05 AM", event: "Job Location", address: "Forest Hills, NY" },
      { lat: 40.741, lng: -73.66, time: "03:10 PM", event: "Clocked Out", address: "Hicksville, NY" },
    ],
  },
  {
    id: 3,
    name: "Nelson Morales",
    role: "Crew Member",
    points: [
      { lat: 40.77, lng: -73.98, time: "07:34 AM", event: "Clocked In", address: "Manhattan, NY" },
      { lat: 40.74, lng: -73.78, time: "10:12 AM", event: "Job Location", address: "Nassau, NY" },
      { lat: 40.78, lng: -73.24, time: "02:55 PM", event: "Clocked Out", address: "Patchogue, NY" },
    ],
  },
];

const DEFAULT_CENTER = { lat: 40.75, lng: -73.93 };


function TracePage() {
  const [query, setQuery] = useState("");
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedCrewId, setSelectedCrewId] = useState(crews[0]?.id ?? null);
  const [hoverPoint, setHoverPoint] = useState(null);
  
  const [movingArrow, setMovingArrow] = useState(null);
 const animateRoute = (startIndex) => {

  const start = routePath[startIndex];
  const end = routePath[startIndex + 1];

  const steps = 250; // slower animation
  let step = 0;

  const latStep = (end.lat - start.lat) / steps;
  const lngStep = (end.lng - start.lng) / steps;

  const move = () => {

    step++;

    const lat = start.lat + latStep * step;
    const lng = start.lng + lngStep * step;

    setMovingArrow({ lat, lng });

    if (step < steps) requestAnimationFrame(move);

  };

  move();
};

  const selectedCrew = useMemo(
    () => crews.find((c) => c.id === selectedCrewId) ?? null,
    [selectedCrewId]
  );
  
  

  const filteredCrews = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return crews;
    return crews.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  const apiKey = "AIzaSyD4kX3D8rScwUZr556zsE3eBBornXMqrVc";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "trace-google-map",
    googleMapsApiKey: apiKey,
  });
  
  const arrowIcon = isLoaded
  ? {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 3,
      strokeColor: "#2563eb",
      fillColor: "#2563eb",
      fillOpacity: 1,
      anchor: new window.google.maps.Point(0, 1), // keeps arrow centered
    }
  : null;

  const routePath = useMemo(() => {
    if (!selectedCrew) return [];
    return selectedCrew.points.map((p) => ({ lat: p.lat, lng: p.lng }));
  }, [selectedCrew]);

  const mapCenter = useMemo(() => {
    if (routePath.length) return routePath[0];
    return DEFAULT_CENTER;
  }, [routePath]);

  const hasKey = apiKey.trim().length > 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc" }}>
      <div
        style={{
          width: 360,
          background: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedCrew ? (
          <>
            <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      background: "#e2e8f0",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      fontSize: 12,
                      color: "#0f172a",
                      flex: "0 0 auto",
                    }}
                  >
                    {selectedCrew.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: "#0f172a" }}>
                      {selectedCrew.name}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontWeight: 800,
                          fontSize: 12,
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                        }}
                      >
                        {selectedCrew.role}
                      </span>
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: 12,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                        }}
                      >
                        Today
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCrewId(null)}
                  aria-label="Close"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 900,
                    lineHeight: "30px",
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ overflow: "auto", padding: 12 }}>
              {selectedCrew.points.map((p, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>{p.time}</div>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 12,
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                      }}
                    >
                      {selectedCrew.role}
                    </span>
                  </div>

                  <div style={{ marginTop: 6, fontWeight: 800, color: "#0f172a" }}>{p.event}</div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>
                    📍 {p.address}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>
                  All users that clocked in today
                </div>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Today
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "8px 10px",
                  }}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    style={{
                      width: "100%",
                      border: 0,
                      outline: "none",
                      fontSize: 13,
                      background: "transparent",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>Show routes</div>
                  <button
                    type="button"
                    onClick={() => setShowRoutes((v) => !v)}
                    aria-pressed={showRoutes}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      border: "1px solid",
                      borderColor: showRoutes ? "#2563eb" : "#cbd5e1",
                      background: showRoutes ? "#2563eb" : "#e2e8f0",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: showRoutes ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        background: "#ffffff",
                        transition: "left 160ms ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ overflow: "auto", padding: 10 }}>
              {filteredCrews.map((c) => {
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCrewId(c.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedCrewId(c.id);
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "28px 1fr auto",
                      gap: 10,
                      padding: 10,
                      borderRadius: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "#e2e8f0",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 900,
                        fontSize: 12,
                        color: "#0f172a",
                      }}
                    >
                      {c.name
                        .split(" ")
                        .slice(0, 2)
                        .map((s) => s[0])
                        .join("")}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a" }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#475569" }}>{c.role}</div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCrewId(c.id);
                      }}
                      style={{
                        border: "1px solid #c7d2fe",
                        background: "#eef2ff",
                        padding: "7px 10px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      View route
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        {!hasKey && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 3,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 10,
              maxWidth: 360,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 13, color: "#0f172a" }}>
              Missing Google Maps API key
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
              Add <b>REACT_APP_GOOGLE_MAPS_API_KEY</b> in `frontend/.env` then restart `npm start`.
            </div>
          </div>
        )}

        {loadError && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 3,
              background: "rgba(255,255,255,0.96)",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 13, color: "#0f172a" }}>Map failed to load</div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>{String(loadError)}</div>
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            center={mapCenter}
            zoom={10}
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={{
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              clickableIcons: false,
            }}
          >
            {crews.map((c) => {
              const last = c.points[c.points.length - 1];
              return (
                <MarkerF
                  key={c.id}
                  position={{ lat: last.lat, lng: last.lng }}
                  onClick={() => setSelectedCrewId(c.id)}
                  label={{
                    text: c.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join(""),
                    fontWeight: "700",
                  }}
                />
              );
            })}

            {showRoutes && routePath.length > 1 && (
  <>
    <PolylineF
      path={routePath}
      options={{
        strokeColor: "#1a73e8",
        strokeOpacity: 0.9,
        strokeWeight: 4,
      }}
    />

    {selectedCrew?.points.map((p, idx) => (
      <MarkerF
        key={`${selectedCrew.id}-${idx}`}
        position={{ lat: p.lat, lng: p.lng }}
        icon={{
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#1a73e8",
          strokeWeight: 2,
        }}
        onMouseOver={() => {
  setHoverPoint(p);

  if (selectedCrew.points[idx + 1]) {
    animateRoute(idx);
  }
}}
        onMouseOut={() => setHoverPoint(null)}
      />
    ))}

    {/* MOVING ARROW */}
    {movingArrow && (
      <MarkerF
  position={movingArrow}
  icon={arrowIcon}
  zIndex={999}
/>
    )}

    {hoverPoint && (
      <InfoWindowF
        position={{ lat: hoverPoint.lat, lng: hoverPoint.lng }}
        onCloseClick={() => setHoverPoint(null)}
      >
        <div style={{ fontSize: 12, lineHeight: 1.35 }}>
          <div style={{ fontWeight: 800 }}>{hoverPoint.event}</div>
          <div>{hoverPoint.time}</div>
          <div style={{ color: "#475569" }}>{hoverPoint.address}</div>
        </div>
      </InfoWindowF>
    )}
  </>
)}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

export default TracePage;