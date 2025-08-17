FROM postgres:15

# Set environment variables
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=SingleDatabase

# Copy initialization script from backend directory
COPY ../backend/database_backup_pg15_fixed_utf8.sql /docker-entrypoint-initdb.d/init.sql

# Expose PostgreSQL port
EXPOSE 5432

# PostgreSQL runs automatically via the base image
