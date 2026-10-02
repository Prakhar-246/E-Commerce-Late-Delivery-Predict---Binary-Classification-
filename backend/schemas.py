"""
DeliveryAI Pydantic Schemas & Feature Contracts
Author: Prakhar Sharma
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

VALID_CITIES = [
    'ahmedabad', 'bengaluru', 'chennai', 'delhi', 'hyderabad',
    'indore', 'jaipur', 'kolkata', 'mumbai', 'pune'
]

VALID_CATEGORIES = [
    'beauty', 'books', 'clothing', 'electronics',
    'furniture', 'grocery', 'home appliances', 'sports'
]

VALID_CUSTOMER_TYPES = ['new', 'premium', 'regular']

VALID_VEHICLES = ['bike', 'ev', 'truck', 'van']

VALID_WAREHOUSE_TYPES = ['distribution center', 'fulfillment center', 'sorting hub']

class DeliveryPredictionRequest(BaseModel):
    # Order & Route (7 features)
    source_city: str = Field(..., description="Source origin city")
    destination_city: str = Field(..., description="Destination delivery city")
    product_category: str = Field(..., description="Product category")
    product_weight_kg: float = Field(..., gt=0, le=100, description="Product weight in kg")
    order_value: float = Field(..., gt=0, le=100000, description="Order monetary value")
    distance_km: float = Field(..., gt=0, le=5000, description="Delivery distance in km")
    promised_delivery_hours: float = Field(..., gt=0, le=240, description="Promised transit hours")

    # Customer (1 feature)
    customer_type: str = Field(..., description="Customer classification: new, regular, premium")

    # Delivery Partner (5 features)
    partner_experience_years: float = Field(..., ge=0, le=50, description="Years of driver experience")
    rating: float = Field(..., ge=1.0, le=5.0, description="Partner rating between 1.0 and 5.0")
    completed_deliveries: int = Field(..., ge=0, description="Total completed deliveries")
    vehicle_type: str = Field(..., description="Vehicle type: bike, ev, truck, van")
    partner_city: str = Field(..., description="Partner base city")

    # Warehouse (4 features)
    warehouse_type: str = Field(..., description="Warehouse type")
    capacity_units: int = Field(..., gt=0, description="Warehouse capacity units")
    staff_count: int = Field(..., gt=0, description="Warehouse staff count")
    operating_hours: int = Field(..., ge=1, le=24, description="Operating hours per day (1-24)")

    # Time (4 features)
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    month: int = Field(..., ge=1, le=12, description="Month 1-12")
    is_weekend: int = Field(..., ge=0, le=1, description="0=Weekday, 1=Weekend")
    order_hour: int = Field(..., ge=0, le=23, description="Order placement hour (0-23)")

    @field_validator('source_city', 'destination_city', 'partner_city', mode='before')
    @classmethod
    def normalize_city(cls, v: str) -> str:
        if isinstance(v, str):
            v_norm = v.strip().lower()
            if v_norm not in VALID_CITIES:
                raise ValueError(f"City '{v}' must be one of: {', '.join(VALID_CITIES)}")
            return v_norm
        return v

    @field_validator('product_category', mode='before')
    @classmethod
    def normalize_category(cls, v: str) -> str:
        if isinstance(v, str):
            v_norm = v.strip().lower()
            if v_norm not in VALID_CATEGORIES:
                raise ValueError(f"Category '{v}' must be one of: {', '.join(VALID_CATEGORIES)}")
            return v_norm
        return v

    @field_validator('customer_type', mode='before')
    @classmethod
    def normalize_customer(cls, v: str) -> str:
        if isinstance(v, str):
            v_norm = v.strip().lower()
            if v_norm not in VALID_CUSTOMER_TYPES:
                raise ValueError(f"Customer type '{v}' must be one of: {', '.join(VALID_CUSTOMER_TYPES)}")
            return v_norm
        return v

    @field_validator('vehicle_type', mode='before')
    @classmethod
    def normalize_vehicle(cls, v: str) -> str:
        if isinstance(v, str):
            v_norm = v.strip().lower()
            if v_norm not in VALID_VEHICLES:
                raise ValueError(f"Vehicle type '{v}' must be one of: {', '.join(VALID_VEHICLES)}")
            return v_norm
        return v

    @field_validator('warehouse_type', mode='before')
    @classmethod
    def normalize_warehouse(cls, v: str) -> str:
        if isinstance(v, str):
            v_norm = v.strip().lower()
            if v_norm not in VALID_WAREHOUSE_TYPES:
                raise ValueError(f"Warehouse type '{v}' must be one of: {', '.join(VALID_WAREHOUSE_TYPES)}")
            return v_norm
        return v

class DeliveryPredictionResponse(BaseModel):
    prediction_id: str
    prediction: int = Field(..., description="0 for On-Time, 1 for Late")
    label: str = Field(..., description="'On-Time Delivery' or 'Late Delivery'")
    risk_score: float = Field(..., description="Model estimated risk probability [0.0, 1.0]")
    threshold: float = Field(..., description="Decision threshold (0.20)")
    risk_band: str = Field(..., description="'Low Risk', 'Moderate Risk', or 'High Risk'")
    explanation: str = Field(..., description="Model interpretation explanation")
    factors: List[dict] = Field(default_factory=list, description="Top factor signals")
    created_at: str

class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    status: str
    model_loaded: bool
    model_type: Optional[str] = None
    threshold: Optional[float] = None
    feature_count: Optional[int] = None
    developer: Optional[str] = "Prakhar Sharma"

class PredictionRecord(BaseModel):
    id: str
    timestamp: str
    source_city: str
    destination_city: str
    product_category: str
    order_value: float
    distance_km: float
    promised_delivery_hours: float
    risk_score: float
    prediction: int
    label: str
    risk_band: str
    vehicle_type: str
    partner_rating: float
    status: str
