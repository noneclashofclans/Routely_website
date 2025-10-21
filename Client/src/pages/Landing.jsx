import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";
import logo3 from '../assets/logo3.png';

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="pageContainer">
      <header className="header">
        <img
          src={logo3}
          alt="Routely Logo"
          className="logo"
          onClick={() => navigate("/")}
        />
        <nav>
          {isLoggedIn ? (
            <div className="user-profile" onClick={handleLogout}>
              <UserIcon />
            </div>
          ) : (
            <>
              <Link className="navLink" to="/login">
                Log In
              </Link>
              <Link className="navLink signUpButton" to="/register">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
      <section className="hero">
        <div className="heroContent">
          <h1 className="heroTitle">
            One Journey. All the Rides. The Best Price.
          </h1>
          <p className="heroSubtitle">
            Stop switching between apps. Compare fares from Uber, Ola, and
            Rapido in one place and choose the smartest way to travel.
          </p>
          <Link className="ctaButton" to="/register">
            Get Started for Free
          </Link>
        </div>
      </section>

      <section className="animation-section">
        <div className="road">
          <svg
            className="car"
            style={{ animationDelay: "0s" }}
            width="120"
            height="60"
            viewBox="0 0 120 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M104.5 38.5C108.5 38.5 111 36 111 32V25.5C111 21.5 108.5 19 104.5 19H86.5L78 10H31L22.5 19H14C10 19 7.5 21.5 7.5 25.5V32C7.5 36 10 38.5 14 38.5H104.5Z"
              fill="#4A90E2"
              stroke="#2c3e50"
              strokeWidth="2"
            />
            <circle
              cx="30"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
            <circle
              cx="89"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
          </svg>

          <svg
            className="car"
            style={{ animationDelay: "-3s" }}
            width="120"
            height="60"
            viewBox="0 0 120 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M104.5 38.5C108.5 38.5 111 36 111 32V25.5C111 21.5 108.5 19 104.5 19H86.5L78 10H31L22.5 19H14C10 19 7.5 21.5 7.5 25.5V32C7.5 36 10 38.5 14 38.5H104.5Z"
              fill="#f5a623"
              stroke="#2c3e50"
              strokeWidth="2"
            />
            <circle
              cx="30"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
            <circle
              cx="89"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
          </svg>

          <svg
            className="car"
            style={{ animationDelay: "-6s", animationDuration: "9s" }}
            width="120"
            height="60"
            viewBox="0 0 120 60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M104.5 38.5C108.5 38.5 111 36 111 32V25.5C111 21.5 108.5 19 104.5 19H86.5L78 10H31L22.5 19H14C10 19 7.5 21.5 7.5 25.5V32C7.5 36 10 38.5 14 38.5H104.5Z"
              fill="#d0021b"
              stroke="#2c3e50"home
              strokeWidth="2"
            />
            <circle
              cx="30"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
            <circle
              cx="89"
              cy="45"
              r="8"
              fill="#FFF"
              stroke="#2c3e50"
              strokeWidth="2"
            />
          </svg>
        </div>
      </section>

      <section className="howItWorks">
        <h2 className="sectionTitle">How It Works ?</h2>
        <div className="stepsContainer">
          <div className="step">
            <div className="stepIcon">1</div>
            <h4>Enter Your Destination</h4>
            <p>Just tell us where you want to go.</p>
          </div>
          <div className="step">
            <div className="stepIcon">2</div>
            <h4>Choose & Book</h4>
            <p>Pick the best option and ride smarter.</p>
          </div>
          <div className="step">
            <div className="stepIcon">3</div>
            <h4>Hassle-free payment</h4>
            <p>Pay your ride fees directly from our website!</p>
          </div>
        </div>
      </section>
      <section className="features">
        <h2 className="sectionTitle">The Right Path to Savings</h2>
        <div className="featuresGrid">
          <div className="featureItem">
            <h3>Save Money</h3>
            <p>
              Always find the cheapest ride without the hassle of checking
              multiple apps.
            </p>
          </div>
          <div className="featureItem">
            <h3>Save Time</h3>
            <p>
              One search is all it takes. Get a complete picture of your ride
              options in seconds.
            </p>
          </div>
          <div className="featureItem">
            <h3>Ride Confidently</h3>
            <p>
              Make informed decisions with transparent pricing, all in one
              simple interface.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Routely. All rights reserved. Made by
        <b>Rishit Mohanty</b>.
      </footer>
    </div>
  );
};

export default Landing;