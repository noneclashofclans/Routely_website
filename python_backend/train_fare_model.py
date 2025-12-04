import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

# 1. Load Data
df_raw = pd.read_csv('fare_data.csv')

# 2. Function to Calculate Fare (Deterministic Logic)
def calculate_fare(row, distance):
    """Formula: Surge * MAX(Min_Fare, Base_Fare + (Distance - 1) * Per_km_Rate)"""
    base_calc = row['base_fare'] + (distance - 1) * row['per_km_rate']
    final_fare = row['surge_multiplier'] * max(row['minimum_fare'], base_calc)
    # Ensure minimum fare is always met after surge
    return max(final_fare, row['minimum_fare'] * row['surge_multiplier'])

training_samples = []
for index, row in df_raw.iterrows():
    for distance in np.arange(1.0, 20.1, 0.5): # Distances from 1.0 to 20.0 km
        fare = calculate_fare(row, distance)
        training_samples.append({
            'platform': row['platform'],
            'vehicle_type': row['vehicle_type'],
            'time_of_day': row['time_of_day'],
            'distance_km': distance,
            'fare': fare
        })

df_train = pd.DataFrame(training_samples)

# 4. Define Preprocessing and Model
# Identify categorical and numerical features
categorical_features = ['platform', 'vehicle_type', 'time_of_day']
numerical_features = ['distance_km']

# Create the Column Transformer (for one-hot encoding)
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough' # Keep 'distance_km' as-is
)

# Create the full pipeline
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
])

# Define features (X) and target (y)
X = df_train[['platform', 'vehicle_type', 'time_of_day', 'distance_km']]
y = df_train['fare']

# 5. Train the Model
print("Starting model training...")
model_pipeline.fit(X, y)
print("Training complete.")

# 6. Save the Model and Column Transformer
joblib.dump(model_pipeline, 'fare_model_pipeline.pkl')
print("Model pipeline saved as fare_model_pipeline.pkl")