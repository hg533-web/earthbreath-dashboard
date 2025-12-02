import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import citiesData from '../data/mock_cities.json';
import './InteractiveGlobe.css';

interface Pollutants {
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    co: number;
    so2: number;
}

interface Metrics {
    humidity: number;
    temperature: number;
    pollutants: Pollutants;
}

interface City {
    id: number;
    name: string;
    country: string;
    lat: number;
    lng: number;
    population: number;
    aqi: number;
    breathability_index: number;
    metrics: Metrics;
}

export function InteractiveGlobe() {
    const globeEl = useRef<any>(null);
    const [hoveredCity, setHoveredCity] = useState<City | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Responsive globe using ResizeObserver
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        // Auto-rotate - DISABLED
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false;
            globeEl.current.controls().enableZoom = true;
        }
    }, []);

    const getCityColor = (aqi: number) => {
        if (aqi <= 50) return '#00e676'; // Good (Green)
        if (aqi <= 100) return '#ffeb3b'; // Moderate (Yellow)
        if (aqi <= 150) return '#ff9800'; // Unhealthy for Sensitive (Orange)
        if (aqi <= 200) return '#f44336'; // Unhealthy (Red)
        if (aqi <= 300) return '#9c27b0'; // Very Unhealthy (Purple)
        return '#795548'; // Hazardous (Brown)
    };

    const getCitySize = (population: number) => {
        // Sqrt scale for better variation
        // Pop range: ~8M to ~37M
        // Sqrt(8) ~ 2.8, Sqrt(37) ~ 6.0
        const baseSize = Math.sqrt(population / 1000000) * 2.5;
        return Math.max(6, Math.min(baseSize, 15)); // Clamp between 6px and 15px
    };

    const getAnimationClass = (breathability: number) => {
        // High breathability -> Slow breathe
        // Low breathability -> Rapid flicker
        return breathability > 0.5 ? 'animate-breathe' : 'animate-flicker';
    };

    const getPollutantColor = (type: string, value: number) => {
        // Simple thresholds for demo purposes
        let thresholds = { good: 0, moderate: 0 };

        switch (type) {
            case 'pm25': thresholds = { good: 12, moderate: 35 }; break;
            case 'pm10': thresholds = { good: 54, moderate: 154 }; break;
            case 'no2': thresholds = { good: 53, moderate: 100 }; break;
            case 'o3': thresholds = { good: 54, moderate: 70 }; break;
            default: return '#e6f1ff'; // Default white/light blue
        }

        if (value <= thresholds.good) return '#00e676'; // Good
        if (value <= thresholds.moderate) return '#ffeb3b'; // Moderate
        return '#f44336'; // Unhealthy
    };

    return (
        <div className="globe-container" ref={containerRef}>
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                htmlElementsData={citiesData}
                htmlElement={(d: any) => {
                    const city = d as City;
                    const color = getCityColor(city.aqi);
                    const size = getCitySize(city.population);
                    const animationClass = getAnimationClass(city.breathability_index);

                    const el = document.createElement('div');
                    el.className = 'city-marker-wrapper';
                    el.style.width = `${size}px`;
                    el.style.height = `${size}px`;
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.cursor = 'pointer';
                    el.style.pointerEvents = 'auto';

                    // Inner glowing light
                    const light = document.createElement('div');
                    light.className = `city-light ${animationClass}`;
                    light.style.backgroundColor = color;
                    light.style.color = color; // For box-shadow
                    light.style.width = '100%';
                    light.style.height = '100%';

                    el.appendChild(light);

                    // Hover events
                    el.onmouseenter = () => {
                        setHoveredCity(city);
                    };
                    el.onmouseleave = () => {
                        setHoveredCity(null);
                        // Auto-rotate remains disabled
                    };

                    el.onclick = () => {
                        setHoveredCity(city);
                    };

                    return el;
                }}
            />

            {hoveredCity && (
                <div className="city-tooltip" style={{ top: 20, right: 20 }}>
                    <h3>{hoveredCity.name}, {hoveredCity.country}</h3>
                    <div className="tooltip-metric">
                        <label>AQI:</label>
                        <span style={{ color: getCityColor(hoveredCity.aqi) }}>{hoveredCity.aqi}</span>
                    </div>
                    <div className="tooltip-metric">
                        <label>Breathability:</label>
                        <span>{(hoveredCity.breathability_index * 100).toFixed(0)}%</span>
                    </div>
                    <div className="tooltip-metric">
                        <label>Temp:</label>
                        <span>{hoveredCity.metrics.temperature}°C</span>
                    </div>
                    <div className="tooltip-metric">
                        <label>Humidity:</label>
                        <span>{hoveredCity.metrics.humidity}%</span>
                    </div>
                    <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                    <div className="tooltip-metric">
                        <label>PM2.5:</label>
                        <span style={{ color: getPollutantColor('pm25', hoveredCity.metrics.pollutants.pm25) }}>
                            {hoveredCity.metrics.pollutants.pm25}
                        </span>
                    </div>
                    <div className="tooltip-metric">
                        <label>PM10:</label>
                        <span style={{ color: getPollutantColor('pm10', hoveredCity.metrics.pollutants.pm10) }}>
                            {hoveredCity.metrics.pollutants.pm10}
                        </span>
                    </div>
                    <div className="tooltip-metric">
                        <label>O₃:</label>
                        <span style={{ color: getPollutantColor('o3', hoveredCity.metrics.pollutants.o3) }}>
                            {hoveredCity.metrics.pollutants.o3}
                        </span>
                    </div>
                    <div className="tooltip-metric">
                        <label>NO₂:</label>
                        <span style={{ color: getPollutantColor('no2', hoveredCity.metrics.pollutants.no2) }}>
                            {hoveredCity.metrics.pollutants.no2}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
