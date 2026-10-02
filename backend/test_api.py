import sys
import os
import tempfile
import uuid

# Isolate test database before importing application modules
TEST_DB_PATH = os.path.join(tempfile.gettempdir(), f"delivery_test_{uuid.uuid4().hex}.db")
os.environ["DELIVERY_DB_PATH"] = TEST_DB_PATH

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.model_service import model_service

client = TestClient(app)

def run_tests():
    try:
        print(f"Using isolated temporary test database: {TEST_DB_PATH}")

        print("\n=== 1. Testing /health ===")
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health_data = res.json()
        assert health_data["status"] == "ok"
        assert health_data["model_loaded"] is True
        assert health_data["threshold"] == model_service.threshold
        assert health_data["threshold"] == 0.20
        print("Health check PASSED:", health_data)

        print("\n=== 2. Testing /model-info ===")
        res = client.get("/model-info")
        assert res.status_code == 200
        info = res.json()
        assert info["model_name"] == "HistGradientBoostingClassifier"
        assert info["evaluation_metrics"]["recall"] == 0.8664
        assert len(info["categorical_features"]) == 9
        assert len(info["numerical_features"]) == 12
        assert info["operating_threshold"] == 0.20
        print("Model info PASSED. Metric recall:", info["evaluation_metrics"]["recall"])

        print("\n=== 3. Testing prediction decision rule and contract ===")
        sample_payload = {
            "source_city": "Mumbai",
            "destination_city": "Delhi",
            "product_category": "Electronics",
            "product_weight_kg": 3.5,
            "order_value": 4500.0,
            "distance_km": 1400.0,
            "promised_delivery_hours": 36.0,
            "customer_type": "Regular",
            "partner_experience_years": 4.0,
            "rating": 4.6,
            "completed_deliveries": 320,
            "vehicle_type": "truck",
            "partner_city": "Mumbai",
            "warehouse_type": "fulfillment center",
            "capacity_units": 45000,
            "staff_count": 80,
            "operating_hours": 24,
            "day_of_week": 3,
            "month": 7,
            "is_weekend": 0,
            "order_hour": 14
        }
        res = client.post("/predict", json=sample_payload)
        assert res.status_code == 200, f"Predict failed: {res.text}"
        pred_data = res.json()

        # Contract verification
        assert "risk_score" in pred_data, "Missing risk_score"
        assert "threshold" in pred_data, "Missing threshold"
        assert "prediction" in pred_data, "Missing prediction"
        assert "label" in pred_data, "Missing label"
        assert "risk_band" in pred_data, "Missing risk_band"
        assert "prediction_id" in pred_data, "Missing prediction_id"
        assert "created_at" in pred_data, "Missing created_at"

        score = pred_data["risk_score"]
        th = pred_data["threshold"]
        pred = pred_data["prediction"]
        label = pred_data["label"]
        band = pred_data["risk_band"]
        pid = pred_data["prediction_id"]

        # 1. Verify risk_score is between 0 and 1
        assert 0.0 <= score <= 1.0, f"Invalid risk_score: {score}"

        # 2. Verify threshold equals saved threshold
        assert th == model_service.threshold == 0.20, f"Threshold mismatch: {th}"

        # 3. Verify core prediction decision rule
        if score >= th:
            assert pred == 1, f"Expected prediction 1 since score {score} >= {th}, got {pred}"
            assert label == "Late Delivery", f"Expected 'Late Delivery', got {label}"
        else:
            assert pred == 0, f"Expected prediction 0 since score {score} < {th}, got {pred}"
            assert label == "On-Time Delivery", f"Expected 'On-Time Delivery', got {label}"

        # 4. Verify risk band matches documented application rule
        if score < 0.20:
            assert band == "Low Risk", f"Expected 'Low Risk' for score {score}, got {band}"
        elif score < 0.40:
            assert band == "Moderate Risk", f"Expected 'Moderate Risk' for score {score}, got {band}"
        else:
            assert band == "High Risk", f"Expected 'High Risk' for score {score}, got {band}"

        # 5. Verify ID format and timestamp
        assert pid.startswith("PRD-"), f"Unexpected prediction_id format: {pid}"
        assert "T" in pred_data["created_at"], f"Invalid timestamp format: {pred_data['created_at']}"

        print(f"Prediction Rule Test PASSED: score={score:.4f}, th={th}, pred={pred} ({label}), band={band}, id={pid}")

        print("\n=== 4. Testing input validation rejection ===")
        bad_payload = sample_payload.copy()
        bad_payload["rating"] = 8.5  # Invalid: rating must be <= 5.0
        bad_payload["source_city"] = "ImaginaryCity"  # Invalid city
        res = client.post("/predict", json=bad_payload)
        assert res.status_code == 422, f"Expected 422, got {res.status_code}"
        error_data = res.json()
        assert "errors" in error_data
        assert len(error_data["errors"]) >= 2
        print("Input validation rejection PASSED with details:", error_data["errors"])

        print("\n=== 5. Testing history persistence in isolated test DB ===")
        res = client.get("/history")
        assert res.status_code == 200
        hist = res.json()
        assert hist["total"] == 1
        assert hist["items"][0]["id"] == pid
        print(f"History verification PASSED: 1 record recorded with ID {pid}")

        print("\n=== 6. Testing analytics aggregation ===")
        res = client.get("/analytics")
        assert res.status_code == 200
        analytics = res.json()
        assert analytics["has_data"] is True
        assert analytics["total_predictions"] == 1
        print("Analytics verification PASSED:", analytics)

        print("\n=== 7. Testing history cleanup ===")
        del_res = client.delete("/history")
        assert del_res.status_code == 200
        assert del_res.json()["deleted_count"] == 1

        empty_res = client.get("/analytics")
        empty_analytics = empty_res.json()
        assert empty_analytics["has_data"] is False
        assert empty_analytics["total_predictions"] == 0
        print("Empty state verification PASSED.")

        print("\nALL TEST SUITE CHECKS COMPLETED SUCCESSFULLY!")

    finally:
        # Clean up temporary test database
        import gc
        gc.collect()
        if os.path.exists(TEST_DB_PATH):
            try:
                os.remove(TEST_DB_PATH)
                print(f"Cleaned up temporary test database: {TEST_DB_PATH}")
            except Exception as e:
                print(f"Could not remove temporary test DB: {e}")

if __name__ == "__main__":
    run_tests()
