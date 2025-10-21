import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import logo3 from '../assets/logo3.png';

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const SwapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Logo = () => <img src={logo3} alt="Routely Logo" className="logo3" />;

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
  const sidebarRef = useRef(null);

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [sidebarPosition, setSidebarPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const initializeMap = () => {
      if (window.google && window.google.maps && mapContainer.current) {
        map.current = new window.google.maps.Map(mapContainer.current, {
          center: { lat: 20.2961, lng: 85.8245 },
          zoom: 12,
          disableDefaultUI: true,
        });
        setMapsLoaded(true);
      } else {
        console.error("Google Maps API not fully loaded at initialization.");
      }
    };

    const callbackName = "initMapHomePage";
    window[callbackName] = initializeMap;

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com/maps/api/js"]`);

    if (existingScript) {
      if (window.google && window.google.maps) {
        initializeMap();
      }
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&callback=${callbackName}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      if (window[callbackName]) {
        delete window[callbackName];
      }
    };
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
      const distance = routeData.features[0].properties.summary.distance;

      if (map.current && mapsLoaded && window.google && window.google.maps) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer();
        directionsRenderer.setMap(map.current);

        directionsService.route({
          origin: { lat: pickupCoords[1], lng: pickupCoords[0] },
          destination: { lat: dropoffCoords[1], lng: dropoffCoords[0] },
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        });

        new window.google.maps.Marker({
          position: { lat: pickupCoords[1], lng: pickupCoords[0] },
          map: map.current,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#28a745"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'),
            scaledSize: new window.google.maps.Size(30, 30),
          }
        });

        new window.google.maps.Marker({
          position: { lat: dropoffCoords[1], lng: dropoffCoords[0] },
          map: map.current,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#dc3545"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'),
            scaledSize: new window.google.maps.Size(30, 30),
          }
        });

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: pickupCoords[1], lng: pickupCoords[0] });
        bounds.extend({ lat: dropoffCoords[1], lng: dropoffCoords[0] });
        map.current.fitBounds(bounds);
      }

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

  
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY - sidebarPosition;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const clientY = e.touches[0].clientY;
    const newPosition = clientY - startY.current;

    
    const maxDragUp = -(sidebarRef.current.offsetHeight*0);
    const maxDragDown = (sidebarRef.current.offsetHeight*0.90);

    const clampedPosition = Math.min(maxDragDown, Math.max(maxDragUp, newPosition));
    setSidebarPosition(clampedPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    const threshold = -(sidebarRef.current.offsetHeight * 0.35);
    const snapOpen = -(sidebarRef.current.offsetHeight * 0.75);

    setSidebarPosition(prev => (prev < threshold ? snapOpen : 0));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 900) {
        if (!e.target.closest('.input-group')) {
          setActiveInput(null);
          setPickupSuggestions([]);
          setDropoffSuggestions([]);
        }
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    return () => document.removeEventListener('touchstart', handleClickOutside);
  }, []);

  return (
    <div className="home-container">
      <header className="header">
        <Link to="/" className="logo-container"><Logo /></Link>
        <div className="user-profile" onClick={() => navigate('/profile')}>
          <UserIcon />
        </div>
      </header>
      <main className="main-content">
        <aside
          ref={sidebarRef}
          className="sidebar"
          style={{
            transform: `translateY(${sidebarPosition}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
        >
          <div
            className="drag-handle"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          <div className="sidebar-content">
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
          </div>
        </aside>
        <section className="map-placeholder">
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
          {!mapsLoaded && (
            <div className="map-loading">
              Loading Map...
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
