import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = location.pathname === '/profile';
  const overlayRef = useRef(null);

  const handleBackdropClick = (e) => {

    if (e.target === e.currentTarget || e.target === overlayRef.current) {
      navigate('/home');
    }
  };


  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isProfilePage) {
        navigate('/home');
      }
    };

    if (isProfilePage) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when profile is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isProfilePage, navigate]);

  return (
    <div className={`app-layout ${isProfilePage ? 'profile-open' : ''}`}>
      {/* Background Home */}
      <div className="background-content">
        <Home />
      </div>
      
      {isProfilePage && (
        <div 
          ref={overlayRef}
          className="overlay-content" 
          onClick={handleBackdropClick}
        >
          {children}
        </div>
      )}
      
      {!isProfilePage && children}
    </div>
  );
};

export default Layout;