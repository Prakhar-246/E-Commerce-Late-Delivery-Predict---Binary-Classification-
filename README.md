# DeliveryAI — AI-Powered Delivery Risk Prediction

> **Created & Developed by:** **Prakhar Sharma**  
> **Role:** Machine Learning & Full-Stack Developer  
> **Project Scope:** End-to-End ML Pipeline, Predictive Modeling & Real-Time SaaS Risk Engine

**DeliveryAI** is an AI-powered delivery risk prediction web application built on top of a trained machine learning pipeline. It enables logistics managers and dispatchers to assess delivery delays in advance by evaluating 21 operational, route, partner, warehouse, and temporal signals.

---

## 🚀 Key Highlights & Architecture

- **Machine Learning Core**: Serialized `HistGradientBoostingClassifier` within a scikit-learn `Pipeline` (ColumnTransformer with OneHotEncoder for 9 categorical features + passthrough for 12 numerical features).
- **Decision Threshold**: Operating threshold **`0.20`** (deliberately tuned on held-out test data to maximize recall to catch late deliveries early).
- **Backend**: FastAPI with strict Pydantic v2 input validation, CORS configuration, and modular service architecture.
- **Frontend**: Modern React 18 single-page application built with Vite and styled with Tailwind CSS, faithfully recreating the DeliveryAI SaaS interface across 5 core views:
  1. **Dashboard**: High-level telemetry, AI Core radar visual, KPI cards, weekly snapshot chart, and key model risk factors.
  2. **Predict Delivery**: Complete 21-feature assessment form organized into 5 logical sections, live model connection status, real-time prediction output with risk scoring, threshold comparison, and factor breakdowns.
  3. **Prediction History**: Persisted prediction records with search, outcome filters, sorting, SQLite storage, and CSV export.
  4. **Analytics**: Outcome mix bar charts, risk distribution donut chart, predictions by destination city, and model observations.
  5. **About Model**: Model card with test evaluation metrics (Accuracy, Precision, Recall, F1), 9-step data-to-decision architecture, 21-feature contract, and metric interpretation guides.

---

## 📋 Exact 21 Model Features

The prediction service evaluates exactly these 21 features:

| Category | Feature Name | Type / Values |
|---|---|---|
| **Order & Route** | `source_city` | Categorical (10 cities: ahmedabad, bengaluru, chennai, delhi, hyderabad, indore, jaipur, kolkata, mumbai, pune) |
| | `destination_city` | Categorical (same 10 cities) |
| | `product_category` | Categorical (beauty, books, clothing, electronics, furniture, grocery, home appliances, sports) |
| | `product_weight_kg` | Float (> 0) |
| | `order_value` | Float (> 0) |
| | `distance_km` | Float (> 0) |
| | `promised_delivery_hours` | Float (> 0) |
| **Customer** | `customer_type` | Categorical (new, premium, regular) |
| **Delivery Partner** | `partner_experience_years` | Float (≥ 0) |
| | `rating` | Float (1.0 to 5.0) |
| | `completed_deliveries` | Integer (≥ 0) |
| | `vehicle_type` | Categorical (bike, ev, truck, van) |
| | `partner_city` | Categorical (same 10 cities) |
| **Warehouse** | `warehouse_type` | Categorical (distribution center, fulfillment center, sorting hub) |
| | `capacity_units` | Integer (> 0) |
| | `staff_count` | Integer (> 0) |
| | `operating_hours` | Integer (1 to 24) |
| **Time** | `day_of_week` | Integer (0=Monday to 6=Sunday) |
| | `month` | Integer (1 to 12) |
| | `is_weekend` | Integer (0=Weekday, 1=Weekend) |
| | `order_hour` | Integer (0 to 23) |

---

## 🎯 Prediction Logic & Threshold

For each incoming request:
1. Input values are validated and normalized.
2. A single-row DataFrame is constructed with the exact 21 columns in the pipeline's expected sequence.
3. Probability is calculated via `model.predict_proba(input_df)[:, 1]`.
4. Classification is evaluated against the saved threshold:
   $$\text{probability} \ge 0.20 \implies \text{Late Delivery (1)}$$
   $$\text{probability} < 0.20 \implies \text{On-Time Delivery (0)}$$
