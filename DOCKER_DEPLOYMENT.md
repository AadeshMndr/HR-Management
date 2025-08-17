# HR Management Application - Docker Deployment

This repository contains a single Dockerfile that builds and runs the entire HR Management application in one container, including:

- React frontend (built and served via Nginx)
- Node.js backend API
- PostgreSQL database
- Nginx reverse proxy

## Building the Application

To build the Docker image:

```bash
docker build -t hr-management-app .
```

## Running the Application

To run the application:

```bash
docker run -d -p 80:80 -p 5432:5432 --name hr-app hr-management-app
```

## Accessing the Application

- **Web Application**: http://localhost
- **Database** (if needed for external access): localhost:5432
  - Database: `SingleDatabase`
  - Username: `admin`
  - Password: `admin`

## Application Architecture

The Dockerfile uses a multi-stage build:

1. **Stage 1**: Builds the React frontend for production
2. **Stage 2**: Sets up the final image with:
   - Node.js backend
   - Built frontend files
   - PostgreSQL database
   - Nginx as reverse proxy
   - Supervisord to manage all processes

## Services Management

The application uses Supervisord to manage multiple services:
- PostgreSQL database server
- Node.js backend API server
- Nginx web server

## Environment Variables

The application runs with these default environment variables:
- `DB=SingleDatabase`
- `USER=admin`
- `PASSWORD=admin`
- `HOST=localhost`
- `DIALECT=postgres`
- `PORT=5432`
- `HTTP_PORT=5000`

## Persistent Data

For production deployments, you may want to mount a volume for PostgreSQL data:

```bash
docker run -d -p 80:80 -p 5432:5432 -v hr-data:/var/lib/postgresql/data --name hr-app hr-management-app
```

## Logs

Application logs are available via Docker:

```bash
# View all logs
docker logs hr-app

# Follow logs
docker logs -f hr-app
```

Individual service logs are stored in `/var/log/supervisor/` within the container.

## Stopping the Application

```bash
docker stop hr-app
docker rm hr-app
```
