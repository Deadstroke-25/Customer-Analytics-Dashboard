FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies from backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project so backend imports and data/ CSV are both available
COPY backend/ ./backend/
COPY data/ ./data/

# Set PYTHONPATH so "from backend.xxx import" works correctly
ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