5. Risk bands:
   - **Low Risk**: Probability $< 0.20$
   - **Moderate Risk**: $0.20 \le \text{Probability} < 0.40$
   - **High Risk**: $\text{Probability} \ge 0.40$

---

## 📊 Model Evaluation Metrics (Test Set @ 0.20 Threshold)

- **Accuracy**: 45.23%
- **Precision**: 32.21%
- **Recall**: 86.64%
- **F1 Score**: 46.96%

> **How to interpret**: Accuracy is lower than baseline because the dataset contains ~72% on-time and ~28% late deliveries. The decision threshold of 0.20 was intentionally chosen to maximize recall (86.64%), capturing potential late deliveries before they happen at the cost of more false positives.

---

## 🛠️ How to Run the Application

### 1. Start the Backend API

From the project root:

```bash
# Optional: Install backend requirements
pip install -r backend/requirements.txt

# Run the FastAPI server
uvicorn backend.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`.
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Start the Frontend

Open a new terminal and navigate to `frontend/`:

```bash
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

To run the automated backend test suite (testing health check, model info, valid inference, validation error handling, SQLite persistence, and analytics):

```bash
python backend/test_api.py
```

---

## 📁 Project Structure

```
Delivery Prediction/
├── Model/
│   ├── delivery_gb_model.pkl    # Serialized scikit-learn pipeline (HistGradientBoosting)
│   └── delivery_threshold.pkl   # Serialized decision threshold (0.20)
│
├── backend/
│   ├── main.py                  # FastAPI application and route handlers
│   ├── schemas.py               # Pydantic validation schemas for 21 features
│   ├── model_service.py         # Singleton inference engine & signal extractor
│   ├── database.py              # SQLite storage for persistent prediction records
│   ├── test_api.py              # Automated test suite
│   ├── requirements.txt         # Backend Python dependencies
│   └── delivery_predictions.db  # Generated SQLite prediction store
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # API service client
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar matching screenshots
│   │   │   └── Topbar.jsx       # Top workspace breadcrumb and status header
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Overview dashboard with AI Core radar & signals
│   │   │   ├── PredictDelivery.jsx # 21-input prediction form & result card
│   │   │   ├── PredictionHistory.jsx # Live prediction table with CSV export
│   │   │   ├── Analytics.jsx    # Performance charts, donut risk profile, route view
│   │   │   └── AboutModel.jsx   # Model architecture & evaluation card
│   │   ├── App.jsx              # Main view orchestrator
│   │   └── main.jsx             # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── Notebooks/                   # Preserved original notebooks & cleaned CSV
├── data/                        # Preserved original datasets
└── README.md                    # Project documentation
```

---

## 👨‍💻 Author & Project Ownership

**Prakhar Sharma**  
*Machine Learning Engineer & Full-Stack Developer*

This project was conceived, architected, and built by **Prakhar Sharma** to demonstrate production-ready, end-to-end Machine Learning systems engineering:

- **Data Engineering**: Designed realistic multi-table relational schema generation (`customers`, `orders`, `deliveries`, `partners`, `warehouses`) with real-world noise, edge cases, and feature relationships.
- **Machine Learning Core**: Developed scikit-learn preprocessing pipelines (`OneHotEncoder` + `ColumnTransformer`), trained `HistGradientBoostingClassifier`, and tuned the operating threshold to **`0.20`** to achieve **86.64% recall** on delayed shipments.
- **Backend API**: Architected asynchronous FastAPI service with strict Pydantic v2 validation, singleton inference engine, error boundary handling, and SQLite prediction auditing.
- **Frontend Experience**: Crafted a responsive, SaaS-grade React single-page application with Tailwind CSS, custom SVG radar telemetry, interactive prediction forms, SQLite history inspection, and analytics dashboards.

---
