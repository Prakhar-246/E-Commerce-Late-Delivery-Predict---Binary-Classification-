# Multi-stage Docker build for DeliveryAI Prediction Full-Stack Application

# --- Stage 1: Build React Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Python Production Container ---
FROM python:3.11-slim
WORKDIR /app

# Avoid python bytecode & ensure unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy source code, trained model, and static data
COPY backend/ ./backend/
COPY Model/ ./Model/
COPY data/ ./data/

# Copy compiled frontend from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port for Hugging Face Spaces (7860) or standard web hosts
EXPOSE 7860

# Run FastAPI with dynamic port binding for Render ($PORT) or Hugging Face (7860)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
