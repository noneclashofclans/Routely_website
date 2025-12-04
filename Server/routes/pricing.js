const express = require("express");
const fetch = require("node-fetch"); 
const router = express.Router();

const PYTHON_ML_URL = process.env.PYTHON_ML_URL || "https://routely-website-137.onrender.com/predict_fares"; 


function normalizeTimePeriod(timeStr) {
  if (!timeStr) {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Morning";
    if (h >= 12 && h < 17) return "Afternoon";
    if (h >= 17 && h < 21) return "Evening";
    return "Night";
  }
  return timeStr;
}

router.post("/estimates", async (req, res) => {
  try {
    const { startAddress, endAddress, distance_km, duration_min, time_of_day } = req.body;

    if (typeof distance_km !== "number" || Number.isNaN(distance_km)) {
      return res.status(400).json({
        success: false,
        error: "Please provide distance_km (number). Frontend should compute route distance."
      });
    }

    const timePeriod = normalizeTimePeriod(time_of_day);

    // 1. Prepare single request body for the Python API
    const requestBody = {
      distance: distance_km, // Python API expects 'distance'
      time_of_day: timePeriod
    };

    // 2. Make a single fetch call to the Python API
    const response = await fetch(PYTHON_ML_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        timeout: 10000
    });

    if (!response.ok) {
        // Handle errors from the Python service (e.g., 404, 500)
        const errorText = await response.text().catch(()=>"");
        throw new Error(`ML Service Error ${response.status}: ${errorText}`);
    }

    const pythonData = await response.json();
    
    // The Python API returns results in pythonData.results
    const results = pythonData.results || []; 

    // 3. Build shaped estimates object from the consolidated results
    const estimates = {};
    
    for (const r of results) {
      const pKey = (r.platform || "").toLowerCase();
      const vKey = (r.vehicle_type || "").toLowerCase();
      
      // Initialize platform key if it doesn't exist
      if (!estimates[pKey]) estimates[pKey] = {};
      
      estimates[pKey][vKey] = {
        price: Math.round((r.estimated_fare + Number.EPSILON) * 100) / 100,
        currency: "INR",
        vehicle: vKey // Use lowercase vehicle type for consistency
      };
    }

    return res.json({
      success: true,
      estimates,
      cheapest_option: pythonData.cheapest || null, // Include the cheapest option identified by Python
      route: {
        start: startAddress || null,
        end: endAddress || null,
        distance_km,
        duration_min: duration_min || null
      },
      timing: {
        period: timePeriod,
        description: `${timePeriod} Hours`
      },
      source: "ml_estimation_consolidated"
    });

  } catch (error) {
    console.error("Pricing route error:", error.message);
    // Return a 503 Service Unavailable if the Python ML service is down/misconfigured
    const statusCode = error.message.includes("fetch failed") ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      error: error.message || "unknown_error",
      message: "Could not get fare estimates from the prediction service."
    });
  }
});

module.exports = router;