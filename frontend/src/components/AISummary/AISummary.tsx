import { useState, useEffect } from 'react';
import './AISummary.css';

interface AISummaryData {
    summary: string;
    highlights: string[];
    recommendation: string;
    dataTimestamp: string;
}

interface AISummaryProps {
    avgAQI: number;
    avgBreathability: number;
    totalCities: number;
    avgTemperature: number;
    totalPopulation: number;
    percentGoodBreathability: number;
    percentPoorBreathability: number;
    mostPollutedCity: string;
    mostPollutedAQI: number;
    cleanestCity: string;
    cleanestAQI: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function AISummary(props: AISummaryProps) {
    const [data, setData] = useState<AISummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    avgAQI: props.avgAQI,
                    avgBreathability: props.avgBreathability,
                    totalCities: props.totalCities,
                    avgTemperature: props.avgTemperature,
                    totalPopulation: props.totalPopulation,
                    percentGoodBreathability: props.percentGoodBreathability,
                    percentPoorBreathability: props.percentPoorBreathability,
                    mostPollutedCity: props.mostPollutedCity,
                    mostPollutedAQI: props.mostPollutedAQI,
                    cleanestCity: props.cleanestCity,
                    cleanestAQI: props.cleanestAQI,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch AI summary');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [props.avgAQI, props.totalCities]);

    return (
        <div className="ai-summary-card dashboard-card">
            <div className="ai-summary-header">
                <div className="ai-icon">🤖</div>
                <h2>AI Climate Insights</h2>
                <span className="ai-badge">Smart Analysis</span>
            </div>

            {loading && (
                <div className="ai-summary-loading">
                    <div className="skeleton skeleton-line"></div>
                    <div className="skeleton skeleton-line medium"></div>
                    <div className="skeleton skeleton-line short"></div>
                </div>
            )}

            {error && (
                <div className="ai-summary-error">
                    <p>Unable to generate AI insights</p>
                    <button className="retry-button" onClick={fetchSummary}>
                        🔄 Retry
                    </button>
                </div>
            )}

            {data && !loading && !error && (
                <div className="ai-summary-content">
                    <p className="ai-summary-text">{data.summary}</p>

                    {expanded && (
                        <>
                            <div className="ai-highlights">
                                {data.highlights.map((highlight, index) => (
                                    <div key={index} className="ai-highlight">
                                        {highlight}
                                    </div>
                                ))}
                            </div>

                            <div className="ai-recommendation">
                                <strong>💡 Recommendation:</strong> {data.recommendation}
                            </div>
                        </>
                    )}

                    <button
                        className="collapse-toggle"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '▲ Show less' : '▼ Show more'}
                    </button>

                    <div className="ai-timestamp">
                        Last updated: {data.dataTimestamp}
                    </div>
                </div>
            )}
        </div>
    );
}
