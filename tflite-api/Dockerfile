# Use a lightweight Python base image
FROM python:3.8-slim

# Set a non-root user for security
RUN useradd -m appuser
USER appuser

# Set working directory
WORKDIR /var/task/

# Ensure pip installs packages in a globally accessible location
ENV PATH="/home/appuser/.local/bin:$PATH"

# Install dependencies
RUN pip install --no-cache-dir --user numpy pillow tflite-runtime==2.14.0 flask gunicorn flask-cors

# Copy application files
COPY app.py last.tflite ./

# Expose Flask port
EXPOSE 5000

ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "app:app", "--log-level=debug", "--access-logfile=-"]


