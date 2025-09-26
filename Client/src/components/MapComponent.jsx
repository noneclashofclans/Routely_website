import React from 'react';
import { Map, Marker } from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapComponent = () => {
 
    const mapTilerStyleUrl = `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`;

    
    const initialViewState = {
        longitude: 85.8245,
        latitude: 20.2961,
        zoom: 12
    };

    return (
        <Map
            reuseMaps
            mapLib={maplibregl} 
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapTilerStyleUrl}
        >
            <Marker longitude={85.8245} latitude={20.2961} anchor="bottom" />
        </Map>
    );
};

export default MapComponent;