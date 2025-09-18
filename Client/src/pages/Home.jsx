import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo3 from '../assets/logo3.png';

const HomePage = () => {
    const navigate = useNavigate();
    
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
    
    const Logo = () => (
        <img src={logo3} alt="Routely Logo" className="logo" onClick={() => navigate('/')} />
    );

    const [pickup, setPickup] = useState('Bhubaneswar, Odisha');
    const [dropoff, setDropoff] = useState('');

    const handleSwap = () => {
        setPickup(dropoff);
        setDropoff(pickup);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log("Searching for rides from:", pickup, "to", dropoff);
    };

    return (
        <div className="home-container">
            <header className="header">
                <a href="/" className="logo-container">
                    <Logo />
                </a>
                <div className="user-profile">
                    <UserIcon />
                </div>
            </header>
            <main className="main-content">
                <aside className="sidebar">
                    <h2>Plan Your Ride</h2>
                    <form className="ride-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <span className="input-icon">
                                <LocationPinIcon />
                            </span>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Pickup Point"
                                value={pickup}
                                onChange={(e) => setPickup(e.target.value)}
                            />
                        </div>
                        <div className="input-group" style={{ position: 'relative' }}>
                             <span className="input-icon">
                                <LocationPinIcon />
                            </span>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="Drop Point"
                                value={dropoff}
                                onChange={(e) => setDropoff(e.target.value)}
                            />
                            <button type="button" className="swap-button" onClick={handleSwap} title="Swap locations">
                                <SwapIcon />
                            </button>
                        </div>
                        <button type="submit" className="submit-button">Find Rides</button>
                    </form>
                </aside>
                <section className="map-placeholder">
                    <div className="map-placeholder-text">Map</div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;


