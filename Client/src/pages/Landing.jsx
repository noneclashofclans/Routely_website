import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Landing.css";
import logo3 from '../assets/logo3.png';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("User data from localStorage:", userData);


        const name = userData.name || userData.username || "User";
        setUserName(name);

        console.log("Extracted name:", name);
      } catch (error) {
        console.error("Error parsing user data:", error);
        if (typeof user === 'string') {
          setUserName(user);
        }
      }
    } else {
      console.log("No user data found in localStorage");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/");
  };

  const getDisplayName = () => {
    if (userName) {
      // Return the first name only if it contains a space
      if (userName.includes(' ')) {
        return userName.split(' ')[0];
      }
      return userName;
    }
    return "User";
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
            <div className="user-nav">
              <span className="user-name">Hello, {getDisplayName()}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
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
          <Link className="ctaButton" to={isLoggedIn ? "/home" : "/register"}>
            {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
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
        </div>
      </section>

      <section className="howItWorks">
        <h2 className="sectionTitle">How It Works ?</h2>
        <div className="stepsContainer">
          <div className="step">
            <div className="stepIcon">1</div>
            <h4>Enter Your Journey</h4>
            <p>Tell us your pickup and drop locations to get started.</p>
          </div>
          <div className="step">
            <div className="stepIcon">2</div>
            <h4>Compare Prices Instantly</h4>
            <p>See real-time fares from Uber, Ola, and Rapido side by side.</p>
          </div>
          <div className="step">
            <div className="stepIcon">3</div>
            <h4>Choose & Ride</h4>
            <p>Pick the best option and book directly through your preferred app.</p>
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