#!/bin/bash
# Database Backup Script for OrderLink
# Usage: ./scripts/db-backup.sh [output_dir]

set -e

# Load environment variables
if [ -f "../backend/.env" ]; then
    export $(grep -v '^#' ../backend/.env | xargs)
fi

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-orderlink}

OUTPUT_DIR=${1:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${OUTPUT_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "$OUTPUT_DIR"

echo "Starting backup of $DB_NAME..."
echo "Host: $DB_HOST:$DB_PORT"
echo "Output: $BACKUP_FILE"

mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    "$DB_NAME" > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"
echo "Backup completed: ${BACKUP_FILE}.gz"

# Keep only last 30 days
find "$OUTPUT_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +30 -delete
echo "Old backups cleaned (older than 30 days)"