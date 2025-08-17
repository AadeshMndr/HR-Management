#!/bin/bash

# Script to stop the HR Management database

echo "🛑 Stopping HR Management Database..."

cd database
docker compose down

echo "✅ Database stopped"
