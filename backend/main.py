import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from typing import Optional

from .schemas import (
    DeliveryPredictionRequest,
    DeliveryPredictionResponse,
    HealthResponse,
    VALID_CITIES,
    VALID_CATEGORIES,
    VALID_CUSTOMER_TYPES,
    VALID_VEHICLES,
    VALID_WAREHOUSE_TYPES
)
from .database import init_db, get_predictions, get_analytics, clear_predictions
from .model_service import model_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database
    init_db()
    print("Backend ready: SQLite initialized and Model loaded.")
    yield

app = FastAPI(
    title="DeliveryAI Prediction API",
    description="AI-Powered Delivery Risk Prediction backend utilizing HistGradientBoostingClassifier",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        errors.append({
            "field": field,
            "message": err["msg"],
            "type": err["type"]
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Input validation error. Please verify the specified fields.",
            "errors": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal error occurred while processing the request.",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }
    )

@app.get("/health", response_model=HealthResponse)
def health_check():
    is_loaded = model_service.model is not None
    return HealthResponse(
        status="ok" if is_loaded else "model_unavailable",
        model_loaded=is_loaded,
        model_type="HistGradientBoostingClassifier" if is_loaded else None,
        threshold=model_service.threshold,
        feature_count=21
    )

@app.post("/predict", response_model=DeliveryPredictionResponse)
def predict_delivery(payload: DeliveryPredictionRequest):
    try:
        result = model_service.predict(payload)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/history")
def fetch_history(
    search: Optional[str] = Query(None, description="Search by ID, city, or category"),
    outcome: Optional[str] = Query("all", description="Filter: all, late, on-time"),
    sort: Optional[str] = Query("newest", description="Sort: newest, oldest, highest_risk, lowest_risk"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    return get_predictions(
        search=search,
        outcome=outcome,
        sort_by=sort,
        limit=limit,
        offset=offset
    )

@app.delete("/history")
def clear_history_records():
    count = clear_predictions()
    return {"message": f"Successfully deleted {count} prediction records.", "deleted_count": count}

@app.get("/analytics")
def fetch_analytics():
    return get_analytics()

@app.get("/model-info")
def fetch_model_info():
    return {
        "model_name": "HistGradientBoostingClassifier",
        "task": "Binary Classification",
        "target": "late_delivery",
        "labels": {
            "0": "On-time",
            "1": "Late"
        },
        "operating_threshold": model_service.threshold,
        "evaluation_metrics": {
            "accuracy": 0.4523,
            "precision": 0.3221,
            "recall": 0.8664,
            "f1_score": 0.4696
        },
        "evaluation_note": (
            "Metrics were obtained on the held-out test dataset with the selected threshold of 0.20. "
            "Accuracy is 45.23% because the 0.20 threshold was chosen to prioritize high recall (86.64%) "
            "to capture potential late deliveries early, intentionally accepting more false positives."
        ),
        "categorical_features": [
            "source_city", "destination_city", "product_category", "customer_type",
            "vehicle_type", "partner_city", "warehouse_type", "day_of_week", "month"
        ],
        "numerical_features": [
            "product_weight_kg", "order_value", "distance_km", "promised_delivery_hours",
            "partner_experience_years", "rating", "completed_deliveries", "capacity_units",
            "staff_count", "operating_hours", "is_weekend", "order_hour"
        ],
        "allowed_categories": {
            "cities": VALID_CITIES,
            "product_categories": VALID_CATEGORIES,
            "customer_types": VALID_CUSTOMER_TYPES,
            "vehicle_types": VALID_VEHICLES,
            "warehouse_types": VALID_WAREHOUSE_TYPES
        }
    }
