import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import logo3 from '../assets/logo3.png';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const LocationPinIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> );
const SwapIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> );
const Logo = () => ( <img src={logo3} alt="Routely Logo" className="logo" /> );

const VehicleOptions = ({ results }) => {
    const vehicleTypes = [
        { name: 'Bike', icon: '🏍️', rate: 8 },
        { name: 'Auto', icon: '🛺', rate: 10 },
        { name: 'Mini', icon: '🚗', rate: 12 },
        { name: 'Sedan', icon: '🚙', rate: 15 },
        { name: 'SUV', icon: '🚐', rate: 18 },
    ];

    const calculatePrice = (rate) => {
        const distanceInKm = results.distance / 1000;
        return `₹ ${Math.round(distanceInKm * rate)}`;
    };

    return (
        <div className="results-container">
            <h4>Ride Options ({results.distance > 1000 ? `${(results.distance / 1000).toFixed(1)} km` : `${results.distance} m`})</h4>
            <ul className="vehicle-list">
                {vehicleTypes.map(vehicle => (
                    <li key={vehicle.name} className="vehicle-item">
                        <span className="vehicle-icon">{vehicle.icon}</span>
                        <span className="vehicle-name">{vehicle.name}</span>
                        <span className="vehicle-price">{calculatePrice(vehicle.rate)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const mapContainer = useRef(null);
    const map = useRef(null);
    const debounceTimeout = useRef(null);

    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [activeInput, setActiveInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
            center: [85.8245, 20.2961],
            zoom: 12,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            map.current.addSource('route', {
                'type': 'geojson',
                'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }
            });
            map.current.addLayer({
                'id': 'route', 'type': 'line', 'source': 'route',
                'layout': { 'line-join': 'round', 'line-cap': 'round' },
                'paint': { 'line-color': '#003366', 'line-width': 6 }
            });
        });
    }, []);

    const handleInputChange = async (e, field) => {
        const value = e.target.value;
        
        if (field === 'pickup') {
            setPickup(value);
            setPickupCoords(null);
        } else {
            setDropoff(value);
            setDropoffCoords(null);
        }
        setSearchResults(null);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length < 3) {
            setPickupSuggestions([]);
            setDropoffSuggestions([]);
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${import.meta.env.VITE_ORS_API_KEY}&text=${value}&focus.point.lon=85.8245&focus.point.lat=20.2961`);
                const data = await response.json();
                if (field === 'pickup') {
                    setPickupSuggestions(data.features);
                } else {
                    setDropoffSuggestions(data.features);
                }
            } catch (error) {
                console.error('Autocomplete fetch failed:', error);
            }
        }, 300);
    };

    const handleSuggestionClick = (field, feature) => {
        const [lon, lat] = feature.geometry.coordinates;
        const addressLabel = feature.properties.label;

        if (field === 'pickup') {
            setPickup(addressLabel);
            setPickupCoords([lon, lat]);
            setPickupSuggestions([]);
        } else {
            setDropoff(addressLabel);
            setDropoffCoords([lon, lat]);
            setDropoffSuggestions([]);
        }
        setActiveInput(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pickupCoords || !dropoffCoords) {
            alert("Please select a valid location from the suggestions.");
            return;
        }
        setLoading(true);
        setSearchResults(null);
        
        try {
            const routeResponse = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
                method: 'POST',
                headers: { 'Authorization': import.meta.env.VITE_ORS_API_KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates: [pickupCoords, dropoffCoords] })
            });
            const routeData = await routeResponse.json();
            const routeGeometry = routeData.features[0].geometry.coordinates;
            const distance = routeData.features[0].properties.summary.distance;

            map.current.getSource('route').setData({
                type: 'Feature', geometry: { type: 'LineString', coordinates: routeGeometry }
            });

            document.querySelectorAll('.maplibregl-marker').forEach(marker => marker.remove());
            new maplibregl.Marker({ color: '#28a745' }).setLngLat(pickupCoords).addTo(map.current);
            new maplibregl.Marker({ color: '#dc3545' }).setLngLat(dropoffCoords).addTo(map.current);
            
            const bounds = new maplibregl.LngLatBounds(pickupCoords, dropoffCoords);
            map.current.fitBounds(bounds, { padding: 60 });
            
            setSearchResults({ distance });
        } catch (error) {
            console.error("Failed to find route:", error);
            alert("Could not find a route.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSwap = () => {
        const tempPickup = pickup;
        const tempCoords = pickupCoords;
        setPickup(dropoff);
        setPickupCoords(dropoffCoords);
        setDropoff(tempPickup);
        setDropoffCoords(tempCoords);
    };

    return (
        <div className="home-container">
            <header className="header">
                <Link to="/" className="logo-container"><Logo /></Link>
                <div className="user-profile" onClick={() => navigate('/profile')}>
                    <UserIcon />
                </div>
            </header>
            <main className="main-content">
                <aside className="sidebar">
                    <h2>Plan Your Ride</h2>
                    <form className="ride-form" onSubmit={handleSubmit}>
                         <div className="input-group">
                            <span className="input-icon"><LocationPinIcon /></span>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Pickup Point" 
                                value={pickup} 
                                onChange={(e) => handleInputChange(e, 'pickup')}
                                onFocus={() => setActiveInput('pickup')}
                                autoComplete="off"
                            />
                            {activeInput === 'pickup' && pickupSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {pickupSuggestions.map(feature => (
                                        <li key={feature.properties.id} onClick={() => handleSuggestionClick('pickup', feature)}>
                                            {feature.properties.name}
                                            <span className="suggestion-label">{feature.properties.county}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="input-group">
                            <span className="input-icon"><LocationPinIcon /></span>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Drop Point" 
                                value={dropoff} 
                                onChange={(e) => handleInputChange(e, 'dropoff')} 
                                onFocus={() => setActiveInput('dropoff')}
                                autoComplete="off"
                            />
                            <button type="button" className="swap-button" onClick={handleSwap} title="Swap locations"><SwapIcon /></button>
                             {activeInput === 'dropoff' && dropoffSuggestions.length > 0 && (
                                <ul className="suggestions-list">
                                    {dropoffSuggestions.map(feature => (
                                        <li key={feature.properties.id} onClick={() => handleSuggestionClick('dropoff', feature)}>
                                            {feature.properties.name}
                                            <span className="suggestion-label">{feature.properties.county}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="submit" className="submit-button" disabled={loading}>
                            {loading ? 'Searching...' : 'Find Rides'}
                        </button>
                    </form>

                    {searchResults && <VehicleOptions results={searchResults} />}
                </aside>
                <section className="map-placeholder">
                    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
                </section>
            </main>
        </div>
    );
};

export default HomePage;