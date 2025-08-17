# Database Setup

This folder contains the PostgreSQL database configuration and initialization files for the HR Management system.

## Files

- `docker-compose.yaml` - Docker configuration for PostgreSQL and Adminer
- `database_backup_pg15_fixed_utf8.sql` - Main database initialization script
- `database_backup.sql` - Alternative database backup file

## Starting the Database

To start the PostgreSQL database and Adminer UI panel:

```bash
cd database
docker-compose up -d
```

## Accessing the Database

### Adminer UI Panel
- URL: http://localhost:8080
- System: PostgreSQL
- Server: database
- Username: admin
- Password: admin
- Database: SingleDatabase

### Direct PostgreSQL Connection
- Host: localhost
- Port: 5432
- Username: admin
- Password: admin
- Database: SingleDatabase

## Stopping the Database

To stop the database services:

```bash
cd database
docker-compose down
```

To stop and remove all data:

```bash
cd database
docker-compose down -v
```

## Database Configuration

The database is configured with:
- PostgreSQL 15
- Username: `admin`
- Password: `admin`
- Database name: `SingleDatabase`
- Port: `5432`

The database will be automatically initialized with the data from `database_backup_pg15_fixed_utf8.sql` on first startup.
