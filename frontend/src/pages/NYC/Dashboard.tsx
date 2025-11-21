import React, { useState, useEffect } from 'react';
import "./Dashboard.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { apiClient } from '../../api/client';
import type { HospitalResponse } from '../../api/client';

// Fix Leaflet default icon path issue
import L from 'leaflet';

// 这一行必须在任何 Leaflet 组件渲染前执行。

// 使用合并选项，直接指定 Leaflet 查找图标的路径。
// 注意：如果您的打包工具没有将 marker-icon-2x.png 等文件复制到 /dist 或 /public 路径，
// 这里的路径可能需要调整为相对路径，但我们先尝试最标准的修复。
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'leaflet/dist/images/marker-icon.png',
    shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

export function NYCPage() {
  const [selectedBorough, setSelectedBorough] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<HospitalResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [boroughs, setBoroughs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available boroughs (only once on mount)
  useEffect(() => {
    const fetchBoroughs = async () => {
      try {
        const boroughsData = await apiClient.getBoroughs();
        setBoroughs(['All', ...boroughsData]);
      } catch (err) {
        console.error('Error fetching boroughs:', err);
      }
    };

    if (boroughs.length === 0) {
      fetchBoroughs();
    }
  }, []);

  // Fetch hospitals based on selected borough
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const boroughParam = selectedBorough === 'All' ? undefined : selectedBorough;
        const hospitalsData = await apiClient.getHospitals({ borough: boroughParam });
        setHospitals(hospitalsData);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hospital data');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [selectedBorough]);

  // Map center point (NYC approximate center)
  const position: [number, number] = [40.730610, -73.935242];

  // Handle dropdown selection change
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBorough(event.target.value);
    setSelectedHospital(null); // Clear selected hospital when filter changes
  };

  // Handle hospital selection from map or list
  const handleHospitalSelect = (hospital: HospitalResponse) => {
    setSelectedHospital(hospital);
  };

  return (
    <div className="nyc-dashboard-page">
      <h1>NYC Asthma Health Resources</h1>

      {error && (
        <div className="error-message" style={{ 
          padding: '1rem', 
          margin: '1rem 0', 
          background: 'rgba(248, 113, 113, 0.1)', 
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: '8px',
          color: '#f87171'
        }}>
          Error: {error}
        </div>
      )}

      <div className="dashboard-layout">
        
        {/* Left Control Panel */}
        <div className="control-panel">
          <div className="filter-section">
            <label htmlFor="borough-select">Filter by Borough:</label>
            <select 
              id="borough-select" 
              value={selectedBorough} 
              onChange={handleSelectChange}
              disabled={loading}
            >
              {boroughs.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          
          <div className="list-section">
            <h3>Hospitals in {selectedBorough}</h3>
            {loading ? (
              <p>Loading hospitals...</p>
            ) : hospitals.length === 0 ? (
              <p>No hospitals found for selected borough.</p>
            ) : (
              <ul>
                {hospitals.map(h => (
                  <li 
                    key={h.id} 
                    className={selectedHospital?.id === h.id ? 'selected' : ''}
                    onClick={() => handleHospitalSelect(h)}
                  >
                    {h.name} ({h.borough})
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Hospital Details Card */}
          <div className="details-card">
            {selectedHospital ? (
              <>
                <h2>{selectedHospital.name}</h2>
                <p><strong>Address:</strong> {selectedHospital.address}</p>
                {selectedHospital.zip_code && (
                  <p><strong>Zip Code:</strong> {selectedHospital.zip_code}</p>
                )}
                <p><strong>Borough:</strong> {selectedHospital.borough}</p>
                {selectedHospital.specialty && (
                  <p><strong>Specialty:</strong> {selectedHospital.specialty}</p>
                )}
                {selectedHospital.phone && (
                  <p><strong>Phone:</strong> {selectedHospital.phone}</p>
                )}
                {selectedHospital.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399' }}>
                      {selectedHospital.website}
                    </a>
                  </p>
                )}
                {selectedHospital.beds && (
                  <p><strong>Beds:</strong> {selectedHospital.beds}</p>
                )}
                {selectedHospital.asthma_specialists && (
                  <p><strong>Asthma Specialists:</strong> {selectedHospital.asthma_specialists}</p>
                )}
                {selectedHospital.description && (
                  <p><strong>Description:</strong> {selectedHospital.description}</p>
                )}
              </>
            ) : (
              <p>Select a hospital from the list or map for details.</p>
            )}
          </div>
        </div>
{/* 右侧地图展示 - 暂时注释掉 */}
{/*
        
        <div className="map-container">
          {loading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#a7f3d0'
            }}>
              Loading map...
            </div>
          ) : (
            <MapContainer center={position} zoom={11} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {hospitals.map(h => (
                <Marker 
                  key={h.id} 
                  position={[h.latitude, h.longitude]}
                  eventHandlers={{ click: () => handleHospitalSelect(h) }}
                >
                  <Popup>
                    <strong>{h.name}</strong><br />
                    {h.address}<br />
                    {h.borough}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>*/}
        {/* **临时占位符** */}
    <div style={{ flex: 2, height: '70vh', backgroundColor: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <h2>MAP TEST: If you see this, the map component is the problem.</h2>
   </div>
      </div>
    </div>
  );
}