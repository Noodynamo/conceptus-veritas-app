FROM node:20-alpine as frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

# Backend Python setup
FROM python:3.12-slim as backend-build

WORKDIR /app/backend

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

# Final image
FROM python:3.12-slim

WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# Copy frontend build
COPY --from=frontend-build /app/frontend/web-build /app/frontend/web-build

# Copy shared directory
COPY shared/ /app/shared/

# Set environment variables
ENV PYTHONPATH=/app/backend:$PYTHONPATH
ENV NODE_ENV=production

# Expose ports
EXPOSE 3000 8000

# Start services
CMD ["sh", "-c", "cd /app/backend && uvicorn src.main:app --host 0.0.0.0 --port 8000 & cd /app/frontend && npm start"] 