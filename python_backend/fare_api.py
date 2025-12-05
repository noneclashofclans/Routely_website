import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)

# Correct CORS setup for Vercel → Render calls
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://routely-website-roris.vercel.app",
            "https://*.vercel.app"
        ]
    }
})

RAW_DATA_COLS = ['platform', 'vehicle_type', 'time_of_day']

# Load model + data
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'fare_model_pipeline.pkl')
    data_path = os.path.join(base_dir, 'fare_data.csv')

    model_pipeline = joblib.load(model_path)
    df_raw = pd.read_csv(data_path, usecols=RAW_DATA_COLS)
    print("Model loaded successfully.")

except Exception as e:
    print("Error:", e)
    model_pipeline = None
    df_raw = pd.DataFrame()


@app.post("/predict_fares")
def predict_fares():
    if model_pipeline is None or df_raw.empty:
        return jsonify({"error": "Model/data missing"}), 500

    try:
        data = request.json

        distance = data.get("distance")
        time_of_day = data.get("time_of_day")

        # Proper validation (fix)
        if distance is None or time_of_day is None:
            return jsonify({"error": "Missing distance/time_of_day"}), 400

        distance = float(distance)

        time_filter = df_raw['time_of_day'].str.lower() == time_of_day.lower()
        prediction_options = df_raw[time_filter][['platform', 'vehicle_type']].drop_duplicates()

        if prediction_options.empty:
            return jsonify({"error": "No rides found"}), 404

        X_predict = prediction_options.assign(
            time_of_day=time_of_day,
            distance_km=distance
        )

        predictions = model_pipeline.predict(X_predict)

        results = []
        for i, row in X_predict.iterrows():
            results.append({
                "platform": row["platform"],
                "vehicle_type": row["vehicle_type"],
                "estimated_fare": round(float(predictions[i]), 2),
                "distance_km": distance,
                "time_of_day": time_of_day
            })

        cheapest = min(results, key=lambda x: x["estimated_fare"])

        return jsonify({
            "status": "success",
            "results": results,
            "cheapest": cheapest
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Required for Render
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
