"""
DeliveryAI SQLite Prediction Store & Analytics
Author: Prakhar Sharma
"""
import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

def get_db_path() -> str:
    return os.environ.get("DELIVERY_DB_PATH", os.path.join(os.path.dirname(os.path.abspath(__file__)), "delivery_predictions.db"))

def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                source_city TEXT NOT NULL,
                destination_city TEXT NOT NULL,
                product_category TEXT NOT NULL,
                product_weight_kg REAL NOT NULL,
                order_value REAL NOT NULL,
                distance_km REAL NOT NULL,
                promised_delivery_hours REAL NOT NULL,
                customer_type TEXT NOT NULL,
                partner_experience_years REAL NOT NULL,
                rating REAL NOT NULL,
                completed_deliveries INTEGER NOT NULL,
                vehicle_type TEXT NOT NULL,
                partner_city TEXT NOT NULL,
                warehouse_type TEXT NOT NULL,
                capacity_units INTEGER NOT NULL,
                staff_count INTEGER NOT NULL,
                operating_hours INTEGER NOT NULL,
                day_of_week INTEGER NOT NULL,
                month INTEGER NOT NULL,
                is_weekend INTEGER NOT NULL,
                order_hour INTEGER NOT NULL,
                risk_score REAL NOT NULL,
                prediction INTEGER NOT NULL,
                label TEXT NOT NULL,
                risk_band TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Completed'
            )
        """)
        conn.commit()

# Ensure table exists upon module import
init_db()

def save_prediction(record: Dict[str, Any]) -> str:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO predictions (
                id, created_at, source_city, destination_city, product_category,
                product_weight_kg, order_value, distance_km, promised_delivery_hours,
                customer_type, partner_experience_years, rating, completed_deliveries,
                vehicle_type, partner_city, warehouse_type, capacity_units, staff_count,
                operating_hours, day_of_week, month, is_weekend, order_hour,
                risk_score, prediction, label, risk_band, status
            ) VALUES (
                :id, :created_at, :source_city, :destination_city, :product_category,
                :product_weight_kg, :order_value, :distance_km, :promised_delivery_hours,
                :customer_type, :partner_experience_years, :rating, :completed_deliveries,
                :vehicle_type, :partner_city, :warehouse_type, :capacity_units, :staff_count,
                :operating_hours, :day_of_week, :month, :is_weekend, :order_hour,
                :risk_score, :prediction, :label, :risk_band, :status
            )
        """, record)
        conn.commit()
    return record["id"]

def get_predictions(
    search: Optional[str] = None,
    outcome: Optional[str] = None,
    sort_by: str = "newest",
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        
        query = "SELECT * FROM predictions WHERE 1=1"
        params: List[Any] = []

        if search:
            query += " AND (id LIKE ? OR source_city LIKE ? OR destination_city LIKE ? OR product_category LIKE ?)"
            s_term = f"%{search.strip().lower()}%"
            params.extend([s_term, s_term, s_term, s_term])

        if outcome and outcome != "all":
            if outcome.lower() in ["late", "late delivery", "1"]:
                query += " AND prediction = 1"
            elif outcome.lower() in ["on-time", "on-time delivery", "ontime", "0"]:
                query += " AND prediction = 0"

        # Count total matches
        count_query = f"SELECT COUNT(*) FROM ({query})"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]

        # Sorting
        if sort_by == "oldest":
            query += " ORDER BY created_at ASC"
        elif sort_by == "highest_risk":
            query += " ORDER BY risk_score DESC"
        elif sort_by == "lowest_risk":
            query += " ORDER BY risk_score ASC"
        else: # newest
            query += " ORDER BY created_at DESC"

        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]

        return {
            "total": total_count,
            "items": rows,
            "limit": limit,
            "offset": offset
        }

def get_analytics() -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM predictions")
        total = cursor.fetchone()[0]

        if total == 0:
            return {
                "has_data": False,
                "total_predictions": 0,
                "on_time_count": 0,
                "late_risk_count": 0,
                "late_risk_rate": 0.0,
                "avg_risk_score": 0.0,
                "risk_distribution": {"low": 0, "moderate": 0, "high": 0},
                "daily_performance": [],
                "predictions_by_city": []
            }

        cursor.execute("SELECT COUNT(*) FROM predictions WHERE prediction = 1")
        late_count = cursor.fetchone()[0]
        ontime_count = total - late_count
        late_rate = round((late_count / total) * 100, 1)

        cursor.execute("SELECT AVG(risk_score) FROM predictions")
        avg_score = round(cursor.fetchone()[0] or 0.0, 4)

        # Risk bands
        cursor.execute("SELECT COUNT(*) FROM predictions WHERE risk_band = 'Low Risk'")
        low_risk = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM predictions WHERE risk_band = 'Moderate Risk'")
        mod_risk = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM predictions WHERE risk_band = 'High Risk'")
        high_risk = cursor.fetchone()[0]

        low_pct = round((low_risk / total) * 100, 1) if total > 0 else 0.0
        mod_pct = round((mod_risk / total) * 100, 1) if total > 0 else 0.0
        high_pct = round((high_risk / total) * 100, 1) if total > 0 else 0.0

        # By destination city
        cursor.execute("""
            SELECT destination_city, COUNT(*) as count 
            FROM predictions 
            GROUP BY destination_city 
            ORDER BY count DESC 
            LIMIT 5
        """)
        city_rows = [{"city": row["destination_city"].title(), "count": row["count"]} for row in cursor.fetchall()]

        # By day of week
        cursor.execute("""
            SELECT day_of_week, 
                   SUM(CASE WHEN prediction = 0 THEN 1 ELSE 0 END) as on_time,
                   SUM(CASE WHEN prediction = 1 THEN 1 ELSE 0 END) as late_risk
            FROM predictions
            GROUP BY day_of_week
            ORDER BY day_of_week ASC
        """)
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_dict = {row["day_of_week"]: {"day": day_names[row["day_of_week"]], "on_time": row["on_time"], "late_risk": row["late_risk"]} for row in cursor.fetchall()}
        daily_perf = [day_dict.get(d, {"day": day_names[d], "on_time": 0, "late_risk": 0}) for d in range(7)]

        return {
            "has_data": True,
            "total_predictions": total,
            "on_time_count": ontime_count,
            "late_risk_count": late_count,
            "late_risk_rate": late_rate,
            "avg_risk_score": avg_score,
            "risk_distribution": {
                "low": low_risk,
                "moderate": mod_risk,
                "high": high_risk,
                "low_pct": low_pct,
                "moderate_pct": mod_pct,
                "high_pct": high_pct
            },
            "daily_performance": daily_perf,
            "predictions_by_city": city_rows
        }

def clear_predictions() -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM predictions")
        conn.commit()
        return cursor.rowcount
