import React, { useState, useEffect } from "react";
// --- FIX: Re-imported Link and useNavigate ---
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  // --- FIX: Initialized useNavigate ---
  const navigate = useNavigate(); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // --- FIX: Removed simulation block and restored real localStorage calls ---

    /*
    // Simulating a logged-out state. Change to true to test logged-in.
    const simulation = {
        token: null, 
        user: JSON.stringify({ email: "test.user@example.com" }) 
    };
    // To test logged out:
    // const simulation = { token: null, user: null };
    // To test logged in:
    // const simulation = { token: "fake-token", user: JSON.stringify({ email: "test.user@example.com" }) };
    */

    // --- FIX: Using actual localStorage values ---
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user"); // Using lowercase 'user' from previous fix
    
    setIsLoggedIn(!!token);
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        const email = userData.email || userData.userEmail || userData.username || userData.name || "";
        setUserEmail(email);
      } catch (error) {
        console.error("Error parsing user data:", error);
        if (typeof user === 'string') {
          setUserEmail(user);
        }
      }
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default action
    // --- FIX: Restored actual logout logic ---
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/"); // Use navigate to redirect
    // console.log("User logged out (simulated)"); // Removed simulation log
  };

  // display userEmail directly in header

  // Placeholder logo URL
  const logoUrl = "https://placehold.co/150x50/4A90E2/FFFFFF?text=Routely&font=sans";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md w-full sticky top-0 z-50">
        <img
          src={logoUrl}
          alt="Routely Logo"
          className="h-10"
          // --- FIX: Use navigate for logo click ---
          onClick={() => navigate("/")}
        />
        <nav className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">{userEmail}</span>
              {/* --- FIX: Changed <a> to <button> for click handler --- */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              {/* --- FIX: Changed <a> to <Link> for router navigation --- */}
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex items-center justify-center text-center bg-white py-20 px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            One Journey. All the Rides. The Best Price.
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Stop switching between apps. Compare fares from Uber, Ola, and
            Rapido in one place and choose the smartest way to travel.
          {/* --- FIX: Corrected closing tag --- */}
          </p>
          {/* --- FIX: Changed <a> to <Link> for router navigation --- */}
          <Link
            to={isLoggedIn ? "/home" : "/register"}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200 inline-block"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started for Free"}
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works?</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto px-4">
          <div className="flex-1 p-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              1
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Destination</h4>
            <p className="text-gray-600">Just tell us where you want to go.</p>
          </div>
          <div className="flex-1 p-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              2
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Choose & Book</h4>
            <p className="text-gray-600">Pick the best option and ride smarter.</p>
          </div>
          <div className="flex-1 p-6">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
              3
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Hassle-free payment</h4>
            <p className="text-gray-600">Pay your ride fees directly from our website!</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">The Right Path to Savings</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Money</h3>
            <p className="text-gray-600">
              Always find the cheapest ride without the hassle of checking
              multiple apps.
            {/* --- FIX: Corrected closing tag --- */}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Time</h3>
            <p className="text-gray-600">
              One search is all it takes. Get a complete picture of your ride
              options in seconds.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ride Confidently</h3>
            <p className="text-gray-600">
              Make informed decisions with transparent pricing, all in one
              simple interface.
            </p>
            {/* --- FIX: Changed closing tag from </col> to </p> --- */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center p-6 bg-gray-800 text-gray-300 mt-auto">
        &copy; {new Date().getFullYear()} Routely. All rights reserved. Made by
        <b className="font-semibold text-white ml-1">Rishit Mohanty</b>.
      </footer>
    </div>
  );
};

// --- FIX: Removed the 'App' wrapper component ---
/*
const App = () => {
    // In a real multi-page app, you'd have a router here.
    // For this single-file preview, we just render the Landing page.
    return <Landing />;
};
*/

// --- FIX: Export 'Landing' directly ---
export default Landing;

