import React, { useState, useEffect } from 'react';
import "./Dashboard.css";

// ---------- Leaflet 正确的导入方式（Vite 100% 兼容） ----------
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 修复 Leaflet 图标路径，否则 Marker 不显示
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ---------- API Client ----------
import { apiClient } from '../../api/client';
import type { HospitalResponse, UserResponse, NYCClimateDataResponse, TravelRecommendationResponse } from '../../api/client';

// ---------- Climate Charts Component ----------
import { ClimateCharts } from './ClimateCharts';

// Note: Types are now imported from api/client.ts
// Data is now fetched from backend API instead of using mock generators

export function NYCPage() {
  // Hospital data state
  const [selectedBorough, setSelectedBorough] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<HospitalResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [boroughs, setBoroughs] = useState<string[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState<boolean>(true);
  const [hospitalsError, setHospitalsError] = useState<string | null>(null);

  // Auth
  const [user, setUser] = useState<UserResponse | null>(null);

  // Climate data - use user's zipcode if logged in, otherwise default to 10001
  const [zipcode, setZipcode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        return userData?.zipCode || '10001';
      }
    } catch (e) {
      console.error("User parse error:", e);
    }
    return '10001';
  });
  const [climateData, setClimateData] = useState<NYCClimateDataResponse | null>(null);
  const [climateLoading, setClimateLoading] = useState<boolean>(false);
  const [climateError, setClimateError] = useState<string | null>(null);

  // Travel recommendations
  const [recommendations, setRecommendations] = useState<TravelRecommendationResponse[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState<boolean>(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // Map State
  const [hospitalMapCenter, setHospitalMapCenter] = useState<[number, number]>([
    40.7128, -73.935242
  ]);
  const [hospitalMapZoom, setHospitalMapZoom] = useState<number>(11);
  // Default center for zipcode 10001 (Midtown Manhattan)
  const [climateMapCenter] = useState<[number, number]>([
    40.7489, -73.9969
  ]);
  const [climateMapZoom] = useState<number>(13);

  // Load user and update zipcode if user has one
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        setUser(userData);
        // Update zipcode to user's zipcode if available and different from current
        if (userData?.zipCode && userData.zipCode !== zipcode) {
          setZipcode(userData.zipCode);
        }
      }
    } catch (e) {
      console.error("User parse error:", e);
    }
  }, []);

  // Load initial climate data for default zipcode
  useEffect(() => {
    // Auto-load default zipcode data on mount
    if (!climateData && !climateLoading) {
      handleZipcodeSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload data when zipcode changes (e.g., when user logs in with a different zipcode)
  useEffect(() => {
    // Only auto-load if we have a zipcode and no data is currently loading
    if (zipcode && !climateLoading && !recommendationsLoading) {
      handleZipcodeSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.zipCode]);

  // Fetch boroughs
  useEffect(() => {
    const fetchBoroughs = async () => {
      try {
        const data = await apiClient.getBoroughs();
        setBoroughs(["All", ...data]);
      } catch (err) {
        setBoroughs(["All"]);
        setHospitalsError("Failed to load borough list");
      }
    };
    fetchBoroughs();
  }, []);

  // Fetch hospitals
  useEffect(() => {
    if (!boroughs.length) return;
    const fetchHospitals = async () => {
      try {
        setHospitalsLoading(true);
        setHospitalsError(null);
        const boroughParam = selectedBorough === "All" ? undefined : selectedBorough;
        const data = await apiClient.getHospitals({ borough: boroughParam });
        setHospitals(data || []);
      } catch (err) {
        setHospitalsError("Failed to load hospital data");
        setHospitals([]);
      } finally {
        setHospitalsLoading(false);
      }
    };
    fetchHospitals();
  }, [selectedBorough, boroughs.length]);

  // Handle hospital click
  const handleHospitalSelect = (h: HospitalResponse) => {
    setSelectedHospital(h);
    setHospitalMapCenter([h.latitude, h.longitude]);
    setHospitalMapZoom(15);
  };

  // Fetch Climate + Travel
  const handleZipcodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!zipcode || zipcode.length !== 5 || !/^\d{5}$/.test(zipcode)) {
      setClimateError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    const zip = zipcode.trim();

    // Climate - fetch from backend API
    try {
      setClimateLoading(true);
      setClimateError(null);
      const data = await apiClient.getLatestNYCClimateData(zip);
      setClimateData(data);
    } catch (err: any) {
      console.error("Failed to load climate data:", err);
      setClimateError(err?.detail || err?.message || "Failed to load climate data from backend");
      setClimateData(null);
    } finally {
      setClimateLoading(false);
    }

    // Travel Advice - fetch from backend API
    try {
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      
      // Check user login status from localStorage in case state hasn't updated
      let isLoggedIn = !!user;
      if (!isLoggedIn) {
        try {
          const stored = localStorage.getItem('user');
          isLoggedIn = !!stored;
        } catch (e) {
          console.error("Error checking user from localStorage:", e);
        }
      }
      
      const days = isLoggedIn ? 7 : 1;
      console.log(`Loading ${days} days of recommendations from backend (logged in: ${isLoggedIn})`);
      const recs = await apiClient.getTravelRecommendations(zip, days);
      setRecommendations(recs);
    } catch (err: any) {
      console.error("Failed to load travel recommendations:", err);
      setRecommendationsError(err?.detail || err?.message || "Failed to load travel recommendations from backend");
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Helper functions
  const getRecommendationColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'safe': return '#00e676';
      case 'moderate': return '#ffeb3b';
      case 'caution': return '#ff9800';
      case 'avoid': return '#f44336';
      default: return '#8892b0';
    }
  };

  const getAQIColor = (aqi?: number | null) => {
    if (!aqi) return '#8892b0';
    if (aqi <= 50) return '#00e676';
    if (aqi <= 100) return '#ffeb3b';
    if (aqi <= 150) return '#ff9800';
    if (aqi <= 200) return '#f44336';
    return '#b71c1c';
  };

  const getAQICategory = (aqi?: number | null) => {
    if (!aqi) return 'N/A';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // ---------- Render Map ----------
  const renderMap = (
    type: 'hospitals' | 'climate',
    center: [number, number],
    zoom: number
  ) => (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {type === "hospitals" &&
        hospitals.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude, h.longitude]}
            eventHandlers={{ click: () => handleHospitalSelect(h) }}
          >
            <Popup>
              <strong>{h.name}</strong>
              <br />
              {h.address}
              <br />
              {h.borough}
            </Popup>
          </Marker>
        ))}

      {type === "climate" && zipcode && (
        <Marker position={center}>
          <Popup>Zip Code: {zipcode}</Popup>
        </Marker>
      )}
    </MapContainer>
  );

  // ---------- UI ----------
  return (
    <div className="nyc-dashboard-page">
      <div className="page-header">
        <h1>NYC Climate Health Dashboard</h1>
        <p>Monitor climate data, find hospitals, and get personalized travel recommendations</p>
      </div>

      {/* ---------- Climate + Travel Section (First) ---------- */}
      <section className="climate-travel-section">
        <h2 className="section-title">Climate Data & Travel Recommendations</h2>

        <form onSubmit={handleZipcodeSubmit} className="zipcode-input-section">
          <label>Enter NYC ZIP Code</label>
          <div className="zipcode-input-group">
            <input
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="10001"
              maxLength={5}
            />
            <button type="submit" disabled={climateLoading || recommendationsLoading}>
              {climateLoading || recommendationsLoading ? 'Loading...' : 'Search'}
            </button>
          </div>
          {climateError && <p className="error-message">{climateError}</p>}
          {recommendationsError && <p className="error-message">{recommendationsError}</p>}
        </form>

        {/* ---- Climate Data & Map Layout ---- */}
        {climateData && (
          <div className="climate-travel-content">
            {/* Map and Recommendations Side by Side */}
            <div className="map-recommendations-layout">
              {/* Map Section */}
              <div className="map-section">
                <div className="dashboard-card large">
                  <h2>Climate Map - ZIP Code: {zipcode}</h2>
                  <div style={{ height: "600px", marginTop: "1rem" }}>
                    {renderMap("climate", climateMapCenter, climateMapZoom)}
                  </div>
                </div>
              </div>

              {/* Recommendations Section - Right Side */}
              <div className="recommendations-sidebar">
                {recommendationsLoading && (
                  <div className="loading-message">Loading travel recommendations...</div>
                )}

                {recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h2 className="section-title">Travel Recommendations</h2>

                    <div className="recommendations-list">
                      {recommendations.map((rec) => {
                        const recDate = new Date(rec.date);
                        const isToday = recDate.toDateString() === new Date().toDateString();
                        
                        return (
                          <div key={rec.id} className="recommendation-card">
                            <div className="recommendation-header">
                              <h3>
                                {isToday ? 'Today' : recDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                {isToday && <span className="today-badge">TODAY</span>}
                              </h3>
                              <div 
                                className="recommendation-level-badge"
                                style={{ backgroundColor: getRecommendationColor(rec.recommendation_level) }}
                              >
                                {rec.recommendation_level.toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="recommendation-scores">
                              <div className="score-item">
                                <span className="score-label">Risk Score</span>
                                <span className="score-value">{rec.risk_score.toFixed(0)}/100</span>
                              </div>
                            </div>

                            <div className="recommendation-content">
                              {rec.overall_message && (
                                <div className="recommendation-message">
                                  <strong>Overall:</strong> {rec.overall_message}
                                </div>
                              )}
                              {rec.general_advice && (
                                <div className="recommendation-advice">
                                  <strong>Advice:</strong> {rec.general_advice}
                                </div>
                              )}
                              {rec.best_time_of_day && (
                                <div className="recommendation-info">
                                  <strong>Best Time:</strong> {rec.best_time_of_day}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Combined Climate Data Section - Below Map */}
            <div className="climate-data-combined">
              <div className="dashboard-card large">
                <h2>Climate Data Overview</h2>
                
                {/* Compact Grid Layout - No Sub-headings */}
                <div className="climate-data-grid">
                  {/* AQI - Prominent Display */}
                  <div className="climate-metric-card aqi-card">
                    <span className="metric-label-compact">Air Quality Index</span>
                    <div className="metric-value-large" style={{ color: getAQIColor(climateData.aqi) }}>
                      {climateData.aqi ?? 'N/A'}
                    </div>
                    <span className="metric-category">{getAQICategory(climateData.aqi)}</span>
                  </div>

                  {/* Weather Metrics */}
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">Temperature</span>
                    <span className="metric-value-compact">
                      {climateData.temperature?.toFixed(1) ?? 'N/A'} <span className="metric-unit">°C</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">Humidity</span>
                    <span className="metric-value-compact">
                      {climateData.humidity?.toFixed(1) ?? 'N/A'} <span className="metric-unit">%</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">Wind Speed</span>
                    <span className="metric-value-compact">
                      {climateData.wind_speed?.toFixed(1) ?? 'N/A'} <span className="metric-unit">m/s</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">Pressure</span>
                    <span className="metric-value-compact">
                      {climateData.pressure?.toFixed(1) ?? 'N/A'} <span className="metric-unit">hPa</span>
                    </span>
                  </div>

                  {/* Pollutants */}
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">PM2.5</span>
                    <span className="metric-value-compact">
                      {climateData.pm25?.toFixed(2) ?? 'N/A'} <span className="metric-unit">μg/m³</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">PM10</span>
                    <span className="metric-value-compact">
                      {climateData.pm10?.toFixed(2) ?? 'N/A'} <span className="metric-unit">μg/m³</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">O₃</span>
                    <span className="metric-value-compact">
                      {climateData.o3?.toFixed(3) ?? 'N/A'} <span className="metric-unit">ppm</span>
                    </span>
                  </div>
                  <div className="climate-metric-card">
                    <span className="metric-label-compact">NO₂</span>
                    <span className="metric-value-compact">
                      {climateData.no2?.toFixed(2) ?? 'N/A'} <span className="metric-unit">ppb</span>
                    </span>
                  </div>

                  {/* Additional Indicators */}
                  {climateData.uv_index !== null && climateData.uv_index !== undefined && (
                    <div className="climate-metric-card">
                      <span className="metric-label-compact">UV Index</span>
                      <span className="metric-value-compact">
                        {climateData.uv_index?.toFixed(1) ?? 'N/A'}
                      </span>
                    </div>
                  )}
                  {climateData.pollen_count !== null && climateData.pollen_count !== undefined && (
                    <div className="climate-metric-card">
                      <span className="metric-label-compact">Pollen Count</span>
                      <span className="metric-value-compact">
                        {climateData.pollen_count ?? 'N/A'}
                      </span>
                    </div>
                  )}
                  {climateData.asthma_index !== null && climateData.asthma_index !== undefined && (
                    <div className="climate-metric-card">
                      <span className="metric-label-compact">Asthma Risk Index</span>
                      <span className="metric-value-compact">
                        {climateData.asthma_index?.toFixed(1) ?? 'N/A'} <span className="metric-unit">/100</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ---------- Climate Data Charts Section (Only for logged-in users) ---------- */}
      {user && climateData && (
        <section className="charts-section">
          <ClimateCharts 
            zipcode={zipcode}
            currentData={{
              aqi: climateData.aqi,
              pm25: climateData.pm25,
              pm10: climateData.pm10,
              o3: climateData.o3,
              no2: climateData.no2,
              temperature: climateData.temperature,
              humidity: climateData.humidity,
              wind_speed: climateData.wind_speed,
              pressure: climateData.pressure,
            }}
          />
        </section>
      )}

      {/* ---------- Hospitals Section (Second) ---------- */}
      <section className="hospitals-section">
        <h2 className="section-title">Asthma Hospitals</h2>

      <div className="dashboard-layout">
        <div className="control-panel">
          <div className="filter-section">
              <label>Borough</label>
              <select
                value={selectedBorough}
                onChange={(e) => setSelectedBorough(e.target.value)}
              >
                {boroughs.map((b) => (
                  <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          
          <div className="list-section">
            <h3>Hospitals in {selectedBorough}</h3>
              {hospitalsError && (
                <p className="error-message" style={{ color: '#f87171', fontSize: '0.9rem', padding: '0.5rem' }}>
                  {hospitalsError}
                </p>
              )}
              {hospitalsLoading ? (
                <p>Loading hospitals...</p>
              ) : hospitals.length === 0 ? (
                <p>No hospitals found.</p>
              ) : (
                <ul>
                  {hospitals.map((h) => (
                <li 
                  key={h.id} 
                      className={
                        selectedHospital?.id === h.id ? "selected" : ""
                      }
                  onClick={() => handleHospitalSelect(h)}
                >
                  {h.name} ({h.borough})
                </li>
              ))}
            </ul>
              )}
          </div>

            {selectedHospital && (
          <div className="details-card">
                <h2>{selectedHospital.name}</h2>
                <p><strong>Address:</strong> {selectedHospital.address}</p>
                <p><strong>Borough:</strong> {selectedHospital.borough}</p>
                {selectedHospital.phone && <p><strong>Phone:</strong> {selectedHospital.phone}</p>}
              </div>
            )}
        </div>

        <div className="map-container">
            {renderMap("hospitals", hospitalMapCenter, hospitalMapZoom)}
          </div>
        </div>
      </section>
    </div>
  );
}
