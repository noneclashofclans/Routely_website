import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS 
import os 

app = Flask(__name__)
# Enable CORS for communication with your client
CORS(app) 

# Define the columns strictly needed from the raw data for prediction generation
# We only need the identifiers (platform, vehicle_type, time_of_day)
RAW_DATA_COLS = ['platform', 'vehicle_type', 'time_of_day']

# 1. Model and Data Loading
try:
    # Ensure the script can find the file, useful if running from the parent dir
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'fare_model_pipeline.pkl')
    data_path = os.path.join(base_dir, 'fare_data.csv')

    # Load the trained pipeline
    model_pipeline = joblib.load(model_path)
    
    # Load the raw data, selecting only the necessary columns
    df_raw = pd.read_csv(data_path, usecols=RAW_DATA_COLS) 
    
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model or data: {e}")
    model_pipeline = None
    df_raw = pd.DataFrame()

@app.route('/predict_fares', methods=['POST'])
def predict_fares():
    """Accepts distance and time_of_day and returns predicted fares for all options."""
    if model_pipeline is None or df_raw.empty:
        return jsonify({"error": "Model not loaded or data missing. Check model_pipeline.pkl and fare_data.csv."}), 500

    try:
        data = request.get_json()
        distance = float(data.get('distance'))
        time_of_day = data.get('time_of_day')

        if not distance or not time_of_day:
            return jsonify({"error": "Missing 'distance' or 'time_of_day' in request."}), 400

        # Filter the raw data to get all unique platform/vehicle combinations for the specified time
        # We use .str.lower() for case-insensitive matching
        time_filter = df_raw['time_of_day'].str.lower() == time_of_day.lower()
        
        # Get the unique combinations for prediction
        prediction_options = df_raw[time_filter][['platform', 'vehicle_type']].drop_duplicates().reset_index(drop=True)

        if prediction_options.empty:
             return jsonify({"error": f"No ride options found for time_of_day: {time_of_day}"}), 404

        # 2. Prepare Data for Prediction
        # Add the constant distance and time_of_day columns for the model input
        X_predict = prediction_options.assign(
            time_of_day=time_of_day,
            distance_km=distance
        )
        
        # 3. Predict the fare using the ML model
        predictions = model_pipeline.predict(X_predict)
        
        # 4. Format the output
        results = []
        for index, row in X_predict.iterrows():
            fare = float(predictions[index])
            results.append({
                'platform': row['platform'],
                'vehicle_type': row['vehicle_type'],
                'estimated_fare': round(fare, 2),
                'distance_km': distance,
                'time_of_day': time_of_day
            })
            
        # 5. Determine the cheapest option
        cheapest_option = min(results, key=lambda x: x['estimated_fare'])
        
        return jsonify({
            "status": "success",
            "results": results,
            "cheapest": cheapest_option
        })

    except Exception as e:
        # A broader error handler to catch issues like value conversion failure
        return jsonify({"error": f"An internal error occurred during prediction: {str(e)}"}), 500

if __name__ == '__main__':
    # Flask will start on port 5000 in debug mode
    app.run(debug=True, port=5000)