"""
DeliveryAI Model Inference Service
Author: Prakhar Sharma
"""
import os
import joblib
import pandas as pd
import numpy as np
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple, Optional, List
from .schemas import DeliveryPredictionRequest, DeliveryPredictionResponse
from .database import save_prediction

FEATURE_ORDER = [
    'source_city', 'destination_city', 'product_category', 'product_weight_kg',
    'order_value', 'distance_km', 'promised_delivery_hours', 'customer_type',
    'partner_experience_years', 'vehicle_type', 'rating', 'completed_deliveries',
    'partner_city', 'warehouse_type', 'capacity_units', 'staff_count',
    'operating_hours', 'day_of_week', 'month', 'is_weekend', 'order_hour'
]

class ModelService:
    _instance = None

    def __init__(self):
        self.model = None
        self.threshold = 0.20
        self.model_path = None
        self.threshold_path = None
        self.load_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _find_file(self, possible_paths: List[str]) -> Optional[str]:
        for path in possible_paths:
            if os.path.exists(path):
                return path
        return None

    def load_model(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, ".."))

        # Look in Model/ and models/
        model_candidates = [
            os.path.join(project_root, "Model", "delivery_gb_model.pkl"),
            os.path.join(project_root, "models", "delivery_gb_model.pkl"),
            os.path.join(current_dir, "models", "delivery_gb_model.pkl"),
        ]
        threshold_candidates = [
            os.path.join(project_root, "Model", "delivery_threshold.pkl"),
            os.path.join(project_root, "models", "delivery_threshold.pkl"),
            os.path.join(current_dir, "models", "delivery_threshold.pkl"),
        ]

        self.model_path = self._find_file(model_candidates)
        self.threshold_path = self._find_file(threshold_candidates)

        if not self.model_path:
            raise FileNotFoundError(
                f"Model file not found! Checked locations: {model_candidates}. "
                "Ensure 'delivery_gb_model.pkl' is placed in the models/ or Model/ directory."
            )

        if not self.threshold_path:
            # Fallback to default 0.20 if file missing, but try to load if found
            print(f"Warning: delivery_threshold.pkl not found in {threshold_candidates}. Using default 0.20.")
            self.threshold = 0.20
        else:
            loaded_th = joblib.load(self.threshold_path)
            self.threshold = float(loaded_th)

        print(f"Loading ML pipeline from: {self.model_path}")
        self.model = joblib.load(self.model_path)
        print(f"Model successfully loaded. Decision threshold: {self.threshold}")

    def predict(self, req: DeliveryPredictionRequest) -> DeliveryPredictionResponse:
        if self.model is None:
            raise RuntimeError("Model is not loaded. Cannot process prediction.")

        data_dict = req.model_dump()
        df = pd.DataFrame([data_dict])[FEATURE_ORDER]

        # Ensure correct datatypes
        df['day_of_week'] = df['day_of_week'].astype(int)
        df['month'] = df['month'].astype(int)
        df['is_weekend'] = df['is_weekend'].astype(int)
        df['order_hour'] = df['order_hour'].astype(int)
        df['completed_deliveries'] = df['completed_deliveries'].astype(int)
        df['capacity_units'] = df['capacity_units'].astype(int)
        df['staff_count'] = df['staff_count'].astype(int)
        df['operating_hours'] = df['operating_hours'].astype(int)
        df['product_weight_kg'] = df['product_weight_kg'].astype(float)
        df['order_value'] = df['order_value'].astype(float)
        df['distance_km'] = df['distance_km'].astype(float)
        df['promised_delivery_hours'] = df['promised_delivery_hours'].astype(float)
        df['partner_experience_years'] = df['partner_experience_years'].astype(float)
        df['rating'] = df['rating'].astype(float)

        # Run inference
        raw_proba = self.model.predict_proba(df)[0, 1]
        risk_score = round(float(raw_proba), 4)

        prediction = 1 if risk_score >= self.threshold else 0
        label = "Late Delivery" if prediction == 1 else "On-Time Delivery"

        # Explicit risk band definitions
        if risk_score < 0.20:
            risk_band = "Low Risk"
        elif risk_score < 0.40:
            risk_band = "Moderate Risk"
        else:
            risk_band = "High Risk"

        # Generate contextual model signals
        required_speed = df['distance_km'].iloc[0] / max(df['promised_delivery_hours'].iloc[0], 0.1)
        factors = [
            {
                "name": "Route Distance & Timeline",
                "importance": "High",
                "detail": f"{df['distance_km'].iloc[0]:.0f} km over {df['promised_delivery_hours'].iloc[0]:.0f}h transit window ({required_speed:.1f} km/h avg pace)"
            },
            {
                "name": "Partner Profile",
                "importance": "Medium",
                "detail": f"{df['partner_experience_years'].iloc[0]:.1f} yrs experience, {df['rating'].iloc[0]:.1f} rating ({df['vehicle_type'].iloc[0]})"
            },
            {
                "name": "Warehouse Logistics",
                "importance": "Medium",
                "detail": f"{df['warehouse_type'].iloc[0].title()} ({df['staff_count'].iloc[0]} staff, {df['operating_hours'].iloc[0]}h operation)"
            },
            {
                "name": "Order Profile",
                "importance": "Standard",
                "detail": f"{df['product_category'].iloc[0].title()} ({df['product_weight_kg'].iloc[0]:.1f} kg, Rs. {df['order_value'].iloc[0]:,.0f})"
            }
        ]

        if prediction == 1:
            explanation = (
                f"The model estimates a {risk_score * 100:.1f}% risk score, which exceeds the {self.threshold * 100:.0f}% operating threshold. "
                f"This indicates an elevated risk of delivery delay under the specified route distance, transit window, and logistics configuration."
            )
        else:
            explanation = (
                f"The model estimates a {risk_score * 100:.1f}% risk score, below the {self.threshold * 100:.0f}% operating threshold. "
                "The delivery parameters indicate high likelihood of on-time fulfillment under current operational conditions."
            )

        pred_id = f"PRD-{uuid.uuid4().hex[:6].upper()}"
        created_at = datetime.utcnow().isoformat() + "Z"

        # Persist to database
        db_record = {
            "id": pred_id,
            "created_at": created_at,
            "source_city": req.source_city,
            "destination_city": req.destination_city,
            "product_category": req.product_category,
            "product_weight_kg": req.product_weight_kg,
            "order_value": req.order_value,
            "distance_km": req.distance_km,
            "promised_delivery_hours": req.promised_delivery_hours,
            "customer_type": req.customer_type,
            "partner_experience_years": req.partner_experience_years,
            "rating": req.rating,
            "completed_deliveries": req.completed_deliveries,
            "vehicle_type": req.vehicle_type,
            "partner_city": req.partner_city,
            "warehouse_type": req.warehouse_type,
            "capacity_units": req.capacity_units,
            "staff_count": req.staff_count,
            "operating_hours": req.operating_hours,
            "day_of_week": req.day_of_week,
            "month": req.month,
            "is_weekend": req.is_weekend,
            "order_hour": req.order_hour,
            "risk_score": risk_score,
            "prediction": prediction,
            "label": label,
            "risk_band": risk_band,
            "status": "Completed"
        }
        save_prediction(db_record)

        return DeliveryPredictionResponse(
            prediction_id=pred_id,
            prediction=prediction,
            label=label,
            risk_score=risk_score,
            threshold=self.threshold,
            risk_band=risk_band,
            explanation=explanation,
            factors=factors,
            created_at=created_at
        )

model_service = ModelService.get_instance()
