# ./college-event-backend/Dockerfile

# Use Python base image
FROM python:3.9-slim

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install supervisor
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Copy supervisor configuration
COPY supervisor.conf /etc/supervisor/conf.d/supervisor.conf

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose ports
EXPOSE 5081 5080

# Start supervisor
CMD ["/usr/bin/supervisord"]
