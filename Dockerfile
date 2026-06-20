FROM python:3.11-slim

WORKDIR /app

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Copy requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application code
COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
