# Multi-stage Dockerfile for HR Management Application
# This builds frontend, backend, and includes PostgreSQL in a single container

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source code
COPY frontend/ .

# Build frontend for production
RUN pnpm run build

# Stage 2: Setup Backend and Final Image
FROM node:18-alpine AS production

# Install PostgreSQL and other required packages
RUN apk add --no-cache \
    postgresql \
    postgresql-contrib \
    nginx \
    supervisor \
    bash

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create necessary directories
RUN mkdir -p /app/backend /app/frontend/build /var/lib/postgresql/data /var/log/supervisor /run/postgresql /docker-entrypoint-initdb.d

# Set up PostgreSQL data directory ownership
RUN chown postgres:postgres /var/lib/postgresql/data /run/postgresql
RUN chmod 700 /var/lib/postgresql/data

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml* ./

# Install backend dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY backend/ .

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Copy database initialization script
COPY backend/database_backup_pg15_fixed_utf8.sql /docker-entrypoint-initdb.d/init.sql

# Create nginx configuration file
RUN echo 'events {\n    worker_connections 1024;\n}\n\nhttp {\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n\n    upstream backend {\n        server 127.0.0.1:5000;\n    }\n\n    server {\n        listen 80;\n        server_name _;\n\n        # Serve frontend static files\n        location / {\n            root /app/frontend/build;\n            try_files $uri $uri/ /index.html;\n        }\n\n        # Proxy API requests to backend\n        location /api/ {\n            proxy_pass http://backend/;\n            proxy_http_version 1.1;\n            proxy_set_header Upgrade $http_upgrade;\n            proxy_set_header Connection '"'"'upgrade'"'"';\n            proxy_set_header Host $host;\n            proxy_set_header X-Real-IP $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n            proxy_set_header X-Forwarded-Proto $scheme;\n            proxy_cache_bypass $http_upgrade;\n        }\n    }\n}' > /etc/nginx/nginx.conf

# Create supervisord configuration file
RUN echo '[supervisord]\nnodaemon=true\nuser=root\nlogfile=/var/log/supervisor/supervisord.log\npidfile=/var/run/supervisord.pid\n\n[program:postgresql]\ncommand=/usr/bin/postgres -D /var/lib/postgresql/data\nuser=postgres\nautostart=true\nautorestart=true\nstderr_logfile=/var/log/supervisor/postgresql.err.log\nstdout_logfile=/var/log/supervisor/postgresql.out.log\n\n[program:backend]\ncommand=pnpm run start\ndirectory=/app/backend\nuser=node\nautostart=true\nautorestart=true\nstderr_logfile=/var/log/supervisor/backend.err.log\nstdout_logfile=/var/log/supervisor/backend.out.log\nenvironment=DB=SingleDatabase,USER=admin,PASSWORD=admin,HOST=localhost,DIALECT=postgres,PORT=5432,HTTP_PORT=5000,secret=dev_secret_key_change_later,EMAIL=dev@example.com,EMAIL_PASSWORD=dev_email_password\n\n[program:nginx]\ncommand=/usr/sbin/nginx -g "daemon off;"\nautostart=true\nautorestart=true\nstderr_logfile=/var/log/supervisor/nginx.err.log\nstdout_logfile=/var/log/supervisor/nginx.out.log' > /etc/supervisord.conf

# Create database initialization script
RUN echo '#!/bin/bash\nset -e\n\n# Initialize PostgreSQL if data directory is empty\nif [ ! -s "/var/lib/postgresql/data/PG_VERSION" ]; then\n    echo "Initializing PostgreSQL database..."\n    su postgres -c '"'"'initdb -D /var/lib/postgresql/data --auth-local=trust --auth-host=md5'"'"'\n    \n    # Start PostgreSQL temporarily to set up database\n    su postgres -c '"'"'pg_ctl -D /var/lib/postgresql/data -l /var/log/postgresql.log start'"'"'\n    \n    # Wait for PostgreSQL to start\n    sleep 5\n    \n    # Create database and user\n    su postgres -c "createdb SingleDatabase"\n    su postgres -c "psql -c \"CREATE USER admin WITH PASSWORD '"'"'admin'"'"';\"""'\n    su postgres -c "psql -c \"ALTER USER admin CREATEDB;\""\n    su postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE SingleDatabase TO admin;\""\n    \n    # Import database if init.sql exists\n    if [ -f "/docker-entrypoint-initdb.d/init.sql" ]; then\n        echo "Importing database from init.sql..."\n        su postgres -c "psql -d SingleDatabase -f /docker-entrypoint-initdb.d/init.sql"\n    fi\n    \n    # Stop PostgreSQL\n    su postgres -c '"'"'pg_ctl -D /var/lib/postgresql/data stop'"'"'\nfi' > /docker-entrypoint-initdb.sh

# Make scripts executable
RUN chmod +x /docker-entrypoint-initdb.sh

# Create startup script
RUN echo '#!/bin/bash\nset -e\n\n# Initialize database if needed\n/docker-entrypoint-initdb.sh\n\n# Start all services with supervisord\nexec /usr/bin/supervisord -c /etc/supervisord.conf' > /startup.sh

RUN chmod +x /startup.sh

# Expose ports
EXPOSE 80 5432

# Start the application
CMD ["/startup.sh"]
