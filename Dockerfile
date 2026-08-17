FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY python-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY python-backend/app.py .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run application
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000", "--workers", "4"]
