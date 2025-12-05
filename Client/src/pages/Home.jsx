import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import logo3 from '../assets/logo3.png';

// --- Icons & Logo ---
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

const Logo = () => <img src={logo3} alt="Routely Logo" className="logo3" />;

// --- UPDATED VehicleOptions Component (Visual Fixes Applied) ---
const VehicleOptions = ({ results, pricingData }) => {
  
  // Helper to format distance text
  const distanceText = results.distance > 1000
    ? `${(results.distance / 1000).toFixed(1)} km`
    : `${results.distance} m`;

  // Helper to format duration text
  const formatDuration = (secs) => {
    if (!Number.isFinite(secs) || secs <= 0) return '';
    const minutes = Math.round(secs / 60);
    if (minutes < 60) return `${minutes} mins`;
    const hrs = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem === 0 ? `${hrs} hr${hrs > 1 ? 's' : ''}` : `${hrs} hr ${rem} mins`;
  };

  const timeText = formatDuration(results.duration);

  // Define the providers based on your ML response keys
  const providers = [
    { name: 'Ola', price: pricingData.ola_price, icon: '🚖' },
    { name: 'Uber', price: pricingData.uber_price, icon: '🚘' },
    { name: 'Rapido', price: pricingData.rapido_price, icon: '🛵' }
  ];

  // Inline styles for a clean, non-broken look
  const styles = {
    container: {
      padding: '10px 0',
      fontFamily: "'Inter', sans-serif",
    },
    statsRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      marginTop: '10px'
    },
    statBadge: {
      background: '#f0f4ff',
      color: '#0056b3',
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between', // Pushes Name left and Price right
      alignItems: 'center',
      padding: '16px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
      transition: 'border-color 0.2s',
      cursor: 'default'
    },
    leftSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    icon: {
      fontSize: '24px',
    },
    name: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333'
    },
    price: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#28a745'
    }
  };

  return (
    <div style={styles.container}>
      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statBadge}>
          <span>📍</span> {distanceText}
        </div>
        <div style={styles.statBadge}>
          <span>⏱️</span> {timeText}
        </div>
      </div>

      {/* Vehicle List */}
      <ul style={styles.list}>
        {providers.map(provider => (
          <li key={provider.name} style={styles.item}>
            <div style={styles.leftSide}>
              <span style={styles.icon}>{provider.icon}</span>
              <span style={styles.name}>{provider.name}</span>
            </div>
            <span style={styles.price}>
               {provider.price ? `₹${Math.round(provider.price)}` : 'N/A'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};


// --- Main HomePage Component ---
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
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [pricingData, setPricingData] = useState(null);
  const [sidebarPosition, setSidebarPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [resultsshown, setresultsshown] = useState(false);
  const startY = useRef(0);
  const startPos = useRef(0);
  const maxPos = useRef(0);

  // Initialize Map
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

  // When results are shown on mobile, snap the sidebar open
  useEffect(() => {
    if (resultsshown && window.innerWidth <= 900) {
      setSidebarPosition(0);
    }
  }, [resultsshown]);

  // --- UPDATED: Fetch Pricing from ML Model ---
  const fetchIntelligentPricing = async (source, destination, distanceMeters, durationSeconds) => {
    try {
      // 1. Convert units for the ML Model
      // Distance: meters -> km
      const distanceKm = (distanceMeters / 1000); 
      // Duration: seconds -> minutes
      const durationMin = (durationSeconds / 60);

      // 2. POST request to your ML API
      const response = await fetch("https://routely-website-137.onrender.com/predict_fares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source,
          destination: destination,
          distance: distanceKm,
          duration: durationMin
        })
      });

      if (!response.ok) {
        throw new Error(`ML Server returned ${response.status}`);
      }

      // 3. Return the JSON { ola_price, uber_price, rapido_price }
      const pricing = await response.json();
      return pricing;

    } catch (error) {
      console.error('Pricing fetch failed:', error);
      throw new Error('Cannot connect to fare prediction service.');
    }
  };

  // Handle Input Changes (Autocomplete)
  const handleInputChange = async (e, field) => {
    const value = e.target.value;

    if (field === 'pickup') {
      setPickup(value);
      setPickupCoords(null);
      setPickupAddress('');
    } else {
      setDropoff(value);
      setDropoffCoords(null);
      setDropoffAddress('');
    }
    setSearchResults(null);
    setresultsshown(false);
    setPricingData(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length < 3) {
      if (field === 'pickup') {
        setPickupSuggestions([]);
      } else {
        setDropoffSuggestions([]);
      }
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.olamaps.io/places/v1/autocomplete?location=20.2961,85.8245&input=${encodeURIComponent(
            value
          )}&api_key=${import.meta.env.VITE_OLA_API_KEY}`
        );

        const data = await response.json();
      
        let features = [];
        if (Array.isArray(data.predictions)) {
          features = data.predictions;
        } else if (Array.isArray(data.features)) {
          features = data.features;
        } else if (Array.isArray(data.results)) {
          features = data.results;
        } else if (Array.isArray(data)) {
          features = data;
        }

        const normalized = features.map((f, idx) => {
          const props = f.properties || f;
          const geom = f.geometry || {};
          let coords = null;
          if (Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) coords = geom.coordinates;
          else if (Array.isArray(f.coordinates) && f.coordinates.length >= 2) coords = f.coordinates;
          else if (Array.isArray(props.coordinates) && props.coordinates.length >= 2) coords = props.coordinates;
          else if (Array.isArray(props.center) && props.center.length >= 2) coords = props.center;
          else if (props.geometry && props.geometry.location && (props.geometry.location.lng || props.geometry.location.lon) && (props.geometry.location.lat || props.geometry.location.latitude)) {
            coords = [props.geometry.location.lng ?? props.geometry.location.lon, props.geometry.location.lat ?? props.geometry.location.latitude];
          } else if (props.location && (props.location.lng || props.location.lon) && (props.location.lat || props.location.latitude)) {
            coords = [props.location.lng ?? props.location.lon, props.location.lat ?? props.location.latitude];
          }
          
          const mainText = props.structured_formatting?.main_text || props.name || props.label || props.display_name || props.text || '';
          const secondaryText = props.structured_formatting?.secondary_text || '';
          return {
            id: props.id || props.place_id || props.reference || props.osm_id || idx,
            properties: {
              name: mainText,
              label: secondaryText,
              description: props.description || '',
              county: props.county || props.region || props.admin || '',
            },
            geometry: { coordinates: coords },
          };
        });

        if (field === 'pickup') {
          setPickupSuggestions(normalized);
        } else {
          setDropoffSuggestions(normalized);
        }
      } catch (error) {
        console.error('Autocomplete fetch failed:', error);
      }
    }, 300);
  };

  const handleSuggestionClick = (field, feature) => {
    let coords = feature?.geometry?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) {
      coords = null;
    }
    if (!coords) {
      const props = feature?.properties || {};
      if (Array.isArray(feature?.coordinates) && feature.coordinates.length >= 2) coords = feature.coordinates;
      else if (Array.isArray(props.coordinates) && props.coordinates.length >= 2) coords = props.coordinates;
      else if (Array.isArray(props.center) && props.center.length >= 2) coords = props.center;
      else if (props.location && (props.location.lng || props.location.lon) && (props.location.lat || props.location.latitude)) {
        coords = [props.location.lng ?? props.location.lon, props.location.lat ?? props.location.latitude];
      }
    }
    if (!coords) {
      alert('No coordinates found for this suggestion.');
      return;
    }
    let lon = parseFloat(coords[0]);
    let lat = parseFloat(coords[1]);
    
    const inIndia = (lo, la) => (la >= 6 && la <= 37 && lo >= 68 && lo <= 97);
    if (!inIndia(lon, lat) && inIndia(lat, lon)) {
      [lon, lat] = [lat, lon];
    }
    
    const addressLabel = feature?.properties?.description || feature?.properties?.label || feature?.properties?.name || '';
    const addressName = feature?.properties?.name || feature?.properties?.label || '';
    if (field === 'pickup') {
      setPickup(addressLabel);
      setPickupCoords([lon, lat]);
      setPickupAddress(addressName);
      setPickupSuggestions([]);
    } else {
      setDropoff(addressLabel);
      setDropoffCoords([lon, lat]);
      setDropoffAddress(addressName);
      setDropoffSuggestions([]);
    }
    setActiveInput(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickupCoords || !dropoffCoords || !pickupAddress || !dropoffAddress) {
      alert("Please select a valid location from the suggestions");
      return;
    }
    setLoading(true);
    setSearchResults(null);
    setresultsshown(false);
    setPricingData(null);

    try {
      // 1. Get Route Details (Distance/Duration) from OpenRouteService
      const routeResponse = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
        method: 'POST',
        headers: {
          'Authorization': import.meta.env.VITE_ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates: [pickupCoords, dropoffCoords] })
      });

      if (!routeResponse.ok) {
        throw new Error('Failed to get route information');
      }

      const routeData = await routeResponse.json();
      const summary = routeData.features[0].properties.summary || {};
      const distance = summary.distance; // meters
      const duration = summary.duration; // seconds

      // 2. Fetch Pricing from your ML Model
      // We pass the addresses and the exact distance/duration from the route service
      const pricingResult = await fetchIntelligentPricing(
        pickupAddress, 
        dropoffAddress, 
        distance, 
        duration
      );

      // 3. Render Map Route
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

        // Add markers
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

      setSearchResults({ distance, duration });
      setPricingData(pricingResult);
      setresultsshown(true);
    } catch (error) {
      console.error("Failed to find route or pricing:", error);
      alert(error.message || "Could not find a route or calculate pricing.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const tempPickup = pickup;
    const tempCoords = pickupCoords;
    const tempAddress = pickupAddress;

    setPickup(dropoff);
    setPickupCoords(dropoffCoords);
    setPickupAddress(dropoffAddress);

    setDropoff(tempPickup);
    setDropoffCoords(tempCoords);
    setDropoffAddress(tempAddress);
  };

  // Sidebar drag logic
  const handleTouchStart = (e) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startPos.current = sidebarPosition;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches[0].clientY;
    const delta = startY.current - clientY; 
    const desired = Math.round(startPos.current - delta);
    const clamped = Math.max(0, Math.min(maxPos.current || 0, desired));
    setSidebarPosition(clamped);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const snapThreshold = (maxPos.current || 0) / 2;
    setSidebarPosition(prev => (prev <= snapThreshold ? 0 : (maxPos.current || 0)));
  };

  const handleHandleClick = () => {
    setSidebarPosition(prev => (prev === 0 ? (maxPos.current || 0) : 0));
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

  useEffect(() => {
    const setInitialSidebar = () => {
      const el = sidebarRef.current;
      if (!el) return;
      const height = el.offsetHeight || window.innerHeight * 0.65;
      const peek = Math.min(140, Math.round(height * 0.35));
      const max = Math.max(0, height - peek);
      maxPos.current = max;
      setSidebarPosition(max);
    };

    if (window.innerWidth <= 900) setInitialSidebar();
    const onResize = () => { if (window.innerWidth <= 900) setInitialSidebar(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="home-container">
      <header className="header">
        <Link to="/" className="logo-container"><Logo /></Link>
        <div className="user-profile" onClick={() => navigate('/profile')}
          style={window.innerWidth <= 768 ? { marginLeft: 0, order: 2 } : {}}>
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
            onClick={handleHandleClick}
          />

          <div className="sidebar-content">
            <h2 className='infos'>{window.innerWidth <= 900 ? "Enter points" : "Plan Your Ride"}</h2>
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
                      <li key={feature.id} onClick={() => handleSuggestionClick('pickup', feature)}>
                        <span>{feature.properties.name}</span>
                        {feature.properties.label && (
                          <span className="suggestion-label">{feature.properties.label}</span>
                        )}
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
                      <li key={feature.id} onClick={() => handleSuggestionClick('dropoff', feature)}>
                        <span>{feature.properties.name}</span>
                        {feature.properties.label && (
                          <span className="suggestion-label">{feature.properties.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!resultsshown && (
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Calculating...' : 'Compare ride prices'}
                </button>
              )}
            </form>

            {searchResults && pricingData && (
              <VehicleOptions results={searchResults} pricingData={pricingData} />
            )}

            {resultsshown && (
              <button
                type="button"
                className="submit-button"
                onClick={() => {
                  setresultsshown(false);
                  setSearchResults(null);
                  setPricingData(null);
                  setPickupCoords(null);
                  setDropoffCoords(null);
                  setPickupAddress('');
                  setDropoffAddress('');
                }}
                style={{ marginTop: '20px' }}
              >
                Edit location
              </button>
            )}
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